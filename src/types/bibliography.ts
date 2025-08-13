export interface Bibliography {
  _id?: string;
  author: string;
  year: number; // Changed from string | number to just number
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
  language_family?: string;
  created_at: string;
  updated_at: string | null;
}

// BRUTAL: Only keep what we actually use
export interface BibliographySearchResult {
  data: Bibliography[];
  total: number;
  page: number;
  totalPages: number;
}
