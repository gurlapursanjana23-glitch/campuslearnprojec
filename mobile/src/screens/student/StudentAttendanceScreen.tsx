import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { MOCK_ATTENDANCE } from '../../services/api';
import { AttendanceRecord } from '../../types';

export const StudentAttendanceScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Overall attendance calculation
  const totalAttended = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const totalConducted = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const overallPercentage = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0';

  const calculateRequiredClasses = (attended: number, total: number, target = 75) => {
    // formula: (attended + x) / (total + x) >= target/100
    // attended + x >= 0.75 * total + 0.75 * x
    // 0.25 * x >= 0.75 * total - attended
    // x = ceil((0.75 * total - attended) / 0.25)
    const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
    return needed > 0 ? needed : 0;
  };

  const handleOpenHistory = (rec: AttendanceRecord) => {
    setSelectedRecord(rec);
    setHistoryModalVisible(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Attendance & Shortage Tracker</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Maintain minimum 75% attendance across all subjects for semester exam eligibility
          </Text>
        </View>
      </View>

      {/* Aggregate Overview Card */}
      <Card style={styles.summaryCard} variant="elevated">
        <View style={styles.summaryTop}>
          <View>
            <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>Cumulative Attendance</Text>
            <Text style={[styles.summaryBigValue, { color: theme.textPrimary }]}>{overallPercentage}%</Text>
            <Text style={[styles.summaryClasses, { color: theme.textMuted }]}>
              {totalAttended} of {totalConducted} Total Sessions Attended
            </Text>
          </View>

          <View
            style={[
              styles.statusRing,
              {
                borderColor: Number(overallPercentage) >= 75 ? '#10B981' : '#EF4444',
                backgroundColor: Number(overallPercentage) >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              },
            ]}
          >
            <Ionicons
              name={Number(overallPercentage) >= 75 ? 'checkmark-circle' : 'alert-circle'}
              size={32}
              color={Number(overallPercentage) >= 75 ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.statusRingText,
                { color: Number(overallPercentage) >= 75 ? '#10B981' : '#EF4444' },
              ]}
            >
              {Number(overallPercentage) >= 75 ? 'Eligible' : 'Shortage'}
            </Text>
          </View>
        </View>

        <ProgressBar progress={Number(overallPercentage)} height={10} style={{ marginTop: spacing.md }} />
      </Card>

      {/* Subject-Wise Cards Grid */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Subject-Wise Attendance Breakdown</Text>

      <View style={styles.subjectList}>
        {MOCK_ATTENDANCE.map((rec) => {
          const isShortage = rec.percentage < 75;
          const classesNeeded = calculateRequiredClasses(rec.attendedClasses, rec.totalClasses);

          return (
            <Card key={rec.courseId} style={styles.subjectCard}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.codeRow}>
                    <Badge label={rec.courseCode} variant="primary" size="sm" />
                    <Badge
                      label={isShortage ? 'Shortage Alert' : 'Good Standing'}
                      variant={isShortage ? 'danger' : 'success'}
                      size="sm"
                    />
                  </View>
                  <Text style={[styles.courseName, { color: theme.textPrimary }]}>{rec.courseName}</Text>
                  <Text style={[styles.facultyName, { color: theme.textMuted }]}>Faculty: {rec.facultyName}</Text>
                </View>

                <View style={styles.percentBox}>
                  <Text
                    style={[
                      styles.percentText,
                      { color: isShortage ? '#EF4444' : '#10B981' },
                    ]}
                  >
                    {rec.percentage}%
                  </Text>
                  <Text style={[styles.classesFraction, { color: theme.textSecondary }]}>
                    {rec.attendedClasses}/{rec.totalClasses} classes
                  </Text>
                </View>
              </View>

              <ProgressBar
                progress={rec.percentage}
                color={isShortage ? '#EF4444' : '#10B981'}
                height={8}
                style={{ marginVertical: spacing.md }}
              />

              {/* Shortage Remediation Advice (Sinchana Feature) */}
              {isShortage ? (
                <View style={[styles.shortageWarningBox, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
                  <Ionicons name="warning-outline" size={18} color="#EF4444" />
                  <Text style={[styles.shortageAdvice, { color: theme.danger }]}>
                    ⚠️ You must attend the next <Text style={{ fontWeight: '800' }}>{classesNeeded}</Text> consecutive lecture(s) without absence to restore your attendance to 75%.
                  </Text>
                </View>
              ) : (
                <View style={[styles.goodStandingBox, { backgroundColor: theme.surface }]}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                  <Text style={[styles.goodStandingText, { color: theme.textSecondary }]}>
                    You can safely miss up to {Math.floor((rec.attendedClasses - 0.75 * rec.totalClasses) / 0.75)} class(es) without falling below 75%.
                  </Text>
                </View>
              )}

              <View style={styles.cardActions}>
                <Button
                  title="View Roll Log & Dates"
                  variant="secondary"
                  size="small"
                  icon={<Ionicons name="list-outline" size={14} color={theme.textPrimary} />}
                  onPress={() => handleOpenHistory(rec)}
                />
              </View>
            </Card>
          );
        })}
      </View>

      {/* Roll Log Modal */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>
                  {selectedRecord?.courseName}
                </Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Attendance History Log • {selectedRecord?.attendedClasses}/{selectedRecord?.totalClasses} Attended
                </Text>
              </View>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {selectedRecord?.history.map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.historyRow,
                    { borderBottomColor: theme.border, backgroundColor: theme.surface },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyDate, { color: theme.textPrimary }]}>{h.date}</Text>
                    {h.topic ? (
                      <Text style={[styles.historyTopic, { color: theme.textSecondary }]}>Topic: {h.topic}</Text>
                    ) : null}
                  </View>
                  <Badge
                    label={h.status.toUpperCase()}
                    variant={h.status === 'present' ? 'success' : 'danger'}
                    size="sm"
                  />
                </View>
              ))}
            </ScrollView>

            <Button
              title="Close"
              variant="primary"
              size="medium"
              onPress={() => setHistoryModalVisible(false)}
              style={{ marginTop: spacing.md }}
            />
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
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryBigValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryClasses: {
    fontSize: 12,
    marginTop: 2,
  },
  statusRing: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRingText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subjectList: {
    gap: spacing.md,
  },
  subjectCard: {
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  facultyName: {
    fontSize: 12,
    marginTop: 2,
  },
  percentBox: {
    alignItems: 'flex-end',
  },
  percentText: {
    fontSize: 24,
    fontWeight: '800',
  },
  classesFraction: {
    fontSize: 11,
    marginTop: 2,
  },
  shortageWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: spacing.sm,
  },
  shortageAdvice: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  goodStandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
    marginBottom: spacing.sm,
  },
  goodStandingText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
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
    maxWidth: 500,
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
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyTopic: {
    fontSize: 11,
    marginTop: 2,
  },
});
