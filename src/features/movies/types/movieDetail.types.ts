import { Movie, MovieDetail } from '../../../types/search';

export interface MovieDetailHeroProps {
  movie: MovieDetail;
  title: string;
  description: string;
  durationLabel: string;
  backLabel: string;
  watchLabel: string;
  onBack: () => void;
  onWatch: () => void;
}

export interface MovieDetailFactsProps {
  movie: MovieDetail;
  description: string;
  descriptionTitle: string;
  countryTitle: string;
  subtitlesTitle: string;
  qualitiesTitle: string;
  castTitle: string;
  directorsTitle: string;
  audioTitle: string;
  noDataLabel: string;
}

export interface MovieSimilarRailProps {
  title: string;
  movies: Movie[];
}
