import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/tokens';

export function ProfileScreen() {
  const sections = [
    {
      title: 'MY ACCOUNT',
      items: [
        { label: 'Personal Information', desc: 'Amara Okonkwo • Verified', icon: '👤' },
        { label: 'Providus Account Details', desc: '9920 3948 11 • Active', icon: '🏦' },
        { label: 'Verification & Limits', desc: 'Tier 3 Pro (₦5,000,000 daily limit)', icon: '🛡️' },
      ],
    },
    {
      title: 'SECURITY & PREFERENCES',
      items: [
        { label: 'Security & Sign-In', desc: 'Change PIN, Biometric Face ID, 2FA', icon: '🔒' },
        { label: 'Active Devices & Sessions', desc: 'Chrome on Windows 11 (Current)', icon: '💻' },
        { label: 'Notifications Preferences', desc: 'Push, SMS and Email alerts', icon: '🔔' },
      ],
    },
    {
      title: 'HELP & SUPPORT',
      items: [
        { label: 'Frequently Asked Questions', desc: 'Browse 40 searchable banking topics', icon: '❓' },
        { label: 'Customer Support Hub', desc: 'Live ticket management & disputes', icon: '💬' },
        { label: 'Report Fraud & Security Issue', desc: 'Emergency account compromise lockdown', icon: '🚨' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AO</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.name}>Amara Okonkwo</Text>
            <Text style={styles.phone}>0703 ••• ••00</Text>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>⭐ TIER 3 VERIFIED PRO</Text>
            </View>
          </View>
        </View>

        {/* Grouped Navigation */}
        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.card}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.itemRow, idx !== sec.items.length - 1 && styles.borderBottom]}
                  onPress={() => Alert.alert(item.label, item.desc)}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => Alert.alert('Sign Out', 'Signed out of mobile session.')}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.appBg },
  scroll: { padding: SPACING.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderColor, marginBottom: SPACING.lg },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.deepEmerald, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  profileDetails: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.midnightNavy },
  phone: { fontSize: 12, color: COLORS.textMuted, marginVertical: 2 },
  tierPill: { alignSelf: 'flex-start', backgroundColor: COLORS.paleMint, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full, marginTop: 2 },
  tierText: { color: COLORS.actionGreen, fontSize: 10, fontWeight: 'bold' },
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.textMuted, marginBottom: 6, letterSpacing: 0.5 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.borderColor },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  itemIcon: { fontSize: 18, marginRight: SPACING.sm },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 13, fontWeight: 'bold', color: COLORS.midnightNavy },
  itemDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  chevron: { fontSize: 18, color: COLORS.textMuted },
  signOutBtn: { backgroundColor: '#FEE2E2', paddingVertical: 14, borderRadius: RADIUS.md, alignItems: 'center', marginVertical: SPACING.md },
  signOutText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 14 },
});
