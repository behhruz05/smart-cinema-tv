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
  SeriesDetail: { seriesId: string };
  TvPlayer: {
    channelId: string;
    streamUrl: string;
    channelName: string;
    logoUri?: string;
    currentProgramTitle?: string;
  };
  Player: {
    movieId?: string;
    episodeId?: string;
    sourceUri?: string;
    posterUri?: string;
    title: string;
    subtitle?: string;
    isLive?: boolean;
    durationSeconds?: number;
    preloadedStreamPayload?: {
      movie_id?: string;
      episode_id?: string;
      title?: string;
      stream_url: string;
      expires_at?: number;
      duration_seconds?: number;
      resume_position_seconds?: number;
      subtitles?: Array<{
        id: string;
        language: string;
        file_url: string;
      }>;
      audio_tracks?: Array<{
        id: string;
        language: string;
        file_url: string;
      }>;
    };
  };
};
