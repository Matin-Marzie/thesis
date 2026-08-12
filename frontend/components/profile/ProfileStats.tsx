import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_COLORS } from '@/constants/App';
import { formatCompactNumber } from '@/utils/formatCompactNumber';

interface ProfileStatsProps {
  isDark: boolean;
  flag?: string;
  level: string;
  xp: number;
  coins: number;
  energy: number;
}

export function ProfileStats({ isDark, flag, level, xp, coins, energy }: ProfileStatsProps) {
  const cardStyle = [styles.card, isDark && { backgroundColor: DARK_COLORS.surface }];
  const statValueStyle = [styles.statValue, isDark && { color: DARK_COLORS.text }];
  const statLabelStyle = [styles.statLabel, isDark && { color: DARK_COLORS.textSecondary }];
  const dividerStyle = [styles.statDivider, isDark && { backgroundColor: DARK_COLORS.border }];

  return (
    <View style={cardStyle}>
      <View style={styles.statTile}>
        <Text style={styles.statIcon}>{flag || '🏳️'}</Text>
        <Text style={statValueStyle}>{level}</Text>
        <Text style={statLabelStyle}>Level</Text>
      </View>
      <View style={dividerStyle} />
      <View style={styles.statTile}>
        <Text style={styles.statIcon}>⭐</Text>
        <Text style={statValueStyle}>{formatCompactNumber(xp)}</Text>
        <Text style={statLabelStyle}>XP</Text>
      </View>
      <View style={dividerStyle} />
      <View style={styles.statTile}>
        <Text style={styles.statIcon}>🪙</Text>
        <Text style={statValueStyle}>{formatCompactNumber(coins)}</Text>
        <Text style={statLabelStyle}>Coins</Text>
      </View>
      <View style={dividerStyle} />
      <View style={styles.statTile}>
        <Text style={styles.statIcon}>⚡</Text>
        <Text style={statValueStyle}>{formatCompactNumber(energy)}</Text>
        <Text style={statLabelStyle}>Energy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 20,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#eee',
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
  },
});
