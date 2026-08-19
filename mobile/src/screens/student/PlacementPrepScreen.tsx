import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { TabSelector } from '../../components/common/TabSelector';
import { MOCK_APTITUDE_QUIZ, MOCK_PLACEMENTS } from '../../services/api';

export const PlacementPrepScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [activeTab, setActiveTab] = useState('aptitude');

  // Aptitude Simulator State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Job Drives State
  const [placements, setPlacements] = useState(MOCK_PLACEMENTS);

  const tabs = [
    { key: 'aptitude', label: 'Aptitude Test' },
    { key: 'interview', label: 'Mock Interviews' },
    { key: 'resume', label: 'AI Resume Score' },
    { key: 'drives', label: 'Campus Drives', count: placements.length },
  ];

  const currentQ = MOCK_APTITUDE_QUIZ[currentQIndex];

  const handleSelectOption = (optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    MOCK_APTITUDE_QUIZ.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleApplyCompany = (id: string, name: string) => {
    setPlacements((prev) =>
      prev.map((p) => (p._id === id ? { ...p, applied: true } : p))
    );
    Alert.alert('Application Submitted! 🚀', `Your student profile & resume have been forwarded to the campus recruiters at ${name}.`);
  };

  const interviewQuestions = [
    {
      q: 'How does indexing work internally in MySQL (B+ Trees vs Hash)?',
      topic: 'DBMS & Systems',
      answer: 'MySQL InnoDB uses B+ Trees for primary and secondary indexes. B+ trees store all records in leaf nodes connected as a doubly linked list, enabling efficient range scans (O(log n) search + linear scan). Hash indexes offer O(1) lookup for equality (=) but cannot execute range queries (BETWEEN, >).',
    },
    {
      q: 'Explain the difference between Process and Thread, and what causes a Deadlock?',
      topic: 'Operating Systems',
      answer: 'A Process is an independent executing program with its own isolated address space, heap, and file descriptors. A Thread is a lightweight execution unit sharing the parent process memory.\n\nDeadlock occurs when 4 Coffman conditions are simultaneously met: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
    },
    {
      q: 'Describe how you optimized slow API endpoints in a full-stack project.',
      topic: 'Behavioral & Project',
      answer: 'STAR Framework: Situation - API endpoint had 850ms latency. Task - Reduce p95 below 100ms. Action - Added Redis cache for read-heavy metadata, converted N+1 queries into bulk joins, and indexed foreign keys. Result - Latency dropped to 42ms with 90% DB load reduction.',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.heading, { color: theme.textPrimary }]}>Placement Preparation Suite</Text>
            <Badge label="Nayana G. Naik Module" variant="purple" size="sm" />
          </View>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Practice aptitude, prepare for technical interviews, analyze your resume, and apply to top hiring drives
          </Text>
        </View>
      </View>

      <TabSelector tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: APTITUDE SIMULATOR */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'aptitude' && (
        <View style={styles.tabContent}>
          <Card style={styles.quizCard} variant="elevated">
            {/* Top Progress */}
            <View style={styles.quizTop}>
              <Badge label={`Question ${currentQIndex + 1} of ${MOCK_APTITUDE_QUIZ.length}`} variant="primary" />
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                <Text style={styles.timerText}>14:30 Remaining</Text>
              </View>
            </View>
            <ProgressBar progress={((currentQIndex + 1) / MOCK_APTITUDE_QUIZ.length) * 100} height={6} style={{ marginVertical: spacing.sm }} />

            {/* Question Text */}
            <Text style={[styles.questionTitle, { color: theme.textPrimary }]}>
              {currentQ.question}
            </Text>

            {/* Options */}
            <View style={styles.optionsList}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQIndex] === idx;
                const isCorrect = currentQ.correctAnswer === idx;

                let optBg = theme.surface;
                let optBorder = theme.border;
                if (isSelected) {
                  optBg = theme.primaryLight;
                  optBorder = theme.primary;
                }
                if (quizSubmitted) {
                  if (isCorrect) {
                    optBg = 'rgba(16, 185, 129, 0.15)';
                    optBorder = '#10B981';
                  } else if (isSelected && !isCorrect) {
                    optBg = 'rgba(239, 68, 68, 0.15)';
                    optBorder = '#EF4444';
                  }
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.optionItem, { backgroundColor: optBg, borderColor: optBorder }]}
                    onPress={() => handleSelectOption(idx)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.optionCircle,
                        { borderColor: isSelected ? theme.primary : theme.border },
                        isSelected && { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={[styles.optionLetter, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text style={[styles.optionLabel, { color: theme.textPrimary }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation Box */}
            {(showExplanation || quizSubmitted) && currentQ.explanation && (
              <View style={[styles.explanationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.explanationHeading, { color: '#F59E0B' }]}>Solution & Concept</Text>
                  <Text style={[styles.explanationBody, { color: theme.textSecondary }]}>{currentQ.explanation}</Text>
                </View>
              </View>
            )}

            {/* Quiz Navigation Buttons */}
            <View style={styles.quizNavRow}>
              <Button
                title="Previous"
                variant="secondary"
                size="small"
                disabled={currentQIndex === 0}
                onPress={() => {
                  setCurrentQIndex((p) => p - 1);
                  setShowExplanation(false);
                }}
              />

              {!quizSubmitted && (
                <Button
                  title={showExplanation ? 'Hide Explanation' : 'Hint / Explain'}
                  variant="ghost"
                  size="small"
                  onPress={() => setShowExplanation(!showExplanation)}
                />
              )}

              {currentQIndex < MOCK_APTITUDE_QUIZ.length - 1 ? (
                <Button
                  title="Next Question"
                  variant="primary"
                  size="small"
                  onPress={() => {
                    setCurrentQIndex((p) => p + 1);
                    setShowExplanation(false);
                  }}
                />
              ) : !quizSubmitted ? (
                <Button
                  title="Submit Test"
                  variant="success"
                  size="small"
                  onPress={() => setQuizSubmitted(true)}
                />
              ) : (
                <Button
                  title="Retake Quiz"
                  variant="outline"
                  size="small"
                  onPress={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                    setCurrentQIndex(0);
                  }}
                />
              )}
            </View>

            {/* Result Banner if submitted */}
            {quizSubmitted && (
              <View style={[styles.resultBanner, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                <Ionicons name="trophy" size={24} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: '#10B981' }]}>
                    Test Score: {calculateScore()} / {MOCK_APTITUDE_QUIZ.length} Correct ({Math.round((calculateScore() / MOCK_APTITUDE_QUIZ.length) * 100)}%)
                  </Text>
                  <Text style={[styles.resultSub, { color: theme.textSecondary }]}>
                    Great performance! You are performing in the top 10% percentile of campus aptitude tests.
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: MOCK INTERVIEWS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'interview' && (
        <View style={styles.tabContent}>
          <Text style={[styles.tabSectionHeading, { color: theme.textPrimary }]}>
            High-Frequency Campus Interview Questions
          </Text>

          {interviewQuestions.map((item, idx) => (
            <Card key={idx} style={styles.interviewCard}>
              <View style={styles.interviewTop}>
                <Badge label={item.topic} variant="purple" size="sm" />
                <Badge label={`Q${idx + 1}`} variant="primary" size="sm" />
              </View>
              <Text style={[styles.interviewQ, { color: theme.textPrimary }]}>{item.q}</Text>

              <View style={[styles.interviewAnsBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.modelAnsLabel, { color: theme.primary }]}>💡 Recommended Model Response:</Text>
                <Text style={[styles.interviewAnsText, { color: theme.textSecondary }]}>{item.answer}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: AI RESUME ANALYZER */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'resume' && (
        <View style={styles.tabContent}>
          <Card style={styles.resumeCard} variant="elevated">
            <View style={styles.scoreRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resumeHeading, { color: theme.textPrimary }]}>Aarav_Sharma_Resume_2026.pdf</Text>
                <Text style={[styles.resumeSub, { color: theme.textSecondary }]}>ATS Parser Compatibility: High</Text>
              </View>
              <View style={[styles.scoreBadge, { borderColor: '#10B981' }]}>
                <Text style={[styles.scoreValue, { color: '#10B981' }]}>88</Text>
                <Text style={[styles.scoreScale, { color: theme.textMuted }]}>/ 100</Text>
              </View>
            </View>

            <ProgressBar progress={88} color="#10B981" height={10} style={{ marginVertical: spacing.md }} />

            {/* Strengths */}
            <Text style={[styles.subSectionTitle, { color: theme.textPrimary }]}>✅ Detected ATS Strengths</Text>
            <View style={styles.strengthList}>
              <Text style={[styles.strengthItem, { color: theme.textSecondary }]}>• Quantified metric impacts present across project bullets (e.g. 90% DB load reduction).</Text>
              <Text style={[styles.strengthItem, { color: theme.textSecondary }]}>• Strong core CS keywords found: React Native, Node.js, B+ Trees, REST APIs, Redis, JWT.</Text>
              <Text style={[styles.strengthItem, { color: theme.textSecondary }]}>• Valid clickable GitHub and LinkedIn links.</Text>
            </View>

            {/* Improvements */}
            <Text style={[styles.subSectionTitle, { color: theme.textPrimary, marginTop: spacing.md }]}>⚡ Recommended Enhancements</Text>
            <View style={styles.strengthList}>
              <Text style={[styles.improveItem, { color: '#F59E0B' }]}>• Consider adding Docker containerization and AWS ECS/Lambda keywords for cloud roles.</Text>
              <Text style={[styles.improveItem, { color: '#F59E0B' }]}>• Add unit testing frameworks (Jest, Mocha) under technical skills section.</Text>
            </View>

            <Button
              title="Re-Upload Updated Resume"
              variant="outline"
              size="small"
              icon={<Ionicons name="document-text-outline" size={16} color={theme.primary} />}
              onPress={() => Alert.alert('Resume Upload', 'Select new PDF document to re-analyze ATS score.')}
              style={{ marginTop: spacing.lg }}
            />
          </Card>
        </View>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: CAMPUS DRIVES */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'drives' && (
        <View style={styles.tabContent}>
          <Text style={[styles.tabSectionHeading, { color: theme.textPrimary }]}>
            Active Corporate Hiring Drives
          </Text>

          {placements.map((drive) => (
            <Card key={drive._id} style={styles.driveCard}>
              <View style={styles.driveHeader}>
                <Image source={{ uri: drive.companyLogo }} style={styles.companyLogo} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.companyName, { color: theme.textPrimary }]}>{drive.companyName}</Text>
                  <Text style={[styles.driveRole, { color: theme.textSecondary }]}>{drive.role}</Text>
                </View>
                <Badge label={drive.type} variant="purple" size="sm" />
              </View>

              <View style={styles.driveMetaRow}>
                <View style={styles.driveMetaCol}>
                  <Text style={[styles.driveMetaLabel, { color: theme.textMuted }]}>Package</Text>
                  <Text style={[styles.driveMetaVal, { color: '#10B981', fontWeight: '800' }]}>{drive.package}</Text>
                </View>
                <View style={styles.driveMetaCol}>
                  <Text style={[styles.driveMetaLabel, { color: theme.textMuted }]}>Location</Text>
                  <Text style={[styles.driveMetaVal, { color: theme.textPrimary }]}>{drive.location}</Text>
                </View>
                <View style={styles.driveMetaCol}>
                  <Text style={[styles.driveMetaLabel, { color: theme.textMuted }]}>Deadline</Text>
                  <Text style={[styles.driveMetaVal, { color: '#EF4444' }]}>{drive.deadline}</Text>
                </View>
              </View>

              {/* Eligibility */}
              <View style={styles.eligibilityRow}>
                {drive.eligibility.map((el, i) => (
                  <Badge key={i} label={el} variant="info" size="sm" />
                ))}
              </View>

              <Button
                title={drive.applied ? 'Application Submitted ✓' : 'Apply for Drive'}
                variant={drive.applied ? 'success' : 'primary'}
                size="small"
                disabled={drive.applied}
                onPress={() => handleApplyCompany(drive._id, drive.companyName)}
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ))}
        </View>
      )}
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
  tabContent: {
    gap: spacing.md,
  },
  tabSectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  quizCard: {
    padding: spacing.lg,
  },
  quizTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginVertical: spacing.md,
  },
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionLabel: {
    fontSize: 14,
    flex: 1,
  },
  explanationCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  explanationHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  explanationBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  quizNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultBanner: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultSub: {
    fontSize: 12,
    marginTop: 2,
  },
  interviewCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  interviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  interviewQ: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  interviewAnsBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  modelAnsLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  interviewAnsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  resumeCard: {
    padding: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  resumeSub: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreScale: {
    fontSize: 10,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  strengthList: {
    gap: 4,
  },
  strengthItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  improveItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  driveCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  driveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
  },
  driveRole: {
    fontSize: 12,
    marginTop: 2,
  },
  driveMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.sm,
  },
  driveMetaCol: {
    alignItems: 'flex-start',
  },
  driveMetaLabel: {
    fontSize: 11,
  },
  driveMetaVal: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  eligibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
