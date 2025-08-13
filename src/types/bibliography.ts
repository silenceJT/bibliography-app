export interface Bibliography {
  _id?: string;
  author: string;
  year: string;
  title: string;
  publication: string;
  publisher?: string;
  biblio_name?: string;
  language_published: string;
  language_researched?: string;
  country_of_research?: string;
  keywords?: string;
  isbn?: string;
  issn?: string;
  url?: string;
  date_of_entry?: string;
  language_family?: string;
  source?: string;
  created_at?: Date; // Not editable, auto-generated
  updated_at?: Date | null; // Not editable, auto-updated
}

// BRUTAL: Only keep what we actually use
export interface BibliographySearchResult {
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}
