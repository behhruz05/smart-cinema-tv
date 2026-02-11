export interface Movie {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  year: number;
  duration_seconds: number;
  age_rating: number;
  poster_url: string;
  imdb_rating: string;
}

export interface Carousel {
  id: string;
  movie_id: string;
  poster_url: string;
  order_number: number;
  movie: Movie;
}

export interface CarouselResponse {
  success: boolean;
  data: Carousel[];
}
