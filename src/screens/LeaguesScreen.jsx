import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { LeagueBadge } from '../components/LeagueBadge';
import { useAuthStore } from '../store/useAuthStore';
import { mockApi } from '../services/mockApi';
import { getLeagueForPoints, getNextLeague, LEAGUE_TIERS } from '../data/leagues';
import { colors, spacing, typography } from '../theme';

export function LeaguesScreen() {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    mockApi.getLeaderboard().then((data) => {
      if (!mounted) return;
      setEntries(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;
  const league = getLeagueForPoints(user.points);
  const nextLeague = getNextLeague(user.points);

  const leaderboard = [
    ...entries.filter((e) => e.userId !== user.id),
    {
      userId: user.id,
      name: user.name,
      avatarUri: user.avatarUri,
      points: user.points,
      isCurrentUser: true,
    },
  ].sort((a, b) => b.points - a.points);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Ligas</Text>
          <Text style={styles.subtitle}>Competir e subir de nível</Text>

          <Card glow style={styles.currentLeague}>
            <LeagueBadge tier={league} />
            <View style={styles.leagueInfo}>
              <Text style={styles.leagueName}>Liga {league.name}</Text>
              <Text style={styles.leaguePoints}>{user.points} pontos</Text>
              {nextLeague && (
                <Text style={styles.leagueNext}>
                  Faltam {nextLeague.minPoints - user.points} pontos para {nextLeague.name}
                </Text>
              )}
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Classificação</Text>
          {loading ? (
            <Text style={styles.empty}>Carregando magos...</Text>
          ) : (
            leaderboard.map((entry, i) => (
              <LeaderboardRow key={entry.userId} entry={entry} rank={i + 1} />
            ))
          )}

          <Text style={styles.sectionTitle}>Todas as ligas</Text>
          <View style={styles.tiers}>
            {LEAGUE_TIERS.map((tier) => (
              <View key={tier.id} style={styles.tierRow}>
                <Text style={styles.tierIcon}>{tier.icon}</Text>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierPoints}>{tier.minPoints}+ pts</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function LeaderboardRow({ entry, rank }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
  return (
    <Card style={[styles.row, entry.isCurrentUser && styles.rowCurrent]}>
      <Text style={styles.rank}>{medal}</Text>
      <Avatar uri={entry.avatarUri} name={entry.name} size={40} />
      <Text style={styles.rowName} numberOfLines={1}>
        {entry.name}
        {entry.isCurrentUser ? ' (você)' : ''}
      </Text>
      <Text style={styles.rowPoints}>⚡ {entry.points}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.lg },
  currentLeague: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  leagueInfo: { flex: 1 },
  leagueName: { color: colors.text, fontSize: typography.subheading, fontWeight: '700' },
  leaguePoints: { color: colors.gold, fontSize: typography.body, fontWeight: '700', marginTop: 2 },
  leagueNext: { color: colors.textMuted, fontSize: typography.small, marginTop: spacing.xs },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  empty: { color: colors.textFaint, fontSize: typography.caption, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowCurrent: { borderColor: colors.primary, borderWidth: 1.5 },
  rank: {
    width: 28,
    color: colors.textMuted,
    fontSize: typography.subheading,
    fontWeight: '700',
    textAlign: 'center',
  },
  rowName: { flex: 1, color: colors.text, fontSize: typography.body, fontWeight: '600' },
  rowPoints: { color: colors.gold, fontSize: typography.body, fontWeight: '700' },
  tiers: { gap: spacing.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  tierIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  tierName: { flex: 1, color: colors.text, fontSize: typography.body },
  tierPoints: { color: colors.textFaint, fontSize: typography.caption },
});
