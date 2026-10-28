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

export function AskAIScreen({ navigation }: any) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello Amara! I am TAVI AI, your personal financial copilot. Ask me about your spending, transfers to Ada Chukwu, or TAVI Index benchmarks.',
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let reply = `I have reviewed your query regarding "${q}".`;
      const lower = q.toLowerCase();

      if (lower.includes('ada') || lower.includes('peer')) {
        reply = 'Summary for Ada Chukwu:\n• Total Sent: ₦25,000.00\n• Total Received: ₦50,000.00\n• Net Transaction Flow: +₦25,000.00 in your favor.\n\nYou can view full records in Transaction History.';
      } else if (lower.includes('balance') || lower.includes('wallet')) {
        reply = 'Your current available balance is ₦485,250.00 (NGN) with ₦15,000.00 pending settlement.';
      } else if (lower.includes('send') || lower.includes('transfer')) {
        reply = 'I can help draft a transfer for you. Please tap the Send Money button in the app to review and confirm with your 4-digit PIN.';
      } else if (lower.includes('index') || lower.includes('tavi 30')) {
        reply = 'The TAVI 30 Index tracks the top 30 most liquid equities on the Nigerian Exchange, currently standing at 2,180.40 (+0.88%).';
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TAVI AI Copilot</Text>
        <Text style={styles.subtitle}>Grounded financial super app assistant</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatArea}>
        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {['Transactions with Ada Chukwu', 'What is my balance?', 'Explain TAVI 30'].map((chip) => (
            <TouchableOpacity key={chip} style={styles.chip} onPress={() => handleSend(chip)}>
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgBubble,
              m.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.msgText,
                m.sender === 'user' ? styles.userMsgText : styles.aiMsgText,
              ]}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your money, bills, or stocks..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.appBg },
  header: { padding: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.midnightNavy },
  subtitle: { fontSize: 11, color: COLORS.textMuted },
  chatArea: { padding: SPACING.md },
  chipsRow: { marginBottom: SPACING.md },
  chip: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, marginRight: SPACING.xs },
  chipText: { fontSize: 11, color: COLORS.actionGreen, fontWeight: '600' },
  msgBubble: { maxWidth: '85%', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  aiBubble: { backgroundColor: COLORS.white, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.borderColor },
  userBubble: { backgroundColor: COLORS.deepEmerald, alignSelf: 'flex-end' },
  msgText: { fontSize: 13, lineHeight: 18 },
  aiMsgText: { color: COLORS.midnightNavy },
  userMsgText: { color: COLORS.white },
  inputContainer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.borderColor, gap: SPACING.sm },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.borderColor, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, backgroundColor: COLORS.appBg },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.actionGreen, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
