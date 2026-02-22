import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TvChannel } from '../../../types/tv';

interface Props {
  item: TvChannel;
}

export const ChannelCard = ({ item }: Props) => (
  <View style={styles.image}>
    <Text style={styles.text}>{item.name}</Text>
  </View>
);

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 100,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    borderRadius: 10,
  },

  text: {
    color: '#fff',
    fontSize: 18,
  },
});
