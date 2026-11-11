export interface Game {
  id: string;
  title: string;
  image: string;
  releaseYear: number;
  metacriticScore?: number;
  playtimeHours?: number;
  platforms: string[];
  genres: string[];
  description: string;
}
