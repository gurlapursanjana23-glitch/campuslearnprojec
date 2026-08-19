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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, DEMO_USERS } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Role } from '../../types';

interface LoginScreenProps {
  initialRole?: Role;
  onBackToLanding: () => void;
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialRole = 'student',
  onBackToLanding,
  onSuccess,
}) => {
  const { themeMode, loginAsRole, loginWithEmail, isLoading } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState(DEMO_USERS[initialRole].email);
  const [password, setPassword] = useState('CampusLearn@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleQuickSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
    setPassword('CampusLearn@123');
    setErrorMsg('');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    try {
      await loginAsRole(selectedRole);
      onSuccess();
    } catch (e: any) {
      setErrorMsg('Login failed. Please verify your credentials.');
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
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onBackToLanding}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Home</Text>
        </TouchableOpacity>

        {/* Login Card */}
        <Card style={styles.authCard} variant="elevated">
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="school" size={26} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Sign in to CampusLearn</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your college credentials or select a 1-tap demo persona below
            </Text>
          </View>

          {/* Quick Persona Picker */}
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            1-Tap Demo Persona Autofill:
          </Text>
          <View style={styles.rolePickerRow}>
            {(['student', 'faculty', 'hod', 'admin'] as Role[]).map((r) => {
              const isSelected = selectedRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.rolePill,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleRoleQuickSelect(r)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rolePillText,
                      { color: isSelected ? theme.primary : theme.textSecondary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {r.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                placeholder="name@campuslearn.edu"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Password</Text>
              <Text style={[styles.forgotText, { color: theme.primary }]}>Default: CampusLearn@123</Text>
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

          {/* Active User Info Preview */}
          <View style={[styles.activePersonaInfo, { backgroundColor: theme.surface }]}>
            <Ionicons name="information-circle" size={18} color={theme.primary} />
            <Text style={[styles.personaText, { color: theme.textSecondary }]}>
              Logging in as <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{DEMO_USERS[selectedRole].name}</Text> ({selectedRole})
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={`Sign In as ${selectedRole.toUpperCase()}`}
            variant="primary"
            size="large"
            loading={isLoading}
            onPress={handleLogin}
            style={{ marginTop: spacing.md }}
          />
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
    maxWidth: 460,
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.lg,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
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
  forgotText: {
    fontSize: 11,
    fontWeight: '600',
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
  activePersonaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
    gap: 8,
  },
  personaText: {
    fontSize: 12,
  },
});
