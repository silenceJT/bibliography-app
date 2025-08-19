/**
 * Mobile-specific utility functions for consistent API responses
 */

// Format dates for Swift compatibility
export const formatDateForMobile = (
  date: Date | string | undefined | null
): string | null => {
  if (!date) return null;

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    // Return ISO 8601 string with milliseconds precision
    // This format is fully compatible with Swift's Date decoder
    return dateObj.toISOString();
  } catch {
    return null;
  }
};

// Format bibliography data for mobile
export const formatBibliographyForMobile = (bibliography: any) => {
  return {
    ...bibliography,
    // Format all date fields - handle both camelCase and snake_case
    createdAt: formatDateForMobile(
      bibliography.createdAt || bibliography.created_at
    ),
    updatedAt: formatDateForMobile(
      bibliography.updatedAt || bibliography.updated_at
    ),
    // Handle nested date fields if they exist
    publicationDate: formatDateForMobile(bibliography.publicationDate),
    // Ensure _id is a string
    _id: bibliography._id?.toString() || bibliography._id,
  };
};

// Create consistent mobile API response
export const createMobileResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
) => {
  if (success) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      success: false,
      error: error || "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
};
