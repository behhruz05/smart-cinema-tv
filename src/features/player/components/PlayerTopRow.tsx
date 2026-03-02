import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BackIcon } from '../../../shared/icons/BackIcon';

type PlayerTopRowProps = {
  isTV: boolean;
  focusedControl: 'back' | null;
  onFocusControl: (control: 'back' | null) => void;
  onBackPress: () => void;
  title: string;
  subtitle?: string;
  isLive: boolean;
  liveLabel: string;
  styles: any;
};

export const PlayerTopRow = React.memo(function PlayerTopRow({
  isTV,
  focusedControl,
  onFocusControl,
  onBackPress,
  title,
  subtitle,
  isLive,
  liveLabel,
  styles,
}: PlayerTopRowProps) {
  return (
    <View style={styles.topRow}>
      <Pressable
        focusable={isTV}
        hasTVPreferredFocus={isTV}
        onFocus={() => onFocusControl('back')}
        onBlur={() => onFocusControl(null)}
        onPress={onBackPress}
        style={[styles.roundControl, focusedControl === 'back' && styles.focusedControl]}
      >
        <BackIcon size={22} color="#fff" filled />
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      <View style={styles.rightInfoWrap}>
        {isLive ? <Text style={styles.liveChip}>{liveLabel}</Text> : null}
        <Text style={styles.clock}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
});
