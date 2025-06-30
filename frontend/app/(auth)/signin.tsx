import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { styles } from '../../assets/constants/auth_styles';
import { SignInFields } from '../../services/types';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function SignIn() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();

  if(isSignedIn) {
    router.push('/home');
  }

  const onSignIn = async (data: SignInFields) => {
    if (!isLoaded) return;
    if(!data.email || !data.password) {
      setError('Email and password are required');
      return;
    }

    
    try {
      setIsLoading(true);
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt.status === 'complete') {
        console.log('Sign-in successful!');
        await setActive({ session: signInAttempt.createdSessionId });
        // router.push('/home');
      } else {
        console.log('Sign-in failed:', signInAttempt.status);
        setError('Invalid email or password. Please try again.');
      }

      console.log('Sign-in attempt:', signInAttempt);

    } catch (error: any) {
      console.error('Error during sign-in:', error);
      setError(error.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  }

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if(!isLoaded || isLoading) {
    return (
      <View style={HS.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }


  return (
    <LinearGradient colors={['#1E88E5', '#93BFD9', '#FFD663']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Log in</Text>
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>
                  <Link href="/(auth)/signup" style={styles.loginLink}>
                    Don't have an account? Sign up
                  </Link>
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email address*</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="exam@gmail.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password*</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="password"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.6 }]}
                onPress={() => onSignIn({ email, password })}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Log in</Text>
              </TouchableOpacity>

              {/* <View style={styles.separatorContainer}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>or log in with</Text>
                <View style={styles.separator} />
              </View> */}

              {/* <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => {
                    console.log('Google button pressed');
                  }}
                >
                  <View style={styles.googleIconContainer}>
                    <Ionicons name="logo-google" size={24} color="#333" />
                  </View>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}