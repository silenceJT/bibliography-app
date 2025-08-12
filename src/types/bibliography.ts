export interface Bibliography {
  _id?: string;
  author: string;
  year: string;
  title: string;
  publication: string;
  publisher: string;
  biblio_name: string;
  language_published: string;
  language_researched: string;
  country_of_research: string;
  keywords: string;
  isbn: string;
  issn: string;
  url: string;
  date_of_entry: string;
  source: string;
  language_family: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BibliographyCreate
  extends Omit<Bibliography, "_id" | "created_at" | "updated_at"> {
  created_at: Date;
  updated_at: Date;
}

export interface BibliographyUpdate
  extends Partial<Omit<Bibliography, "_id" | "created_at" | "updated_at">> {
  updated_at: Date;
}

export interface BibliographySearchResult {
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BibliographyFilters {
  year?: string;
  publication?: string;
  publisher?: string;
  language_published?: string;
  language_researched?: string;
  country_of_research?: string;
  keywords?: string;
  biblio_name?: string;
  date_of_entry?: string;
  source?: string;
  language_family?: string;
}
