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
    console.error("Error parsing ObjectId timestamp:", error);
    return new Date(); // Fallback to current date
  }
}

/**
 * Check if an ObjectId is valid
 * @param objectId - String to validate
 * @returns boolean indicating if the string is a valid ObjectId
 */
export function isValidObjectId(objectId: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(objectId);
}

/**
 * Get relative time string from ObjectId timestamp
 * @param objectId - MongoDB ObjectId string
 * @returns Human-readable relative time string
 */
export function getRelativeTimeFromObjectId(objectId: string): string {
  const date = getObjectIdTimestamp(objectId);
  const now = new Date();

  // Calculate time difference directly (no need for timezone conversion for relative time)
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}

/**
 * Format date in Australian Eastern Time
 * @param date - Date object or date string
 * @returns Formatted date string in Australian timezone
 */
export function formatDateInAustralianTime(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }

    // Use toLocaleString with timezone for accurate conversion
    // The direct offset method can be problematic with daylight saving time
    return dateObj.toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting date in Australian time:", error);
    return "Invalid date";
  }
}

/**
 * Sort array by ObjectId timestamp (most recent first)
 * @param items - Array of items with _id field
 * @returns Sorted array with most recent items first
 */
export function sortByObjectIdTimestamp<T extends { _id: string }>(
  items: T[]
): T[] {
  return items.sort((a, b) => {
    const timestampA = getObjectIdTimestamp(a._id).getTime();
    const timestampB = getObjectIdTimestamp(b._id).getTime();
    return timestampB - timestampA; // Descending order (newest first)
  });
}
