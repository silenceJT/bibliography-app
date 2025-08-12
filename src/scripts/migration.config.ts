import { config } from "dotenv";

// Load environment variables - prioritize .env.local for real credentials
config({ path: ".env.local" });
config({ path: ".env" }); // fallback to .env if .env.local doesn't exist

export interface MigrationConfig {
  mongodb: {
    uri: string;
    dbName: string;
    collectionName: string;
  };
  migration: {
    batchSize: number;
    delayBetweenBatches: number; // milliseconds
    maxRetries: number;
    retryDelay: number; // milliseconds
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    showProgress: boolean;
    showErrors: boolean;
  };
}

export const migrationConfig: MigrationConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    dbName: process.env.MONGODB_DB || "test",
    collectionName: process.env.MONGODB_COLLECTION || "biblio_200419",
  },
  migration: {
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || "100"),
    delayBetweenBatches: parseInt(process.env.MIGRATION_DELAY || "100"),
    maxRetries: parseInt(process.env.MIGRATION_MAX_RETRIES || "3"),
    retryDelay: parseInt(process.env.MIGRATION_RETRY_DELAY || "1000"),
  },
  logging: {
    level:
      (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
    showProgress: process.env.SHOW_PROGRESS !== "false",
    showErrors: process.env.SHOW_ERRORS !== "false",
  },
};

// Validation
export function validateConfig(config: MigrationConfig): void {
  if (!config.mongodb.uri) {
    throw new Error("MONGODB_URI is required");
  }

  if (!config.mongodb.dbName) {
    throw new Error("MONGODB_DB is required");
  }

  if (!config.mongodb.collectionName) {
    throw new Error("MONGODB_COLLECTION is required");
  }

  if (config.migration.batchSize < 1 || config.migration.batchSize > 1000) {
    throw new Error("MIGRATION_BATCH_SIZE must be between 1 and 1000");
  }

  if (config.migration.delayBetweenBatches < 0) {
    throw new Error("MIGRATION_DELAY must be >= 0");
  }
}
