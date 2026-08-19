import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';
import { Course, Lesson } from '../../types';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

export const CourseDetailScreen: React.FC<CourseDetailProps> = ({ course, onBack }) => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    course.modules[0]?.lessons[0] || null
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['l1', 'l2', 'l3', 'l4', 'l5']);
  const [expandedModules, setExpandedModules] = useState<string[]>(['m1', 'm2', 'm3']);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Top Back Navigation */}
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={18} color={theme.textPrimary} />
        <Text style={[styles.backText, { color: theme.textPrimary }]}>Back to Courses</Text>
      </TouchableOpacity>

      {/* Hero Header */}
      <Card style={styles.headerCard} variant="elevated">
        <Image source={{ uri: course.thumbnail }} style={styles.heroThumbnail} />
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadges}>
            <Badge label={course.code} variant="primary" size="sm" />
            <Badge label={`${course.credits} Credits`} variant="purple" size="sm" />
            <Badge label={`Sem ${course.semester}`} variant="info" size="sm" />
          </View>
          <Text style={styles.heroTitle}>{course.title}</Text>
          <Text style={styles.heroInstructor}>Instructor: {course.instructor}</Text>
        </View>
      </Card>

      {/* Progress & Quick Stats Card */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Course Completion</Text>
            <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
              {completedCount} of {totalLessons} lessons completed
            </Text>
          </View>
          <Text style={[styles.progressPercentageText, { color: theme.primary }]}>{progressPercent}%</Text>
        </View>
        <ProgressBar progress={progressPercent} height={8} style={{ marginTop: spacing.sm }} />
      </Card>

      {/* Two Column Layout on Desktop */}
      <View style={[styles.layoutGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* Left: Active Lesson Viewer */}
        <View style={{ flex: 1.4 }}>
          {activeLesson ? (
            <Card style={styles.playerCard}>
              <View style={[styles.videoMockContainer, { backgroundColor: '#000000' }]}>
                <Ionicons name="play-circle" size={56} color="#FFFFFF" style={{ opacity: 0.9 }} />
                <Text style={styles.videoMockTitle}>{activeLesson.title}</Text>
                <Text style={styles.videoDuration}>{activeLesson.duration} • HD 1080p Stream</Text>
              </View>

              <View style={styles.playerBody}>
                <View style={styles.playerHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activeLessonTitle, { color: theme.textPrimary }]}>
                      {activeLesson.title}
                    </Text>
                    <Text style={[styles.activeLessonMeta, { color: theme.textSecondary }]}>
                      Type: {activeLesson.type.toUpperCase()} • Duration: {activeLesson.duration}
                    </Text>
                  </View>
                  <Button
                    title={completedLessonIds.includes(activeLesson._id) ? 'Completed ✓' : 'Mark Complete'}
                    variant={completedLessonIds.includes(activeLesson._id) ? 'success' : 'outline'}
                    size="small"
                    onPress={() => toggleLessonComplete(activeLesson._id)}
                  />
                </View>

                {/* Lesson Description & Resources */}
                <View style={[styles.notesSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.notesHeading, { color: theme.textPrimary }]}>📚 Lecture Summary & Key Concepts</Text>
                  <Text style={[styles.notesContent, { color: theme.textSecondary }]}>
                    In this session, we analyze algorithm efficiency using asymptotic notation. We examine how Big-O, Big-Theta, and Big-Omega bound execution time for polynomial and recursive structures.
                  </Text>

                  <TouchableOpacity
                    style={[styles.downloadBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => Alert.alert('Download Started', 'Downloading lecture slides PDF to device...')}
                  >
                    <Ionicons name="cloud-download-outline" size={18} color={theme.primary} />
                    <Text style={[styles.downloadText, { color: theme.primary }]}>Download Lecture Slides (PDF, 4.2 MB)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ) : null}
        </View>

        {/* Right: Modules & Lessons Playlist */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.syllabusHeading, { color: theme.textPrimary }]}>Course Syllabus & Modules</Text>

          {course.modules.map((mod) => {
            const isExpanded = expandedModules.includes(mod._id);
            return (
              <Card key={mod._id} style={styles.moduleCard}>
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(mod._id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.moduleTitle, { color: theme.textPrimary }]}>{mod.title}</Text>
                    <Text style={[styles.moduleMeta, { color: theme.textSecondary }]}>
                      {mod.lessons.length} Lessons • {mod.duration}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.lessonsList}>
                    {mod.lessons.map((lesson) => {
                      const isActive = activeLesson?._id === lesson._id;
                      const isCompleted = completedLessonIds.includes(lesson._id);
                      return (
                        <TouchableOpacity
                          key={lesson._id}
                          style={[
                            styles.lessonItem,
                            isActive && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                          ]}
                          onPress={() => setActiveLesson(lesson)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                            size={18}
                            color={isCompleted ? '#10B981' : theme.textMuted}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.lessonItemTitle,
                                { color: isActive ? theme.primary : theme.textPrimary },
                                isActive && { fontWeight: '700' },
                              ]}
                            >
                              {lesson.title}
                            </Text>
                            <Text style={[styles.lessonItemDuration, { color: theme.textMuted }]}>
                              {lesson.duration}
                            </Text>
                          </View>
                          <Ionicons
                            name={lesson.type === 'video' ? 'play' : 'document-text'}
                            size={16}
                            color={isActive ? theme.primary : theme.textMuted}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerCard: {
    padding: 0,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
    marginBottom: spacing.md,
  },
  heroThumbnail: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  heroInstructor: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 2,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressPercentageText: {
    fontSize: 22,
    fontWeight: '800',
  },
  layoutGrid: {
    gap: spacing.lg,
  },
  playerCard: {
    padding: 0,
    overflow: 'hidden',
  },
  videoMockContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  videoMockTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  videoDuration: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  playerBody: {
    padding: spacing.lg,
  },
  playerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  activeLessonTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeLessonMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  notesSection: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  notesHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  notesContent: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  syllabusHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  moduleCard: {
    marginBottom: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  moduleMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  lessonsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
    marginBottom: 4,
  },
  lessonItemTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  lessonItemDuration: {
    fontSize: 11,
    marginTop: 2,
  },
});
