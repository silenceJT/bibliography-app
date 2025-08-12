#!/usr/bin/env ts-node

import { MongoClient } from "mongodb";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

async function checkMigration() {
  const client = new MongoClient(
    process.env.MONGODB_URI || "mongodb://localhost:27017"
  );

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(process.env.MONGODB_DB || "test");
    const collection = db.collection(
      process.env.MONGODB_COLLECTION || "biblio_200419"
    );

    // Check total documents
    const total = await collection.countDocuments({});
    console.log(`📊 Total documents: ${total.toLocaleString()}`);

    // Check documents with created_at
    const withCreatedAt = await collection.countDocuments({
      created_at: { $exists: true },
    });
    console.log(
      `✅ Documents with created_at: ${withCreatedAt.toLocaleString()}`
    );

    // Check documents without created_at
    const withoutCreatedAt = await collection.countDocuments({
      created_at: { $exists: false },
    });
    console.log(
      `❌ Documents without created_at: ${withoutCreatedAt.toLocaleString()}`
    );

    // Sample a few documents to see the structure
    console.log("\n📋 Sample documents:");
    const samples = await collection.find({}).limit(3).toArray();

    samples.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log(`  _id: ${doc._id}`);
      console.log(
        `  created_at: ${doc.created_at} (type: ${typeof doc.created_at})`
      );
      console.log(
        `  updated_at: ${doc.updated_at} (type: ${typeof doc.updated_at})`
      );
      console.log(`  title: ${doc.title}`);
    });

    // Check if there are any documents with invalid created_at values
    const invalidDates = await collection.countDocuments({
      created_at: { $exists: true, $type: "string" },
    });
    console.log(
      `\n⚠️  Documents with string created_at: ${invalidDates.toLocaleString()}`
    );

    const validDates = await collection.countDocuments({
      created_at: { $exists: true, $type: "date" },
    });
    console.log(
      `✅ Documents with Date created_at: ${validDates.toLocaleString()}`
    );
  } catch (error) {
    console.error("💥 Error:", error);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

checkMigration().catch(console.error);
