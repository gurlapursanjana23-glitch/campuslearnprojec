import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface LoginScreenProps {
  onBackToLanding: () => void;
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBackToLanding,
  onSuccess,
}) => {
  const { themeMode, loginWithEmail, isLoading } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleAccounts = [
    { role: 'Student', email: 'student@campuslearn.edu', desc: 'Aarav Sharma (B.Tech CSE Sem 6)' },
    { role: 'Faculty', email: 'faculty@campuslearn.edu', desc: 'Dr. Priya Ramanathan (Assoc. Prof)' },
    { role: 'HOD', email: 'hod@campuslearn.edu', desc: 'Prof. Rajesh Kulkarni (Dept Head)' },
    { role: 'Admin', email: 'admin@campuslearn.edu', desc: 'Central University Administrator' },
  ];

  const handleFillSample = (sampleEmail: string) => {
    setEmail(sampleEmail);
    setPassword('CampusLearn@123');
    setErrorMsg('');
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your institutional email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }
    setErrorMsg('');
    try {
      const success = await loginWithEmail(email, password);
      if (success) {
        onSuccess();
      }
    } catch (e: any) {
      setErrorMsg('Invalid institutional credentials. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back to Landing */}
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onBackToLanding}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Back to Home</Text>
        </TouchableOpacity>

        {/* Login Card */}
        <Card style={styles.authCard} variant="elevated">
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.logoBadge, { backgroundColor: '#F97316' }]}>
              <Ionicons name="school" size={26} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>CampusLearn Login</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in with your university credentials to access courses, attendance, and placement suites
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Institutional Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                placeholder="e.g., student@campuslearn.edu"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Password</Text>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                placeholder="••••••••••••"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title="Sign In"
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleLogin}
            style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}
          />

          {/* Institutional Test Accounts Guide */}
          <View style={[styles.sampleAccountsBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ionicons name="key-outline" size={16} color="#F97316" />
              <Text style={[styles.sampleBoxTitle, { color: theme.textPrimary }]}>
                Sample Institutional Accounts:
              </Text>
            </View>

            {sampleAccounts.map((acc) => (
              <TouchableOpacity
                key={acc.email}
                style={[styles.sampleRow, { borderBottomColor: theme.border }]}
                onPress={() => handleFillSample(acc.email)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sampleRole, { color: theme.textPrimary }]}>
                    {acc.role}: <Text style={{ color: '#F97316' }}>{acc.email}</Text>
                  </Text>
                  <Text style={[styles.sampleDesc, { color: theme.textMuted }]}>{acc.desc}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={theme.textMuted} />
              </TouchableOpacity>
            ))}

            <Text style={[styles.samplePwdHint, { color: theme.textSecondary }]}>
              Password for all sample accounts: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>CampusLearn@123</Text>
            </Text>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: 6,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
  },
  authCard: {
    width: '100%',
    maxWidth: 480,
    padding: spacing.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  sampleAccountsBox: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  sampleBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sampleRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  sampleDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  samplePwdHint: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});
