import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { MOCK_ANNOUNCEMENTS } from '../../services/api';
import { Announcement } from '../../types';

export const AdminAnnouncementsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [notices, setNotices] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'faculty'>('all');

  const handlePublish = () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in both title and announcement body.');
      return;
    }

    const newAnn: Announcement = {
      _id: `ann_${Date.now()}`,
      title,
      content,
      priority,
      targetRole,
      author: user?.name || 'Administrator',
      authorRole: user?.designation || 'System Admin',
      date: 'Today',
      pinned: priority === 'urgent',
    };

    setNotices([newAnn, ...notices]);
    setCreateModalVisible(false);
    setTitle('');
    setContent('');
    Alert.alert('Notice Broadcasted! 📢', `Sent to audience: ${targetRole.toUpperCase()}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Campus Broadcast Center</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Issue institutional circulars, exam schedules, and recruitment updates
          </Text>
        </View>

        <Button
          title="New Broadcast"
          variant="primary"
          size="medium"
          icon={<Ionicons name="megaphone" size={16} color="#FFFFFF" />}
          onPress={() => setCreateModalVisible(true)}
        />
      </View>

      <View style={styles.noticesGrid}>
        {notices.map((ann) => (
          <Card key={ann._id} style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <View style={styles.tagsRow}>
                <Badge
                  label={ann.priority.toUpperCase()}
                  variant={ann.priority === 'urgent' ? 'danger' : ann.priority === 'high' ? 'warning' : 'primary'}
                  size="sm"
                />
                <Badge label={`Audience: ${ann.targetRole.toUpperCase()}`} variant="info" size="sm" />
                {ann.pinned && <Badge label="📌 Pinned" variant="purple" size="sm" />}
              </View>
              <Text style={[styles.noticeDate, { color: theme.textMuted }]}>{ann.date}</Text>
            </View>

            <Text style={[styles.noticeTitle, { color: theme.textPrimary }]}>{ann.title}</Text>
            <Text style={[styles.noticeBody, { color: theme.textSecondary }]}>{ann.content}</Text>

            <View style={styles.authorRow}>
              <Ionicons name="person-circle-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.authorText, { color: theme.textMuted }]}>
                Posted by {ann.author} ({ann.authorRole})
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Broadcast Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Draft Campus Circular</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Title / Subject</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Schedule for End-Semester Practical Examinations"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Announcement Body</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Provide detailed dates, venue, or departmental instructions..."
                placeholderTextColor={theme.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityPill,
                      {
                        backgroundColor: priority === p ? theme.primaryLight : theme.surface,
                        borderColor: priority === p ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, { color: priority === p ? theme.primary : theme.textSecondary }]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={() => setCreateModalVisible(false)}
              />
              <Button
                title="Broadcast Notice"
                variant="primary"
                size="medium"
                onPress={handlePublish}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  noticesGrid: {
    gap: spacing.md,
  },
  noticeCard: {
    padding: spacing.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  noticeDate: {
    fontSize: 11,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  noticeBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.xs,
  },
  authorText: {
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 13,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    height: 90,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
