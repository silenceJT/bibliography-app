/**
 * Utility functions for working with MongoDB ObjectIds
 */

/**
 * Extract timestamp from MongoDB ObjectId
 * ObjectId contains a 4-byte timestamp (first 8 hex characters)
 * @param objectId - MongoDB ObjectId string
 * @returns Date object representing when the document was created
 */
export function getObjectIdTimestamp(objectId: string): Date {
  if (!objectId || objectId.length < 8) {
    return new Date();
  }
  const timestampHex = objectId.substring(0, 8);
  const timestamp = parseInt(timestampHex, 16);
  return new Date(timestamp * 1000);
}

/**
 * Get relative time string from ObjectId timestamp
 * @param objectId - MongoDB ObjectId string
 * @returns Human-readable relative time string
 */
export function getRelativeTimeFromObjectId(objectId: string): string {
  const date = getObjectIdTimestamp(objectId);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}
