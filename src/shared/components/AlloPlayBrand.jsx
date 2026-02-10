import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import Logo from '../../assets/imgs/Group.png';

export function AlloPlayBrand() {
  return (
    <View style={styles.container}>
      <Image
        source={Logo}
        style={styles.logo}
      />
      <Text style={styles.text}>
        Allo play
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#010101',
  },

  logo: {
    width: 50,
    resizeMode: 'contain',
    marginRight: 4,
  },

  text: {
    color: '#fff',
    fontSize: 40,
  },
});
