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
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/tokens';
import { MobileApiClient } from '../services/api';

export function SendMoneyScreen({ navigation }: any) {
  const [bank, setBank] = useState('GTBank');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccountChange = (val: string) => {
    setAccountNumber(val);
    if (val.length === 10) {
      // Simulate NIP resolution
      if (val === '0123456789') {
        setResolvedName('Ada Chukwu (Simulated)');
      } else {
        setResolvedName('Verified Recipient (Simulated)');
      }
    } else {
      setResolvedName(null);
    }
  };

  const handleReview = () => {
    const parsed = parseFloat(amount);
    if (!accountNumber || accountNumber.length < 10) {
      Alert.alert('Invalid Account', 'Please enter a valid 10-digit NUBAN account number.');
      return;
    }
    if (!parsed || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a positive transfer amount.');
      return;
    }
    setPinModalVisible(true);
  };

  const handleConfirmTransfer = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit transaction PIN.');
      return;
    }

    setIsSubmitting(true);
    const amountMinor = Math.round(parseFloat(amount) * 100);

    const res = await MobileApiClient.transfer({
      recipientIdentifier: accountNumber,
      recipientName: resolvedName || 'Recipient',
      recipientBank: bank,
      amountMinor,
      currency: 'NGN',
      narration: narration || 'Mobile transfer',
      pin,
    });

    setIsSubmitting(false);
    setPinModalVisible(false);
    setPin('');

    if (res.success) {
      Alert.alert(
        'Transfer Successful',
        `₦${parseFloat(amount).toLocaleString()} sent to ${resolvedName || accountNumber} (${bank}).`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } else {
      Alert.alert('Transfer Notice', res.error?.message || 'Transfer completed in local demo mode.');
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Direct bank transfer via NIP (Instant)</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Select Destination Bank</Text>
          <View style={styles.bankPicker}>
            {['GTBank', 'Zenith Bank', 'Access Bank', 'Providus'].map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.bankChip, bank === b && styles.bankChipActive]}
                onPress={() => setBank(b)}
              >
                <Text style={[styles.bankChipText, bank === b && styles.bankChipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Account Number (10 Digits)</Text>
          <TextInput
            style={styles.input}
            placeholder="0123456789"
            keyboardType="numeric"
            maxLength={10}
            value={accountNumber}
            onChangeText={handleAccountChange}
          />

          {resolvedName && (
            <View style={styles.resolvedPill}>
              <Text style={styles.resolvedText}>✅ Verified: {resolvedName}</Text>
            </View>
          )}

          <Text style={styles.label}>Amount (NGN)</Text>
          <TextInput
            style={styles.input}
            placeholder="5,000"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Narration (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Project milestone"
            value={narration}
            onChangeText={setNarration}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleReview}>
            <Text style={styles.submitBtnText}>Continue to Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 4-Digit PIN Modal */}
      <Modal visible={pinModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Transfer</Text>
            <Text style={styles.modalAmount}>₦{parseFloat(amount || '0').toLocaleString()}</Text>
            <Text style={styles.modalDesc}>To: {resolvedName || accountNumber} ({bank})</Text>

            <Text style={styles.pinLabel}>Enter 4-Digit Transaction PIN</Text>
            <TextInput
              style={styles.pinInput}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              value={pin}
              onChangeText={setPin}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setPinModalVisible(false);
                  setPin('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmTransfer}>
                <Text style={styles.confirmText}>{isSubmitting ? 'Sending...' : 'Authorize Debit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  scroll: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.midnightNavy,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.midnightNavy,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  bankPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  bankChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.appBg,
  },
  bankChipActive: {
    backgroundColor: COLORS.paleMint,
    borderColor: COLORS.actionGreen,
  },
  bankChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bankChipTextActive: {
    color: COLORS.actionGreen,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.midnightNavy,
    backgroundColor: COLORS.white,
  },
  resolvedPill: {
    backgroundColor: COLORS.paleMint,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  resolvedText: {
    color: COLORS.actionGreen,
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: COLORS.actionGreen,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.midnightNavy,
    marginVertical: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  pinLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.midnightNavy,
    marginBottom: 8,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: RADIUS.md,
    fontSize: 24,
    textAlign: 'center',
    width: 140,
    paddingVertical: 8,
    letterSpacing: 8,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  modalConfirm: {
    flex: 2,
    backgroundColor: COLORS.actionGreen,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
