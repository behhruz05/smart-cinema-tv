import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Reel } from '../../service/reel.service';

interface Props {
  item: Reel;
}

export const ReelCard = ({ item }: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.card,
        focused && styles.focusedCard,
      ]}
    >
      <Image
        source={{ uri: item.poster_url }}
        style={styles.image}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
  },
  focusedCard: {
    borderColor: '#fff',
  },
  image: {
    width: 200,
    height: 250,
    borderRadius: 12,
  },
});
