import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { RatingIconLeft } from '../icons/RatingIconLeft';
import { RatingIconRight } from '../icons/RatingIconRight';

interface RatingBadgeProps {
  rating?: number | string | null;
  style?: ViewStyle;
}

export function RatingBadge({ rating, style }: RatingBadgeProps) {
  const ratingValue = Number(rating);
  const showRating = Number.isFinite(ratingValue) && ratingValue > 0;

  if (!showRating) {
    return null;
  }

  const isHighRating = ratingValue >= 8;

  if (isHighRating) {
    return (
      <View style={[styles.base, styles.highContainer, style]}>
        <RatingIconLeft size={15} color="#D4AF37" />
        <Text style={styles.highText}>{ratingValue.toFixed(1)}</Text>
        <RatingIconRight size={15} color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={[styles.base, styles.lowContainer, style]}>
      <Text style={styles.lowText}>{ratingValue.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: 57,
  },
  highContainer: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.55)',
    gap: 4,
  },
  highText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  lowContainer: {
    backgroundColor: '#3D9E4A',
  },
  lowText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
