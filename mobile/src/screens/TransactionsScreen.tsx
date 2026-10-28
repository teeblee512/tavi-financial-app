import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/tokens';

export function TransactionsScreen() {
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [search, setSearch] = useState('');

  const transactions = [
    { id: '1', name: 'Ada Chukwu', desc: 'Project milestone settlement', amount: '-₦25,000.00', isDebit: true, date: 'Today, 2:30 PM', ref: 'TXN20261027001' },
    { id: '2', name: 'Ada Chukwu', desc: 'Consulting fees reimbursement', amount: '+₦50,000.00', isDebit: false, date: 'Yesterday', ref: 'TXN20261027002' },
    { id: '3', name: 'Babajide Sanwo', desc: 'Catering deposit', amount: '-₦15,000.00', isDebit: true, date: '2 days ago', ref: 'TXN20261027003' },
    { id: '4', name: 'Eko Electricity', desc: 'Power recharge token', amount: '-₦12,500.00', isDebit: true, date: '4 days ago', ref: 'TXN20261027004' },
    { id: '5', name: 'Card Top-Up', desc: 'Simulated debit card funding', amount: '+₦100,000.00', isDebit: false, date: '5 days ago', ref: 'TXN20261027005' },
  ];

  const filtered = transactions.filter((t) => {
    if (filter === 'debit' && !t.isDebit) return false;
    if (filter === 'credit' && t.isDebit) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q);
    }
    return true;
  });

  const isAdaSearch = search.toLowerCase().includes('ada');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>Authoritative record of deposits, debits, and transfers</Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search counterparty (e.g. Ada Chukwu), narration..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'debit', 'credit'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
                {tab === 'all' ? 'All Activity' : tab === 'debit' ? 'Money Out' : 'Money In'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Counterparty Ada Chukwu Summary Banner */}
        {isAdaSearch && (
          <View style={styles.peerCard}>
            <Text style={styles.peerTitle}>Ada Chukwu • Peer Statement</Text>
            <View style={styles.peerMetrics}>
              <View>
                <Text style={styles.peerLabel}>Sent (Outbound)</Text>
                <Text style={styles.peerValue}>₦25,000.00</Text>
              </View>
              <View>
                <Text style={styles.peerLabel}>Received (Inbound)</Text>
                <Text style={[styles.peerValue, { color: COLORS.actionGreen }]}>₦50,000.00</Text>
              </View>
              <View>
                <Text style={styles.peerLabel}>Net Flow</Text>
                <Text style={[styles.peerValue, { color: COLORS.actionGreen }]}>+₦25,000.00</Text>
              </View>
            </View>
          </View>
        )}

        {/* Transaction Rows */}
        {filtered.map((t) => (
          <View key={t.id} style={styles.row}>
            <View style={styles.iconCircle}>
              <Text>{t.isDebit ? '↗️' : '↙️'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.desc}>{t.desc}</Text>
              <Text style={styles.date}>{t.date} • {t.ref}</Text>
            </View>
            <Text style={[styles.amount, { color: t.isDebit ? COLORS.midnightNavy : COLORS.actionGreen }]}>
              {t.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.appBg },
  scroll: { padding: SPACING.md },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.midnightNavy },
  subtitle: { fontSize: 11, color: COLORS.textMuted, marginBottom: SPACING.md },
  searchInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: SPACING.sm },
  filterRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.sm, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor },
  filterChipActive: { backgroundColor: COLORS.deepEmerald, borderColor: COLORS.deepEmerald },
  filterText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  filterTextActive: { color: COLORS.white, fontWeight: 'bold' },
  peerCard: { backgroundColor: COLORS.paleMint, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.actionGreen, marginBottom: SPACING.md },
  peerTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.deepEmerald, marginBottom: SPACING.xs },
  peerMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  peerLabel: { fontSize: 10, color: COLORS.textSecondary },
  peerValue: { fontSize: 13, fontWeight: 'bold', color: COLORS.midnightNavy, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderColor, marginBottom: SPACING.xs },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.appBg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: 'bold', color: COLORS.midnightNavy },
  desc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  date: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  amount: { fontSize: 14, fontWeight: 'bold' },
});
