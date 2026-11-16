export interface IgdbGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  cover?: { url: string };
  genres?: { id: number; name: string }[];
  themes?: { id: number; name: string }[];
  keywords?: { id: number; name: string }[];
  player_perspectives?: { id: number; name: string }[];
  platforms?: { id: number; name: string }[];
}
