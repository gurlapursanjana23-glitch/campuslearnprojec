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

interface SubmissionItem {
  id: string;
  studentName: string;
  roll: string;
  assignmentTitle: string;
  courseCode: string;
  submittedFile: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  grade?: number;
  maxGrade: number;
  feedback?: string;
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 'sub_1',
    studentName: 'Aarav Sharma',
    roll: 'CS2024-042',
    assignmentTitle: 'Assignment 3: Dynamic Programming on Graph Networks',
    courseCode: 'CS301',
    submittedFile: 'github.com/aarav/dp-graph-networks.py',
    submittedAt: 'Today at 02:15 PM',
    status: 'pending',
    maxGrade: 25,
  },
  {
    id: 'sub_2',
    studentName: 'Ananya Deshmukh',
    roll: 'CS2024-043',
    assignmentTitle: 'Assignment 3: Dynamic Programming on Graph Networks',
    courseCode: 'CS301',
    submittedFile: 'ananya_dp_graphs_submission.zip',
    submittedAt: 'Today at 01:40 PM',
    status: 'pending',
    maxGrade: 25,
  },
  {
    id: 'sub_3',
    studentName: 'Kunal Singhania',
    roll: 'CS2024-046',
    assignmentTitle: 'Assignment 3: Dynamic Programming on Graph Networks',
    courseCode: 'CS301',
    submittedFile: 'kunal_assignment3_solution.cpp',
    submittedAt: 'Yesterday at 09:20 PM',
    status: 'graded',
    grade: 24,
    maxGrade: 25,
    feedback: 'Excellent time complexity analysis and clean modular code!',
  },
];

export const FacultyAssignmentsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [givenGrade, setGivenGrade] = useState('');
  const [givenFeedback, setGivenFeedback] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS301');
  const [newPoints, setNewPoints] = useState('20');
  const [newDue, setNewDue] = useState('In 5 Days');

  const handleOpenGrade = (sub: SubmissionItem) => {
    setSelectedSub(sub);
    setGivenGrade(sub.grade ? String(sub.grade) : '');
    setGivenFeedback(sub.feedback || '');
    setGradeModalVisible(true);
  };

  const handleSaveGrade = () => {
    if (!selectedSub || !givenGrade) {
      Alert.alert('Error', 'Please enter a valid grade.');
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSub.id
          ? {
              ...s,
              status: 'graded',
              grade: Number(givenGrade),
              feedback: givenFeedback || 'Graded and approved by faculty.',
            }
          : s
      )
    );
    setGradeModalVisible(false);
    Alert.alert('Evaluation Saved! ✅', `Score of ${givenGrade}/${selectedSub.maxGrade} published for ${selectedSub.studentName}.`);
  };

  const handleCreateAssignment = () => {
    if (!newTitle) {
      Alert.alert('Error', 'Please enter an assignment title.');
      return;
    }
    setCreateModalVisible(false);
    Alert.alert('Assignment Published! 🚀', `New task "${newTitle}" created for ${newCourse}. Students notified.`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Assignments & Grading Hub</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Review student submissions, assign scores, and publish coursework
          </Text>
        </View>

        <Button
          title="Create Assignment"
          variant="primary"
          size="medium"
          icon={<Ionicons name="add-circle" size={18} color="#FFFFFF" />}
          onPress={() => setCreateModalVisible(true)}
        />
      </View>

      {/* Submissions Queue */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
        Student Submissions Queue ({submissions.filter((s) => s.status === 'pending').length} Pending)
      </Text>

      <View style={styles.subList}>
        {submissions.map((sub) => (
          <Card key={sub.id} style={styles.subCard}>
            <View style={styles.subHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  <Badge label={sub.courseCode} variant="primary" size="sm" />
                  <Badge
                    label={sub.status === 'graded' ? 'Graded ✓' : 'Pending Review'}
                    variant={sub.status === 'graded' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
                <Text style={[styles.subTitle, { color: theme.textPrimary }]}>{sub.assignmentTitle}</Text>
                <Text style={[styles.studentMeta, { color: theme.textSecondary }]}>
                  By <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{sub.studentName}</Text> ({sub.roll}) • {sub.submittedAt}
                </Text>
              </View>

              {sub.grade !== undefined && (
                <View style={styles.gradeBadge}>
                  <Text style={[styles.gradeVal, { color: '#10B981' }]}>{sub.grade}</Text>
                  <Text style={[styles.gradeMax, { color: theme.textMuted }]}>/ {sub.maxGrade}</Text>
                </View>
              )}
            </View>

            {/* Submitted Resource */}
            <View style={[styles.fileBox, { backgroundColor: theme.surface }]}>
              <Ionicons name="document-attach" size={16} color={theme.primary} />
              <Text style={[styles.fileName, { color: theme.primary }]}>{sub.submittedFile}</Text>
            </View>

            {sub.feedback ? (
              <View style={[styles.feedbackSnippet, { borderColor: theme.border }]}>
                <Text style={[styles.feedbackLabel, { color: theme.textSecondary }]}>Feedback: {sub.feedback}</Text>
              </View>
            ) : null}

            <Button
              title={sub.status === 'graded' ? 'Edit Grade & Feedback' : 'Evaluate & Score'}
              variant={sub.status === 'graded' ? 'outline' : 'primary'}
              size="small"
              icon={<Ionicons name="create-outline" size={16} color={sub.status === 'graded' ? theme.primary : '#FFFFFF'} />}
              onPress={() => handleOpenGrade(sub)}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ))}
      </View>

      {/* Grade Modal */}
      <Modal
        visible={gradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Grade Student Submission</Text>
              <TouchableOpacity onPress={() => setGradeModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {selectedSub?.studentName} • {selectedSub?.assignmentTitle}
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                Score (Out of {selectedSub?.maxGrade})
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder={`0 to ${selectedSub?.maxGrade}`}
                placeholderTextColor={theme.textMuted}
                value={givenGrade}
                onChangeText={setGivenGrade}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Faculty Feedback & Rubric Notes</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Provide constructive feedback on algorithmic efficiency and test coverage..."
                placeholderTextColor={theme.textMuted}
                value={givenFeedback}
                onChangeText={setGivenFeedback}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={() => setGradeModalVisible(false)}
              />
              <Button
                title="Save & Publish Score"
                variant="primary"
                size="medium"
                onPress={handleSaveGrade}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Create New Coursework Task</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Assignment Title</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Assignment 4: Kruskal vs Prim Minimum Spanning Tree"
                placeholderTextColor={theme.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Total Points</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="25"
                  placeholderTextColor={theme.textMuted}
                  value={newPoints}
                  onChangeText={setNewPoints}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Due Timeline</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="e.g. In 7 Days"
                  placeholderTextColor={theme.textMuted}
                  value={newDue}
                  onChangeText={setNewDue}
                />
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
                title="Publish Coursework"
                variant="primary"
                size="medium"
                onPress={handleCreateAssignment}
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subList: {
    gap: spacing.md,
  },
  subCard: {
    padding: spacing.md,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gradeVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  gradeMax: {
    fontSize: 12,
    marginLeft: 2,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    gap: 6,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackSnippet: {
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  feedbackLabel: {
    fontSize: 12,
    fontStyle: 'italic',
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
    marginBottom: 4,
  },
  modalHeading: {
    fontSize: 17,
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
