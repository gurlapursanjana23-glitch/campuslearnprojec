import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface StudentRosterItem {
  id: string;
  name: string;
  roll: string;
  status: 'present' | 'absent' | 'late';
}

const INITIAL_ROSTER: StudentRosterItem[] = [
  { id: 's1', name: 'Aarav Sharma', roll: 'CS2024-042', status: 'present' },
  { id: 's2', name: 'Ananya Deshmukh', roll: 'CS2024-043', status: 'present' },
  { id: 's3', name: 'Devendra Patel', roll: 'CS2024-044', status: 'present' },
  { id: 's4', name: 'Isha Nambiar', roll: 'CS2024-045', status: 'absent' },
  { id: 's5', name: 'Kunal Singhania', roll: 'CS2024-046', status: 'present' },
  { id: 's6', name: 'Neha Varma', roll: 'CS2024-047', status: 'present' },
  { id: 's7', name: 'Rohan Mehra', roll: 'CS2024-048', status: 'late' },
  { id: 's8', name: 'Tanvi Joshi', roll: 'CS2024-049', status: 'present' },
];

export const FacultyAttendanceScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [roster, setRoster] = useState<StudentRosterItem[]>(INITIAL_ROSTER);
  const [topic, setTopic] = useState('Graph Theory: Bellman-Ford Shortest Path');
  const [selectedCourse, setSelectedCourse] = useState('CS301 - Design & Analysis of Algorithms');

  const presentCount = roster.filter((s) => s.status === 'present').length;
  const absentCount = roster.filter((s) => s.status === 'absent').length;
  const lateCount = roster.filter((s) => s.status === 'late').length;
  const attendanceRate = Math.round((presentCount / roster.length) * 100);

  const setStudentStatus = (id: string, status: 'present' | 'absent' | 'late') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const markAll = (status: 'present' | 'absent') => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSaveRoll = () => {
    Alert.alert(
      'Attendance Published! 📋',
      `Recorded for ${roster.length} students in ${selectedCourse}. Notifications dispatched for ${absentCount} absent students.`
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Classroom Roll Call Marker</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Mark live lecture attendance with 1-tap toggles & automated alerts
          </Text>
        </View>
      </View>

      {/* Session Metadata Card */}
      <Card style={styles.metaCard} variant="elevated">
        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Course & Section</Text>
            <Text style={[styles.courseValue, { color: theme.textPrimary }]}>{selectedCourse}</Text>
          </View>
          <Badge label="Today • 09:00 AM" variant="primary" />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Lecture Topic Covered</Text>
          <TextInput
            style={[styles.topicInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Dynamic Programming LCS Memoization"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        {/* Live Counters */}
        <View style={styles.countersRow}>
          <View style={[styles.counterPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
            <Text style={[styles.counterVal, { color: '#10B981' }]}>{presentCount} Present</Text>
          </View>
          <View style={[styles.counterPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <Text style={[styles.counterVal, { color: '#EF4444' }]}>{absentCount} Absent</Text>
          </View>
          <View style={[styles.counterPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <Text style={[styles.counterVal, { color: '#F59E0B' }]}>{lateCount} Late</Text>
          </View>
          <View style={{ marginLeft: 'auto' }}>
            <Text style={[styles.rateText, { color: theme.textPrimary }]}>{attendanceRate}% Turnout</Text>
          </View>
        </View>

        {/* Batch Actions */}
        <View style={styles.batchRow}>
          <Button
            title="Mark All Present"
            variant="secondary"
            size="small"
            icon={<Ionicons name="checkmark-done-circle" size={16} color="#10B981" />}
            onPress={() => markAll('present')}
          />
          <Button
            title="Mark All Absent"
            variant="secondary"
            size="small"
            icon={<Ionicons name="close-circle" size={16} color="#EF4444" />}
            onPress={() => markAll('absent')}
          />
        </View>
      </Card>

      {/* Student List */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Student Roll Roster ({roster.length})</Text>

      <View style={styles.rosterGrid}>
        {roster.map((student) => (
          <Card key={student.id} style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: theme.textPrimary }]}>{student.name}</Text>
              <Text style={[styles.studentRoll, { color: theme.textMuted }]}>{student.roll}</Text>
            </View>

            {/* Toggle Status Buttons */}
            <View style={styles.statusButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  student.status === 'present'
                    ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setStudentStatus(student.id, 'present')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    { color: student.status === 'present' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Present
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  student.status === 'absent'
                    ? { backgroundColor: '#EF4444', borderColor: '#EF4444' }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setStudentStatus(student.id, 'absent')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    { color: student.status === 'absent' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Absent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  student.status === 'late'
                    ? { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setStudentStatus(student.id, 'late')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    { color: student.status === 'late' ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  Late
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      {/* Save Roll Call Button */}
      <Button
        title="Submit & Save Attendance Roll"
        variant="primary"
        size="large"
        icon={<Ionicons name="cloud-upload" size={18} color="#FFFFFF" />}
        onPress={handleSaveRoll}
        style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}
      />
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
  metaCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  courseValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  topicInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 13,
  },
  countersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  counterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  counterVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  rateText: {
    fontSize: 14,
    fontWeight: '800',
  },
  batchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  rosterGrid: {
    gap: spacing.xs,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  studentInfo: {
    minWidth: 140,
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  studentRoll: {
    fontSize: 12,
    marginTop: 2,
  },
  statusButtonGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
