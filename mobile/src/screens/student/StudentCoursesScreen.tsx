import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { TabSelector } from '../../components/common/TabSelector';
import { MOCK_COURSES } from '../../services/api';
import { Course } from '../../types';

interface StudentCoursesProps {
  onSelectCourse: (course: Course) => void;
}

export const StudentCoursesScreen: React.FC<StudentCoursesProps> = ({ onSelectCourse }) => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filterTabs = [
    { key: 'all', label: 'All Courses', count: MOCK_COURSES.length },
    { key: 'inprogress', label: 'In Progress', count: 3 },
    { key: 'completed', label: 'Completed', count: 0 },
  ];

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'inprogress') return matchesSearch && (c.progress || 0) < 100;
    if (activeTab === 'completed') return matchesSearch && (c.progress || 0) === 100;
    return matchesSearch;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>My Enrolled Courses</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Semester 6 • Computer Science & Engineering
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search by course title, code or instructor..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <TabSelector
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Course Grid */}
      <View style={[styles.coursesGrid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {filteredCourses.map((course) => (
          <Card
            key={course._id}
            style={[styles.courseGridCard, { width: isLargeScreen ? '48.5%' : '100%' }]}
            onPress={() => onSelectCourse(course)}
          >
            <Image source={{ uri: course.thumbnail }} style={styles.cardImage} />

            <View style={styles.cardBody}>
              <View style={styles.badgeRow}>
                <Badge label={course.code} variant="primary" size="sm" />
                <Badge label={`${course.credits} Credits`} variant="purple" size="sm" />
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={13} color="#FBBF24" />
                  <Text style={[styles.ratingVal, { color: theme.textSecondary }]}>{course.rating}</Text>
                </View>
              </View>

              <Text style={[styles.courseTitle, { color: theme.textPrimary }]}>{course.title}</Text>
              <Text style={[styles.courseDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {course.description}
              </Text>

              <View style={styles.instructorRow}>
                <Ionicons name="person-circle-outline" size={16} color={theme.textMuted} />
                <Text style={[styles.instructorName, { color: theme.textMuted }]}>{course.instructor}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressCount, { color: theme.textSecondary }]}>
                    {course.completedLessons || 0} / {course.totalLessons} Lessons
                  </Text>
                  <Text style={[styles.progressPercent, { color: theme.primary }]}>
                    {course.progress || 0}%
                  </Text>
                </View>
                <ProgressBar progress={course.progress || 0} height={6} />
              </View>

              <Button
                title="Continue Learning"
                variant="primary"
                size="small"
                icon={<Ionicons name="play-circle-outline" size={16} color="#FFFFFF" />}
                onPress={() => onSelectCourse(course)}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </Card>
        ))}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  coursesGrid: {
    gap: spacing.md,
  },
  courseGridCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 3,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  instructorName: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressCount: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
});
