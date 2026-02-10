import React from 'react';
import { Text, View, Image } from 'react-native';
import Logo from '../../assets/imgs/Group.png';

export function AlloPlayBrand() {
  return (
    <View style={{ marginBottom: 40 }}>
      <Image
        source={Logo}
        style={{ width: 120, height: 40, resizeMode: 'contain' }}
      />
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>
        Allo play
      </Text>
    </View>
  );
}
