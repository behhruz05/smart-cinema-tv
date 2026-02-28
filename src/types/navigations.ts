import { NavigatorScreenParams } from '@react-navigation/native';

export type ContentStackParamList = {
  Home: undefined;
  TV: undefined;
  Movies: undefined;
  Reels: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<ContentStackParamList>;
  Search: undefined;
  Genre: {
    genreId: string;
    genreName: string;
    slug: string;
  };
  MovieDetail: { movieId: string };
  Player: {
    movieId?: string;
    episodeId?: string;
    sourceUri?: string;
    posterUri?: string;
    title: string;
    subtitle?: string;
    isLive?: boolean;
    durationSeconds?: number;
  };
};
