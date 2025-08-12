# 🚀 MongoDB Timestamp Migration Setup

This guide will help you add `created_at` and `updated_at` fields to your bibliography documents by extracting timestamps from MongoDB ObjectIds.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB connection string with write access
- Your bibliography collection name

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy `.env.example` to `.env.local` and fill in your real MongoDB credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual MongoDB connection details:

```env
# MongoDB Connection (REAL CREDENTIALS)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
MONGODB_DB=your_actual_database_name
MONGODB_COLLECTION=biblio_200419

# Migration Settings (adjust as needed)
MIGRATION_BATCH_SIZE=100
MIGRATION_DELAY=100
MIGRATION_MAX_RETRIES=3
MIGRATION_RETRY_DELAY=1000

# Logging
LOG_LEVEL=info
SHOW_PROGRESS=true
SHOW_ERRORS=true
```

### 3. Test Connection

First, run a preview to test your connection:

```bash
npm run migrate:timestamps preview
```

This will show you:
- Total documents in your collection
- How many already have timestamps
- How many need timestamps
- Sample documents that will be updated

## 🎯 Running the Migration

### Preview (Dry Run)
```bash
npm run migrate:timestamps preview
```

### Run Migration
```bash
npm run migrate:timestamps migrate
```

### Rollback (if needed)
```bash
npm run migrate:timestamps rollback
```

## 📊 What the Migration Does

1. **Connects to MongoDB** using your credentials
2. **Processes documents in batches** (default: 100 documents per batch)
3. **Extracts timestamps** from ObjectIds for each document
4. **Adds fields**:
   - `created_at`: Timestamp extracted from ObjectId
   - `updated_at`: Set to `null` (will be updated when users edit)
5. **Handles errors gracefully** with retry logic
6. **Provides progress tracking** and detailed logging

## ⚙️ Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MIGRATION_BATCH_SIZE` | 100 | Documents processed per batch |
| `MIGRATION_DELAY` | 100ms | Delay between batches |
| `MIGRATION_MAX_RETRIES` | 3 | Max retries per document |
| `MIGRATION_RETRY_DELAY` | 1000ms | Delay between retries |

## 🔍 How ObjectId Timestamps Work

MongoDB ObjectIds contain a 4-byte timestamp in the first 8 hex characters:

```
ObjectId: 507f1f77bcf86cd799439011
           ^^^^^^^^ = timestamp (first 8 chars)
           
Timestamp: 0x507f1f77 = 1354303607 (Unix timestamp)
Date: 2012-12-02T21:26:47.000Z
```

## 🚨 Safety Features

- **Dry run preview** before actual migration
- **Batch processing** to avoid memory issues
- **Retry logic** for failed operations
- **Rollback capability** to remove added fields
- **Progress tracking** with detailed logging
- **Error handling** with comprehensive reporting

## 📝 Example Output

```
🚀 Starting timestamp migration...
📊 Database: bibliography_db
📚 Collection: biblio_200419
⚙️  Batch size: 100
🔄 Max retries: 3
⏱️  Delay between batches: 100ms
────────────────────────────────────────────────────────────
✅ Connected to MongoDB
📈 Total documents to process: 1,247

🔄 Processing batch 1...
   ✅ Success: 100
   ❌ Errors: 0
   📊 Progress: 8.02% (100/1,247)
   🕐 Batch 1 completed

🔄 Processing batch 2...
   ✅ Success: 100
   ❌ Errors: 0
   📊 Progress: 16.04% (200/1,247)
   🕐 Batch 2 completed

...

────────────────────────────────────────────────────────────
🎉 Migration completed!
⏱️  Duration: 45.23 seconds
✅ Successfully processed: 1,247
❌ Errors: 0
📊 Total processed: 1,247
🔄 Batches processed: 13
🔌 MongoDB connection closed
```

## 🆘 Troubleshooting

### Connection Issues
- Verify your MongoDB URI in `.env.local`
- Check network connectivity to MongoDB
- Ensure your user has write permissions

### Permission Errors
- Make sure your MongoDB user has `update` permissions
- Check if the collection exists and is accessible

### Memory Issues
- Reduce `MIGRATION_BATCH_SIZE` (try 50 or 25)
- Increase `MIGRATION_DELAY` to slow down processing

## 🔄 After Migration

Once the migration is complete:

1. **Update your Bibliography type** to include the new fields:
```typescript
export interface Bibliography {
  _id?: string;
  created_at: Date;
  updated_at: Date | null;
  // ... other fields
}
```

2. **Update your components** to use the new timestamp fields instead of ObjectId extraction

3. **Set `updated_at`** when users edit bibliography entries

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your MongoDB connection
3. Try running with smaller batch sizes
4. Check the logs for detailed error information

---

**⚠️ Important**: Always test with a preview first and ensure you have a backup of your database before running the migration!
