export interface Bibliography {
  _id?: string;
  author: string;
  year: string;
  title: string;
  publication: string;
  language_published: string;
  country_of_research?: string;
  created_at?: Date; // Optional during transition period
  updated_at?: Date | null; // Optional during transition period
}

// BRUTAL: Only keep what we actually use
export interface BibliographySearchResult {
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}
