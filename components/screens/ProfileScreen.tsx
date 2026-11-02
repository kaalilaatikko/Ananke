import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/theme';

/// TODO: poista, kun db tehty
const STATS = [
  { name: 'STRENGTH', level: 8, xp: 750, maxXp: 1000 },
  { name: 'ENDURANCE', level: 6, xp: 600, maxXp: 800 },
  { name: 'INTELLIGENCE', level: 10, xp: 1000, maxXp: 1000, evolves: true },
  { name: 'CHARISMA', level: 4, xp: 320, maxXp: 500 },
  { name: 'DISCIPLINE', level: 7, xp: 680, maxXp: 900 },
  { name: 'SOCIAL', level: 3, xp: 200, maxXp: 400 },
  { name: 'CREATIVITY', level: 5, xp: 420, maxXp: 600 },
  { name: 'MINDFULNESS', level: 9, xp: 890, maxXp: 950 },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
      <Text style={styles.eyebrow}>HENKILÖKOHTAINEN KEHITYS</Text>
      <Text style={styles.title}>Profiili</Text>

      <View style={styles.profileCard}>
        <View style={styles.profileBadge}>
          <Text style={styles.profileBadgeText}>A</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.cardLabel}>SEIKKAILIJA</Text>
          <Text style={styles.profileName}>Oma polku</Text>
          <Text style={styles.profileLevel}>TASO 08  ·  JATKA ETEENPÄIN</Text>
        </View>
        <Text style={styles.profileSpark}>✦</Text>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Ominaisuudet</Text>
        <Text style={styles.sectionMeta}>XP / TASO</Text>
      </View>

      <View style={styles.statsList}>
        {STATS.map((stat, index) => (
          <View
            key={stat.name}
            style={[styles.statRow, index === STATS.length - 1 && styles.lastStatRow]}
          >
            <View style={styles.statTopline}>
              <Text style={styles.statName}>{stat.name}</Text>
              <Text style={styles.statValue}>
                LV.{stat.level}
                <Text style={styles.statXp}>
                  {'  '}
                  {stat.evolves ? 'MAX? → EVOLVES' : `${stat.xp} / ${stat.maxXp} XP`}
                </Text>
              </Text>
            </View>
            <View style={styles.statTrack}>
              <View
                style={[
                  styles.statFill,
                  { width: `${Math.min((stat.xp / stat.maxXp) * 100, 100)}%` },
                  stat.evolves && styles.evolutionFill,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 30,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 9,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 5,
  },
  profileCard: {
    marginTop: 25,
    padding: 17,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentDark,
    borderWidth: 1,
    borderColor: '#2E7468',
  },
  profileBadgeText: {
    color: COLORS.accent,
    fontSize: 26,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },
  cardLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  profileLevel: {
    color: COLORS.accent,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  profileSpark: {
    color: COLORS.accent,
    fontSize: 19,
    alignSelf: 'flex-start',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionMeta: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsList: {
    paddingHorizontal: 15,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },
  statRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastStatRow: {
    borderBottomWidth: 0,
  },
  statTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  statName: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  statValue: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  statXp: {
    color: COLORS.muted,
    fontWeight: '500',
  },
  statTrack: {
    height: 5,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: COLORS.raised,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  evolutionFill: {
    backgroundColor: '#A3F2DE',
  },
});
