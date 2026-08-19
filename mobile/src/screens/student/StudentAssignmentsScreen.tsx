import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TabSelector } from '../../components/common/TabSelector';
import { MOCK_ASSIGNMENTS } from '../../services/api';
import { Assignment } from '../../types';

export const StudentAssignmentsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [activeTab, setActiveTab] = useState('pending');
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'graded').length;

  const tabs = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'submitted', label: 'Submitted', count: submittedCount },
    { key: 'graded', label: 'Graded', count: gradedCount },
  ];

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'submitted') return a.status === 'submitted';
    if (activeTab === 'graded') return a.status === 'graded';
    return true;
  });

  const handleOpenSubmit = (item: Assignment) => {
    setSelectedAssignment(item);
    setSubmissionLink('');
    setSubmissionNotes('');
    setSubmitModalVisible(true);
  };

  const handleConfirmSubmit = () => {
    if (!selectedAssignment) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a._id === selectedAssignment._id
          ? {
              ...a,
              status: 'submitted',
              submittedFile: submissionLink || 'assignment_submission_aarav.pdf',
              submissionDate: 'Just Now',
            }
          : a
      )
    );
    setSubmitModalVisible(false);
    Alert.alert('Assignment Submitted! 🎉', 'Your coursework has been uploaded for faculty grading.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Assignments & Coursework</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Submit your laboratory tasks and review faculty evaluations
          </Text>
        </View>
      </View>

      <TabSelector tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Assignment List */}
      <View style={styles.listGrid}>
        {filteredAssignments.map((item) => (
          <Card key={item._id} style={styles.assignmentCard}>
            <View style={styles.cardHeader}>
              <Badge label={item.courseName} variant="primary" size="sm" />
              <Badge
                label={item.status.toUpperCase()}
                variant={
                  item.status === 'graded'
                    ? 'success'
                    : item.status === 'submitted'
                    ? 'info'
                    : 'warning'
                }
                size="sm"
              />
            </View>

            <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.itemDesc, { color: theme.textSecondary }]}>{item.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Due Date</Text>
                <Text style={[styles.metaVal, { color: theme.textPrimary }]}>{item.dueDate}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Total Marks</Text>
                <Text style={[styles.metaVal, { color: theme.textPrimary }]}>{item.totalMarks} Pts</Text>
              </View>
              {item.grade !== undefined && (
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Scored</Text>
                  <Text style={[styles.metaVal, { color: '#10B981', fontWeight: '800' }]}>
                    {item.grade} / {item.totalMarks}
                  </Text>
                </View>
              )}
            </View>

            {/* Graded Feedback Box */}
            {item.feedback && (
              <View style={[styles.feedbackBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="chatbox-ellipses" size={16} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.feedbackLabel, { color: theme.primary }]}>Faculty Feedback:</Text>
                  <Text style={[styles.feedbackText, { color: theme.textSecondary }]}>{item.feedback}</Text>
                </View>
              </View>
            )}

            {/* Submitted File Info */}
            {item.submittedFile && (
              <View style={styles.fileRow}>
                <Ionicons name="document-attach" size={16} color={theme.textMuted} />
                <Text style={[styles.fileName, { color: theme.textMuted }]}>Submitted: {item.submittedFile}</Text>
              </View>
            )}

            {/* Actions */}
            {item.status === 'pending' && (
              <Button
                title="Submit Assignment"
                variant="primary"
                size="small"
                icon={<Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />}
                onPress={() => handleOpenSubmit(item)}
                style={{ marginTop: spacing.md }}
              />
            )}
          </Card>
        ))}
      </View>

      {/* Submission Modal */}
      <Modal
        visible={submitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Submit Assignment</Text>
              <TouchableOpacity onPress={() => setSubmitModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {selectedAssignment?.courseName} • {selectedAssignment?.title}
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>GitHub Repo / Cloud Storage Link</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="https://github.com/username/project"
                placeholderTextColor={theme.textMuted}
                value={submissionLink}
                onChangeText={setSubmissionLink}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Comments / Student Notes (Optional)</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Describe your implementation or specific test commands..."
                placeholderTextColor={theme.textMuted}
                value={submissionNotes}
                onChangeText={setSubmissionNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={() => setSubmitModalVisible(false)}
              />
              <Button
                title="Confirm & Upload"
                variant="primary"
                size="medium"
                onPress={handleConfirmSubmit}
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
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  listGrid: {
    gap: spacing.md,
  },
  assignmentCard: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  metaCol: {
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  feedbackBox: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    gap: 8,
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 12,
    marginTop: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  fileName: {
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
    alignItems: 'center',
    marginBottom: 4,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginBottom: spacing.md,
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
    height: 80,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
