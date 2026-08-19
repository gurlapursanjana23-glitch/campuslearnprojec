import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { MOCK_AI_RESPONSES } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: MOCK_AI_RESPONSES.default,
      time: 'Just Now',
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  const promptChips = [
    { label: '🧠 Explain 0/1 Knapsack DP', key: 'dp' },
    { label: '⚡ SQL Indexing Pro-Tips', key: 'sql' },
    { label: '🚀 Placement Pillars (Nayana G. Naik)', key: 'placement' },
    { label: '🛡️ TCP 3-Way Handshake', key: 'tcp' },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = '';
      const lower = text.toLowerCase();
      if (lower.includes('knapsack') || lower.includes('dp') || lower.includes('dynamic')) {
        aiText = MOCK_AI_RESPONSES.dp;
      } else if (lower.includes('sql') || lower.includes('index') || lower.includes('dbms')) {
        aiText = MOCK_AI_RESPONSES.sql;
      } else if (lower.includes('placement') || lower.includes('interview') || lower.includes('nayana')) {
        aiText = MOCK_AI_RESPONSES.placement;
      } else {
        aiText = `Here is the explanation for "${text}":\n\n1. **Core Concept:** In computer science, this principle establishes efficient resource allocation and predictable asymptotic bounds.\n2. **Academic Application:** Frequently tested in mid-term and semester examinations.\n3. **Quick Recap:** Review your lecture notes on Chapter 4 or consult your faculty Dr. Priya Ramanathan for additional problem sets!`;
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiText,
        time: 'Now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top AI Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiIconBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>CampusLearn AI Study Bot</Text>
              <Badge label="Online" variant="success" size="sm" />
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Instant answers for CS, Algorithms, DBMS, and Placement Prep
            </Text>
          </View>
        </View>
      </View>

      {/* Suggested Prompt Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipsContainer, { backgroundColor: theme.surface }]}
        contentContainerStyle={styles.chipsContent}
      >
        {promptChips.map((chip, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.promptChip, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleSendMessage(chip.label)}
            activeOpacity={0.7}
          >
            <Text style={[styles.promptChipText, { color: theme.textPrimary }]}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Messages Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md },
        ]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.aiRow,
              ]}
            >
              {!isUser && (
                <View style={[styles.botAvatar, { backgroundColor: theme.primary }]}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: theme.primary }]
                    : [styles.aiBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }],
                  { maxWidth: isLargeScreen ? 700 : '85%' },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    { color: isUser ? 'rgba(255,255,255,0.7)' : theme.textMuted },
                  ]}
                >
                  {msg.time}
                </Text>
              </View>

              {isUser && (
                <View style={[styles.userAvatar, { backgroundColor: theme.surface }]}>
                  <Ionicons name="person" size={14} color={theme.textPrimary} />
                </View>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={[styles.botAvatar, { backgroundColor: theme.primary }]}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.typingBubble, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.typingText, { color: theme.textSecondary }]}>AI is synthesizing response...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.inputField, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="Ask any question regarding your syllabus, algorithms, or exams..."
          placeholderTextColor={theme.textMuted}
          value={inputMessage}
          onChangeText={setInputMessage}
          onSubmitEditing={() => handleSendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: theme.primary }]}
          onPress={() => handleSendMessage()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiIconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chipsContainer: {
    maxHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    fontSize: 13,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
