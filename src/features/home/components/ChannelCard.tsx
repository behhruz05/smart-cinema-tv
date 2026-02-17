import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const ChannelCard = ({ item }: any) => (
    <View style={styles.image}>
  {/* <Image source={{ uri: "https://drive.google.com/uc?export=view&id=1A2b3C4d5E6FgH"}}/> */}
 <Text style={styles.text}>
    {item.name}
 </Text>
    </View>
);

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 100,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
  },
  
  text: {
    color: "#fff",
    fontSize: 18
  }
});
