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
import { TabSelector } from '../../components/common/TabSelector';
import { Role } from '../../types';

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  idNumber: string;
  active: boolean;
}

const INITIAL_MEMBERS: Member[] = [
  { id: 'u1', name: 'Aarav Sharma', email: 'student@campuslearn.edu', role: 'student', department: 'CSE', idNumber: 'CS2024-042', active: true },
  { id: 'u2', name: 'Dr. Priya Ramanathan', email: 'priya.cs@campuslearn.edu', role: 'faculty', department: 'CSE', idNumber: 'FAC-2018-09', active: true },
  { id: 'u3', name: 'Prof. Rajesh Kulkarni', email: 'hod.cs@campuslearn.edu', role: 'hod', department: 'CSE', idNumber: 'HOD-CS-01', active: true },
  { id: 'u4', name: 'Ananya Deshmukh', email: 'ananya@campuslearn.edu', role: 'student', department: 'CSE', idNumber: 'CS2024-043', active: true },
  { id: 'u5', name: 'Er. Ananya Sen', email: 'ananya.faculty@campuslearn.edu', role: 'faculty', department: 'CSE', idNumber: 'FAC-2021-14', active: true },
  { id: 'u6', name: 'Devendra Patel', email: 'dev@campuslearn.edu', role: 'student', department: 'ECE', idNumber: 'EC2024-019', active: false },
];

export const AdminUsersScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('student');
  const [newDept, setNewDept] = useState('Computer Science');

  const tabs = [
    { key: 'all', label: 'All Users', count: members.length },
    { key: 'student', label: 'Students', count: members.filter((m) => m.role === 'student').length },
    { key: 'faculty', label: 'Faculty', count: members.filter((m) => m.role === 'faculty').length },
    { key: 'hod', label: 'HODs', count: members.filter((m) => m.role === 'hod').length },
  ];

  const filteredMembers = members.filter((m) => {
    const matchesTab = activeTab === 'all' || m.role === activeTab;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.idNumber.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleUserStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const handleAddMember = () => {
    if (!newName || !newEmail) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }
    const newMember: Member = {
      id: `usr_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDept,
      idNumber: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
    };
    setMembers((prev) => [newMember, ...prev]);
    setAddModalVisible(false);
    setNewName('');
    setNewEmail('');
    Alert.alert('User Onboarded! 🎉', `${newName} has been added with default credentials: CampusLearn@123`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>Campus User Directory</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Manage student rosters, faculty credentials, and institutional access
          </Text>
        </View>

        <Button
          title="Add New User"
          variant="primary"
          size="medium"
          icon={<Ionicons name="person-add" size={16} color="#FFFFFF" />}
          onPress={() => setAddModalVisible(true)}
        />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search by name, email, roll or employee ID..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TabSelector tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* User Cards List */}
      <View style={styles.userList}>
        {filteredMembers.map((m) => (
          <Card key={m.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarInitial}>{m.name.charAt(0)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>{m.name}</Text>
                <Badge
                  label={m.role.toUpperCase()}
                  variant={m.role === 'student' ? 'info' : m.role === 'faculty' ? 'primary' : 'purple'}
                  size="sm"
                />
              </View>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{m.email}</Text>
              <Text style={[styles.userDept, { color: theme.textMuted }]}>
                {m.department} • {m.idNumber}
              </Text>
            </View>

            <View style={styles.userActions}>
              <Badge
                label={m.active ? 'Active' : 'Suspended'}
                variant={m.active ? 'success' : 'danger'}
                size="sm"
              />
              <Button
                title={m.active ? 'Suspend' : 'Activate'}
                variant={m.active ? 'secondary' : 'success'}
                size="small"
                onPress={() => toggleUserStatus(m.id)}
              />
            </View>
          </Card>
        ))}
      </View>

      {/* Add User Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Onboard New Member</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Full Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g. Sumanth Hegde"
                placeholderTextColor={theme.textMuted}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Campus Email</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="sumanth@campuslearn.edu"
                placeholderTextColor={theme.textMuted}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Assign Role</Text>
              <View style={styles.rolePickerRow}>
                {(['student', 'faculty', 'hod'] as Role[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleOptionBtn,
                      {
                        backgroundColor: newRole === r ? theme.primaryLight : theme.surface,
                        borderColor: newRole === r ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setNewRole(r)}
                  >
                    <Text style={[styles.roleOptionText, { color: newRole === r ? theme.primary : theme.textSecondary }]}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={() => setAddModalVisible(false)}
              />
              <Button
                title="Create Account"
                variant="primary"
                size="medium"
                onPress={handleAddMember}
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
  userList: {
    gap: spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  userDept: {
    fontSize: 11,
    marginTop: 2,
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 6,
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
    marginBottom: spacing.md,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
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
  rolePickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleOptionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
