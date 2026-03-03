import React from 'react';
import { ViewStyle } from 'react-native';
import { Movie } from '../../types/search';
import { Series } from '../../types/series';
import { MovieCard } from './MovieCard';

interface Props {
  movie: Movie | Series;
  contentType?: 'movie' | 'series';
  style?: ViewStyle;
}

export const NewMovieCard = React.memo(({ movie, contentType = 'movie', style }: Props) => (
  <MovieCard
    movie={movie}
    contentType={contentType}
    style={style}
    tall
  />
));
