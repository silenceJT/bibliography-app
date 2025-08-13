import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";
import {
  Bibliography,
  BibliographySearchResult,
} from "@/types/bibliography";

// Define local types for internal use
type BibliographyCreate = Omit<Bibliography, '_id'> & {
  created_at: Date;
  updated_at: Date;
};
type BibliographyUpdate = Partial<Omit<Bibliography, '_id' | 'created_at' | 'updated_at'>>;
type BibliographyFilters = Record<string, string>;

export class BibliographyService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db("test");
    return db.collection("biblio_200419");
  }

  static async createBibliography(
    data: BibliographyCreate
  ): Promise<Bibliography> {
    const collection = await this.getCollection();

    const newBibliography: BibliographyCreate = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collection.insertOne(newBibliography);
    return {
      ...newBibliography,
      _id: result.insertedId.toString(),
    } as Bibliography;
  }

  static async getBibliographyById(id: string): Promise<Bibliography | null> {
    const collection = await this.getCollection();
    const bibliography = await collection.findOne({ _id: new ObjectId(id) });
    return bibliography
      ? ({ ...bibliography, _id: bibliography._id.toString() } as Bibliography)
      : null;
  }

  static async updateBibliography(
    id: string,
    updates: BibliographyUpdate
  ): Promise<Bibliography | null> {
    const collection = await this.getCollection();

    const updateData = {
      ...updates,
      updated_at: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result.value
      ? ({ ...result.value, _id: result.value._id.toString() } as Bibliography)
      : null;
  }

  static async deleteBibliography(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async getAllBibliographies(
    page: number = 1,
    limit: number = 20,
    sortBy: string = "created_at",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<BibliographySearchResult> {
    const collection = await this.getCollection();

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      collection
        .find({})
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({}),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((item) => ({ ...item, _id: item._id.toString() })),
      total,
      page,
      totalPages,
    };
  }

  static async searchBibliographies(
    query: string,
    filters: BibliographyFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<BibliographySearchResult> {
    const collection = await this.getCollection();

    // Build search query efficiently
    const searchQuery: Record<string, unknown> = {};

    // Add text search if query exists
    if (query.trim()) {
      searchQuery.$or = [
        { title: { $regex: query.trim(), $options: "i" } },
        { author: { $regex: query.trim(), $options: "i" } },
        { publication: { $regex: query.trim(), $options: "i" } },
        { keywords: { $regex: query.trim(), $options: "i" } },
      ];
    }

    // Add filters efficiently - all filters use simple logic
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        if (key === "year") {
          // Simple year filtering - support ranges and exact matches
          const yearValue = value.trim();
          
          if (yearValue.includes("-")) {
            const [startYear, endYear] = yearValue.split("-").map(y => parseInt(y.trim()));
            if (!isNaN(startYear) && !isNaN(endYear) && startYear <= endYear) {
              searchQuery[key] = { $gte: startYear, $lte: endYear };
            }
          } else {
            const year = parseInt(yearValue);
            if (!isNaN(year)) {
              searchQuery[key] = year;
            }
          }
        } else {
          searchQuery[key] = { $regex: value.trim(), $options: "i" };
        }
      }
    });

    const skip = (page - 1) * limit;

    // Execute search and count in parallel
    const [data, total] = await Promise.all([
      collection
        .find(searchQuery)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((item) => ({ ...item, _id: item._id.toString() })),
      total,
      page,
      totalPages,
    };
  }

  static async getNextBibliography(
    currentId: string
  ): Promise<Bibliography | null> {
    const collection = await this.getCollection();
    const bibliography = await collection.findOne(
      { _id: { $gt: new ObjectId(currentId) } },
      { sort: { _id: 1 }, limit: 1 }
    );
    return bibliography
      ? { ...bibliography, _id: bibliography._id.toString() }
      : null;
  }

  static async getPreviousBibliography(
    currentId: string
  ): Promise<Bibliography | null> {
    const collection = await this.getCollection();
    const bibliography = await collection.findOne(
      { _id: { $lt: new ObjectId(currentId) } },
      { sort: { _id: -1 }, limit: 1 }
    );
    return bibliography
      ? { ...bibliography, _id: bibliography._id.toString() }
      : null;
  }

  static async exportToCSV(filters: BibliographyFilters = {}): Promise<string> {
    const collection = await this.getCollection();

    // Build search query similar to search
    const searchQuery: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        searchQuery[key] = { $regex: value, $options: "i" };
      }
    });

    const data = await collection.find(searchQuery).toArray();

    // Convert to CSV
    const headers = [
      "Author",
      "Year",
      "Title",
      "Publication",
      "Publisher",
      "Biblio Name",
      "Language Published",
      "Language Researched",
      "Country of Research",
      "Keywords",
      "ISBN",
      "ISSN",
      "URL",
      "Date of Entry",
      "Source",
      "Language Family",
    ];

    const csvRows = [
      headers.join(","),
      ...data.map((item) =>
        [
          `"${item.author || ""}"`,
          `"${item.year || ""}"`,
          `"${item.title || ""}"`,
          `"${item.publication || ""}"`,
          `"${item.publisher || ""}"`,
          `"${item.biblio_name || ""}"`,
          `"${item.language_published || ""}"`,
          `"${item.language_researched || ""}"`,
          `"${item.country_of_research || ""}"`,
          `"${item.keywords || ""}"`,
          `"${item.isbn || ""}"`,
          `"${item.issn || ""}"`,
          `"${item.url || ""}"`,
          `"${item.date_of_entry || ""}"`,
          `"${item.source || ""}"`,
          `"${item.language_family || ""}"`,
        ].join(",")
      ),
    ];

    return csvRows.join("\n");
  }
}
