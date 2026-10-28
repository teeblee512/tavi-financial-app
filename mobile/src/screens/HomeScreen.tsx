import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/tokens';

export function HomeScreen({ navigation }: any) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const availableBalance = '₦485,250.00';
  const pendingFunds = '₦15,000.00';

  const copyAccount = () => {
    Alert.alert('Account Copied', 'Providus Bank account 9920394811 copied to clipboard (Demo).');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepEmerald} />

      {/* Demo Mode Pill */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoText}>🔒 DEMO MODE — All data simulated</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Deep Emerald Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good afternoon,</Text>
              <Text style={styles.userName}>Amara Okonkwo</Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Focal Available Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceValue}>
                {balanceVisible ? availableBalance : '••••••••'}
              </Text>
              <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                <Text style={styles.eyeIcon}>{balanceVisible ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.pendingText}>Pending: {pendingFunds}</Text>
          </View>
        </View>

        {/* Account Details Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <Text style={styles.providerName}>Providus Bank</Text>
            <Text style={styles.activePill}>ACTIVE</Text>
          </View>
          <Text style={styles.accountNumber}>9920 3948 11</Text>
          <View style={styles.accountActions}>
            <TouchableOpacity style={styles.copyBtn} onPress={copyAccount}>
              <Text style={styles.btnText}>📋 Copy Number</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={() => Alert.alert('Share', 'Share simulated account details')}>
              <Text style={styles.btnText}>🔗 Share Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SendMoney')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>↗️</Text>
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddMoney')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>➕</Text>
            </View>
            <Text style={styles.actionLabel}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('RequestMoney')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>📥</Text>
            </View>
            <Text style={styles.actionLabel}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Transactions')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionEmoji}>📄</Text>
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Summary 2x2 Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeader}>Monthly Spending</Text>
            <Text style={styles.summaryAmount}>₦105,000.00</Text>
            <Text style={styles.summarySub}>Budget: ₦250k</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeader}>Upcoming Reminders</Text>
            <Text style={styles.summaryAmount}>₦45,000.00</Text>
            <Text style={styles.summarySub}>2 bills due</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeader}>Portfolio Value</Text>
            <Text style={styles.summaryAmount}>₦1,850,400.00</Text>
            <Text style={styles.summaryGreen}>+14.2% Overall</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeader}>Indicative FX Rate</Text>
            <Text style={styles.summaryAmount}>₦1,485.50</Text>
            <Text style={styles.summarySub}>USD / NGN</Text>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {[
          { id: '1', title: 'Ada Chukwu', desc: 'Consulting fees', amount: '-₦25,000.00', isDebit: true, date: 'Today, 2:30 PM' },
          { id: '2', title: 'Ada Chukwu', desc: 'Reimbursement', amount: '+₦50,000.00', isDebit: false, date: 'Yesterday' },
          { id: '3', title: 'MTN Airtime', desc: 'Utility payment', amount: '-₦2,000.00', isDebit: true, date: '2 days ago' },
        ].map((item) => (
          <View key={item.id} style={styles.txRow}>
            <View style={styles.txIcon}>
              <Text>{item.isDebit ? '↗️' : '↙️'}</Text>
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txDesc}>{item.desc} • {item.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.isDebit ? COLORS.midnightNavy : COLORS.actionGreen }]}>
              {item.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  demoBanner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 3,
    alignItems: 'center',
  },
  demoText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.deepEmerald,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greeting: {
    color: COLORS.mint,
    fontSize: 12,
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  balanceContainer: {
    marginTop: SPACING.xs,
  },
  balanceLabel: {
    color: COLORS.mint,
    fontSize: 12,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
  },
  eyeIcon: {
    fontSize: 18,
    color: COLORS.white,
  },
  pendingText: {
    color: 'rgba(209, 250, 229, 0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SPACING.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activePill: {
    backgroundColor: COLORS.paleMint,
    color: COLORS.actionGreen,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  accountNumber: {
    color: COLORS.midnightNavy,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginVertical: SPACING.xs,
  },
  accountActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  copyBtn: {
    flex: 1,
    backgroundColor: COLORS.paleMint,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: COLORS.appBg,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  btnText: {
    color: COLORS.actionGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: 6,
    elevation: 1,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.midnightNavy,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.midnightNavy,
    marginBottom: SPACING.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  summaryHeader: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.midnightNavy,
    marginVertical: 4,
  },
  summarySub: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  summaryGreen: {
    fontSize: 10,
    color: COLORS.actionGreen,
    fontWeight: 'bold',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.actionGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginBottom: SPACING.xs,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.appBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.midnightNavy,
  },
  txDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
