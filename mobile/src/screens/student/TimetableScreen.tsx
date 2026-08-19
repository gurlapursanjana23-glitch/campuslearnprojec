import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { MOCK_TIMETABLE } from '../../services/api';

export const TimetableScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [activeDay, setActiveDay] = useState('Monday');

  const daySlots = MOCK_TIMETABLE.filter((t) => t.day === activeDay);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Weekly Academic Schedule</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Semester 6 • Room Allocations & Time Periods
          </Text>
        </View>
      </View>

      {/* Day Selector Pills */}
      <View style={styles.daysRow}>
        {days.map((day) => {
          const isSelected = activeDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayPill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setActiveDay(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule Slots Timeline */}
      <View style={styles.slotsList}>
        {daySlots.length > 0 ? (
          daySlots.map((slot, index) => (
            <Card key={slot.id} style={styles.slotCard}>
              <View style={styles.timeColumn}>
                <Text style={[styles.startTime, { color: theme.primary }]}>{slot.startTime}</Text>
                <Text style={[styles.endTime, { color: theme.textMuted }]}>{slot.endTime}</Text>
                <View style={[styles.dotLine, { backgroundColor: theme.border }]} />
              </View>

              <View style={styles.slotDetails}>
                <View style={styles.slotHeader}>
                  <Badge label={slot.courseCode} variant="primary" size="sm" />
                  <Badge
                    label={slot.type}
                    variant={slot.type === 'Lab' ? 'purple' : 'info'}
                    size="sm"
                  />
                </View>

                <Text style={[styles.slotCourseName, { color: theme.textPrimary }]}>
                  {slot.courseName}
                </Text>

                <View style={styles.slotMeta}>
                  <View style={styles.metaBadge}>
                    <Ionicons name="location-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{slot.room}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{slot.faculty}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyDayCard}>
            <Ionicons name="sunny-outline" size={40} color={theme.textMuted} />
            <Text style={[styles.emptyDayTitle, { color: theme.textPrimary }]}>No Scheduled Lectures</Text>
            <Text style={[styles.emptyDayDesc, { color: theme.textSecondary }]}>
              Self-study, laboratory work, or project development day.
            </Text>
          </Card>
        )}
      </View>
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
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  dayPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  slotsList: {
    gap: spacing.sm,
  },
  slotCard: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  timeColumn: {
    alignItems: 'center',
    minWidth: 70,
  },
  startTime: {
    fontSize: 13,
    fontWeight: '800',
  },
  endTime: {
    fontSize: 11,
    marginTop: 2,
  },
  dotLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    borderRadius: 1,
  },
  slotDetails: {
    flex: 1,
  },
  slotHeader: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  slotCourseName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  slotMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  emptyDayCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyDayDesc: {
    fontSize: 13,
    marginTop: 4,
  },
});
