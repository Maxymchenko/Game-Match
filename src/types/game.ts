export interface Game {
  id: string;
  igdbId: number;
  title: string;
  image?: string;
  releaseYear?: number;
  rating?: number;
  playtimeHours?: number;
  platforms: string[];
  genres: string[];
  themes?: string[];
  keywords?: string[];
  playerPerspectives?: string[];
  description: string;
}
