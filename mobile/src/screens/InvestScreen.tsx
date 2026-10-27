import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/tokens';

export function InvestScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [search, setSearch] = useState('');

  const stocks = [
    { symbol: 'DANGCEM', name: 'Dangote Cement Plc', price: '₦650.00', change: '+2.36%' },
    { symbol: 'GTCO', name: 'Guaranty Trust Holding Co.', price: '₦52.10', change: '+1.15%' },
    { symbol: 'AIRTELAFRI', name: 'Airtel Africa Plc', price: '₦2,200.00', change: '-0.45%' },
    { symbol: 'MTNN', name: 'MTN Nigeria Communications', price: '₦215.00', change: '+3.12%' },
    { symbol: 'ZENITHBANK', name: 'Zenith Bank Plc', price: '₦41.20', change: '-1.05%' },
  ];

  const handleUnlock = () => {
    if (pin.length === 4) {
      setIsUnlocked(true);
      setPin('');
    } else {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit Investment PIN.');
    }
  };

  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.lockContainer}>
        <View style={styles.lockCard}>
          <Text style={styles.lockEmoji}>🔐</Text>
          <Text style={styles.lockTitle}>TAVI Invest Brokerage</Text>
          <Text style={styles.lockSubtitle}>
            Protected Investment Workspace. Enter your 4-digit Investment PIN to access your portfolio and trade NGX equities.
          </Text>

          <TextInput
            style={styles.pinInput}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            placeholder="••••"
            value={pin}
            onChangeText={setPin}
          />

          <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
            <Text style={styles.unlockBtnText}>Unlock Brokerage</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>TAVI Invest</Text>
            <Text style={styles.subtitle}>Nigerian Exchange (NGX) & TAVI Indices</Text>
          </View>
          <TouchableOpacity style={styles.lockAction} onPress={() => setIsUnlocked(false)}>
            <Text style={styles.lockActionText}>🔒 Lock</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portLabel}>Portfolio Valuation</Text>
          <Text style={styles.portValue}>₦1,850,400.00</Text>
          <Text style={styles.portGreen}>+₦228,400.00 (+14.2%) Total Return</Text>
        </View>

        {/* Market Status Countdown Pill */}
        <View style={styles.marketPill}>
          <Text style={styles.marketText}>🟢 NGX Market Active • Closes in 2h 45m (WAT)</Text>
        </View>

        {/* TAVI Indices */}
        <Text style={styles.sectionTitle}>TAVI Index Family</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indexScroll}>
          {[
            { name: 'TAVI 15', level: '1,245.80', change: '+1.42%' },
            { name: 'TAVI 30', level: '2,180.40', change: '+0.88%' },
            { name: 'TAVI DIV30', level: '980.20', change: '+1.12%' },
          ].map((idx) => (
            <View key={idx.name} style={styles.indexCard}>
              <Text style={styles.indexName}>{idx.name}</Text>
              <Text style={styles.indexLevel}>{idx.level}</Text>
              <Text style={styles.indexChange}>{idx.change}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Search & Stock List */}
        <Text style={styles.sectionTitle}>NGX Equities</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ticker (e.g. DANGCEM, GTCO)..."
          value={search}
          onChangeText={setSearch}
        />

        {stocks
          .filter((s) => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
          .map((s) => (
            <View key={s.symbol} style={styles.stockRow}>
              <View>
                <Text style={styles.stockSymbol}>{s.symbol}</Text>
                <Text style={styles.stockName}>{s.name}</Text>
              </View>
              <View style={styles.stockPriceContainer}>
                <Text style={styles.stockPrice}>{s.price}</Text>
                <Text style={s.change.startsWith('+') ? styles.stockGreen : styles.stockRed}>
                  {s.change}
                </Text>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.appBg },
  scroll: { padding: SPACING.md },
  lockContainer: { flex: 1, backgroundColor: COLORS.deepEmerald, justifyContent: 'center', padding: SPACING.lg },
  lockCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center' },
  lockEmoji: { fontSize: 36, marginBottom: SPACING.xs },
  lockTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.midnightNavy },
  lockSubtitle: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.sm, lineHeight: 18 },
  pinInput: { borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: RADIUS.md, fontSize: 26, width: 140, textAlign: 'center', paddingVertical: 8, letterSpacing: 8, marginVertical: SPACING.md },
  unlockBtn: { backgroundColor: COLORS.actionGreen, width: '100%', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center' },
  unlockBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.midnightNavy },
  subtitle: { fontSize: 11, color: COLORS.textMuted },
  lockAction: { backgroundColor: COLORS.paleMint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm },
  lockActionText: { color: COLORS.actionGreen, fontWeight: 'bold', fontSize: 11 },
  portfolioCard: { backgroundColor: COLORS.midnightNavy, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  portLabel: { color: COLORS.mint, fontSize: 11 },
  portValue: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginVertical: 4 },
  portGreen: { color: '#34D399', fontSize: 12, fontWeight: 'bold' },
  marketPill: { backgroundColor: COLORS.paleMint, padding: 8, borderRadius: RADIUS.sm, alignItems: 'center', marginBottom: SPACING.md },
  marketText: { color: COLORS.actionGreen, fontSize: 11, fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.midnightNavy, marginVertical: SPACING.xs },
  indexScroll: { marginBottom: SPACING.md },
  indexCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderColor, width: 130 },
  indexName: { fontSize: 11, color: COLORS.textSecondary, fontWeight: 'bold' },
  indexLevel: { fontSize: 16, fontWeight: '800', color: COLORS.midnightNavy, marginVertical: 2 },
  indexChange: { fontSize: 11, color: COLORS.actionGreen, fontWeight: 'bold' },
  searchInput: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, marginBottom: SPACING.sm },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderColor, marginBottom: SPACING.xs },
  stockSymbol: { fontSize: 14, fontWeight: 'bold', color: COLORS.midnightNavy },
  stockName: { fontSize: 11, color: COLORS.textMuted },
  stockPriceContainer: { alignItems: 'flex-end' },
  stockPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.midnightNavy },
  stockGreen: { fontSize: 11, color: COLORS.actionGreen, fontWeight: 'bold' },
  stockRed: { fontSize: 11, color: COLORS.danger, fontWeight: 'bold' },
});
