import { useAuth } from '@/contexts/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserRole = 'student' | 'teacher' | 'admin';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const roles: { value: UserRole; label: string; icon: string; color: string }[] = [
    { value: 'student', label: 'Student', icon: 'graduation-cap', color: '#1D52BC' },
    { value: 'teacher', label: 'Teacher', icon: 'book', color: '#1D52BC' },
    { value: 'admin', label: 'Admin', icon: 'cog', color: '#1D52BC' },
  ];

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email, password, selectedRole);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="arrow-left" size={24} color="#2D2B2B" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>
              Welcome back!{'\n'}Glad to see you again!
            </Text>

            {/* Role Selection */}
            <View style={styles.roleSection}>
              <Text style={styles.roleLabel}>Select Your Role</Text>
              <View style={styles.roleContainer}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => {
                      setSelectedRole(role.value);
                      setError('');
                    }}
                    style={[
                      styles.roleButton,
                      selectedRole === role.value && styles.roleButtonSelected,
                    ]}
                  >
                    <View style={styles.roleButtonContent}>
                      <FontAwesome
                        name={role.icon as any}
                        size={20}
                        color={selectedRole === role.value ? '#0A2E7F' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.roleButtonText,
                          selectedRole === role.value && styles.roleButtonTextSelected,
                        ]}
                      >
                        {role.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <FontAwesome
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerLink}>
              <Text style={styles.registerLinkText}>
                Don't have an account?{' '}
                <Text
                  style={styles.registerLinkBold}
                  onPress={() => router.push('/register')}
                >
                  Register Now
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2D2B2B',
    marginBottom: 8,
  },
  roleSection: {
    marginBottom: 24,
    marginTop: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2B2B',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  roleButtonSelected: {
    borderColor: '#0A2E7F',
    backgroundColor: 'rgba(10, 46, 127, 0.1)',
  },
  roleButtonContent: {
    alignItems: 'center',
  },
  roleButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleButtonTextSelected: {
    color: '#0A2E7F',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#2D2B2B',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    color: '#2D2B2B',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    marginBottom: 24,
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#1D52BC',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#0A2E7F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerLinkBold: {
    color: '#1D52BC',
    fontWeight: '600',
  },
});
