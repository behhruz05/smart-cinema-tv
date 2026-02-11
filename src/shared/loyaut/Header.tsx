import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';

import { SearchIcon } from '../icons/SearchIcon';
import { VoiceIcon } from '../icons/VoiceIcon';
import { UserIcon } from '../icons/UserIcon';

export function Header() {
  const [dateTime, setDateTime] = useState('');

useEffect(() => {
  const updateTime = () => {
    const now = new Date();

    const weekdays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const months = [
      'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
      'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
    ];

    const weekday = weekdays[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formatted = `${weekday}, ${day} ${month} | ${hours}:${minutes}`;

    setDateTime(formatted);
  };

  updateTime();

  const interval = setInterval(updateTime, 1000); 
  return () => clearInterval(interval);
}, []);


  return (
    <View style={styles.container}>

      <View style={styles.left}>
        <Text style={styles.date}>{dateTime}</Text>
        <Text style={styles.weather}>☁️ +3°C</Text>
      </View>

      <View style={styles.right}>

        <View style={styles.searchContainer}>
          <SearchIcon size={18} color="#888" />

          <TextInput
            placeholder="Поиск"
            placeholderTextColor="#888"
            style={styles.input}
          />

          <VoiceIcon size={18} color="#888" />
        </View>

<View
style={styles.avatar}>
            <UserIcon
        size={18}
        color='#888'
        />
</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  date: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },

  weather: {
    fontSize: 14,
    color: '#aaa',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 250,
  },

  input: {
    flex: 1,
    color: 'white',
    marginHorizontal: 12,
    fontSize: 14,
  },

  avatar: {
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 11,
  },
});
