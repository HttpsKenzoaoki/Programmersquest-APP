export const LEAGUE_TIERS = [
  { id: 'bronze', name: 'Bronze', icon: '🥉', minPoints: 0, color: '#CD7F32', gradient: ['#CD7F32', '#A0522D'] },
  { id: 'silver', name: 'Prata', icon: '🥈', minPoints: 100, color: '#C0C0C0', gradient: ['#E5E7EB', '#9CA3AF'] },
  { id: 'gold', name: 'Ouro', icon: '🥇', minPoints: 300, color: '#FFD700', gradient: ['#FACC15', '#F59E0B'] },
  { id: 'sapphire', name: 'Safira', icon: '💎', minPoints: 600, color: '#38BDF8', gradient: ['#38BDF8', '#2563EB'] },
  { id: 'ruby', name: 'Rubi', icon: '🔮', minPoints: 1000, color: '#F87171', gradient: ['#F87171', '#BE123C'] },
  { id: 'diamond', name: 'Diamante', icon: '⚡', minPoints: 1500, color: '#A78BFA', gradient: ['#A78BFA', '#7C3AED'] },
  { id: 'master', name: 'Mestre Mago', icon: '🌟', minPoints: 2500, color: '#F0ABFC', gradient: ['#F0ABFC', '#C084FC'] },
];

export function getLeagueForPoints(points) {
  let current = LEAGUE_TIERS[0];
  for (const tier of LEAGUE_TIERS) {
    if (points >= tier.minPoints) {
      current = tier;
    }
  }
  return current;
}

export function getNextLeague(points) {
  const next = LEAGUE_TIERS.find((tier) => tier.minPoints > points);
  return next ?? null;
}
