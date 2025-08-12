#!/usr/bin/env ts-node

import { MongoClient, ObjectId, Collection } from "mongodb";
import { migrationConfig, validateConfig } from "./migration.config";

interface MigrationResult {
  totalDocuments: number;
  processedDocuments: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ documentId: string; error: string; retries: number }>;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  batchesProcessed: number;
}

interface BibliographyDocument {
  _id: ObjectId;
  created_at?: Date;
  [key: string]: unknown;
}

class TimestampMigration {
  private client: MongoClient;
  private config: typeof migrationConfig;

  constructor() {
    this.config = migrationConfig;
    this.client = new MongoClient(this.config.mongodb.uri);
  }

  /**
   * Extract timestamp from MongoDB ObjectId
   * @param objectId - MongoDB ObjectId string
   * @returns Date object representing when the document was created
   */
  private extractTimestampFromObjectId(objectId: string): Date {
    try {
      if (!objectId || objectId.length < 8) {
        throw new Error("Invalid ObjectId format");
      }

      // ObjectId timestamp is the first 4 bytes (8 hex characters)
      const timestampHex = objectId.substring(0, 8);
      const timestamp = parseInt(timestampHex, 16);

      if (isNaN(timestamp)) {
        throw new Error("Invalid timestamp in ObjectId");
      }

      return new Date(timestamp * 1000); // Convert seconds to milliseconds
    } catch (error) {
      throw new Error(`Failed to extract timestamp from ObjectId: ${error}`);
    }
  }

  /**
   * Validate ObjectId format
   */
  private isValidObjectId(objectId: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(objectId);
  }

  /**
   * Process a single document with retry logic
   */
  private async processDocumentWithRetry(
    collection: Collection<BibliographyDocument>,
    document: BibliographyDocument,
    maxRetries: number = 3
  ): Promise<{ success: boolean; error?: string; retries: number }> {
    let lastError: string | undefined;
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        const documentId = document._id.toString();

        // Skip if already has created_at field
        if (document.created_at) {
          return { success: true, retries };
        }

        // Validate ObjectId
        if (!this.isValidObjectId(documentId)) {
          throw new Error("Invalid ObjectId format");
        }

        // Extract timestamp from ObjectId
        const createdTimestamp = this.extractTimestampFromObjectId(documentId);

        // Prepare update data
        const updateData = {
          created_at: createdTimestamp,
          updated_at: null, // Will be set when user edits
        };

        // Update the document
        const result = await collection.updateOne(
          { _id: document._id },
          { $set: updateData }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Document was not modified");
        }

        return { success: true, retries };
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";
        retries++;

        if (retries <= maxRetries) {
          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.migration.retryDelay)
          );
        }
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} retries: ${lastError}`,
      retries,
    };
  }

  /**
   * Process documents in batches
   */
  private async processBatch(
    collection: Collection<BibliographyDocument>,
    documents: BibliographyDocument[]
  ): Promise<{
    success: number;
    errors: Array<{ documentId: string; error: string; retries: number }>;
  }> {
    let successCount = 0;
    const errors: Array<{
      documentId: string;
      error: string;
      retries: number;
    }> = [];

    // Process documents in parallel with concurrency limit
    const concurrencyLimit = 10;
    const chunks = [];

    for (let i = 0; i < documents.length; i += concurrencyLimit) {
      chunks.push(documents.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (document) => {
        const result = await this.processDocumentWithRetry(
          collection,
          document,
          this.config.migration.maxRetries
        );

        if (result.success) {
          successCount++;
        } else {
          errors.push({
            documentId: document._id.toString(),
            error: result.error || "Unknown error",
            retries: result.retries,
          });
        }
      });

      await Promise.all(promises);
    }

    return { success: successCount, errors };
  }

  /**
   * Run the migration
   */
  async migrate(): Promise<MigrationResult> {
    const result: MigrationResult = {
      totalDocuments: 0,
      processedDocuments: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      startTime: new Date(),
      batchesProcessed: 0,
    };

    try {
      // Validate configuration
      validateConfig(this.config);

      console.log("🚀 Starting timestamp migration...");
      console.log(`📊 Database: ${this.config.mongodb.dbName}`);
      console.log(`📚 Collection: ${this.config.mongodb.collectionName}`);
      console.log(`⚙️  Batch size: ${this.config.migration.batchSize}`);
      console.log(`🔄 Max retries: ${this.config.migration.maxRetries}`);
      console.log(
        `⏱️  Delay between batches: ${this.config.migration.delayBetweenBatches}ms`
      );
      console.log("─".repeat(60));

      // Connect to MongoDB
      await this.client.connect();
      console.log("✅ Connected to MongoDB");

      const db = this.client.db(this.config.mongodb.dbName);
      const collection = db.collection<BibliographyDocument>(
        this.config.mongodb.collectionName
      );

      // Get total document count
      result.totalDocuments = await collection.countDocuments({});
      console.log(
        `📈 Total documents to process: ${result.totalDocuments.toLocaleString()}`
      );

      if (result.totalDocuments === 0) {
        console.log("⚠️  No documents found in collection");
        return result;
      }

      // Process documents in batches
      let skip = 0;
      let batchNumber = 1;

      while (skip < result.totalDocuments) {
        console.log(`\n🔄 Processing batch ${batchNumber}...`);

        // Fetch batch of documents
        const documents = await collection
          .find({})
          .skip(skip)
          .limit(this.config.migration.batchSize)
          .toArray();

        if (documents.length === 0) break;

        // Process batch
        const batchResult = await this.processBatch(collection, documents);

        // Update overall results
        result.successCount += batchResult.success;
        result.errorCount += batchResult.errors.length;
        result.errors.push(...batchResult.errors);
        result.processedDocuments += documents.length;
        result.batchesProcessed = batchNumber;

        // Log batch progress
        const progress = (
          (result.processedDocuments / result.totalDocuments) *
          100
        ).toFixed(2);
        console.log(`   ✅ Success: ${batchResult.success}`);
        console.log(`   ❌ Errors: ${batchResult.errors.length}`);
        console.log(
          `   📊 Progress: ${progress}% (${result.processedDocuments}/${result.totalDocuments})`
        );
        console.log(`   🕐 Batch ${batchNumber} completed`);

        skip += this.config.migration.batchSize;
        batchNumber++;

        // Delay between batches to prevent overwhelming the database
        if (this.config.migration.delayBetweenBatches > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.migration.delayBetweenBatches)
          );
        }
      }

      // Finalize results
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();

      console.log("\n" + "─".repeat(60));
      console.log("🎉 Migration completed!");
      console.log(
        `⏱️  Duration: ${(result.duration / 1000).toFixed(2)} seconds`
      );
      console.log(
        `✅ Successfully processed: ${result.successCount.toLocaleString()}`
      );
      console.log(`❌ Errors: ${result.errorCount.toLocaleString()}`);
      console.log(
        `📊 Total processed: ${result.processedDocuments.toLocaleString()}`
      );
      console.log(`🔄 Batches processed: ${result.batchesProcessed}`);

      if (result.errors.length > 0) {
        console.log("\n⚠️  Errors encountered:");
        result.errors.slice(0, 10).forEach((error) => {
          console.log(
            `   - ${error.documentId}: ${error.error} (${error.retries} retries)`
          );
        });
        if (result.errors.length > 10) {
          console.log(`   ... and ${result.errors.length - 10} more errors`);
        }
      }
    } catch (error) {
      console.error("💥 Migration failed:", error);
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
    } finally {
      // Close connection
      await this.client.close();
      console.log("🔌 MongoDB connection closed");
    }

    return result;
  }

  /**
   * Rollback migration (remove created_at and updated_at fields)
   */
  async rollback(): Promise<void> {
    try {
      console.log("🔄 Starting rollback...");

      await this.client.connect();
      const db = this.client.db(this.config.mongodb.dbName);
      const collection = db.collection<BibliographyDocument>(
        this.config.mongodb.collectionName
      );

      const result = await collection.updateMany(
        {},
        { $unset: { created_at: "", updated_at: "" } }
      );

      console.log(
        `✅ Rollback completed: ${result.modifiedCount} documents updated`
      );
    } catch (error) {
      console.error("💥 Rollback failed:", error);
    } finally {
      await this.client.close();
    }
  }

  /**
   * Preview what will be migrated (dry run)
   */
  async preview(): Promise<void> {
    try {
      console.log("👀 Migration preview (dry run)...");

      await this.client.connect();
      const db = this.client.db(this.config.mongodb.dbName);
      const collection = db.collection<BibliographyDocument>(
        this.config.mongodb.collectionName
      );

      const totalDocuments = await collection.countDocuments({});
      const documentsWithTimestamps = await collection.countDocuments({
        created_at: { $exists: true },
      });
      const documentsWithoutTimestamps =
        totalDocuments - documentsWithTimestamps;

      console.log(`📊 Total documents: ${totalDocuments.toLocaleString()}`);
      console.log(
        `✅ Already have timestamps: ${documentsWithTimestamps.toLocaleString()}`
      );
      console.log(
        `🔄 Need timestamps: ${documentsWithoutTimestamps.toLocaleString()}`
      );

      if (documentsWithoutTimestamps > 0) {
        console.log("\n📋 Sample documents that will be updated:");
        const sampleDocs = await collection
          .find({ created_at: { $exists: false } })
          .limit(5)
          .toArray();

        sampleDocs.forEach((doc, index) => {
          const timestamp = this.extractTimestampFromObjectId(
            doc._id.toString()
          );
          console.log(
            `   ${index + 1}. ${doc._id} -> ${timestamp.toISOString()}`
          );
        });
      }
    } catch (error) {
      console.error("💥 Preview failed:", error);
    } finally {
      await this.client.close();
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const migration = new TimestampMigration();

  switch (command) {
    case "migrate":
      console.log("🚀 Running timestamp migration...");
      await migration.migrate();
      break;

    case "rollback":
      console.log("🔄 Running rollback...");
      await migration.rollback();
      break;

    case "preview":
      console.log("👀 Running preview...");
      await migration.preview();
      break;

    default:
      console.log(
        "Usage: npm run migrate:timestamps [migrate|rollback|preview]"
      );
      console.log("");
      console.log("Commands:");
      console.log(
        "  migrate   - Add created_at and updated_at fields to all documents"
      );
      console.log(
        "  rollback  - Remove created_at and updated_at fields from all documents"
      );
      console.log("  preview   - Show what will be migrated (dry run)");
      console.log("");
      console.log("Example:");
      console.log("  npm run migrate:timestamps preview");
      console.log("  npm run migrate:timestamps migrate");
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TimestampMigration };
