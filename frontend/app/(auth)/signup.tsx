import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { styles } from '../../assets/constants/auth_styles';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, Redirect, useRouter } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { Country, City, University, SignUpData, FormData } from '../../services/types';
import { useAuth, useSignUp, useClerk } from '@clerk/clerk-expo';
import { useForm, Controller } from 'react-hook-form';
import { useLocationStore } from '@/store/location-store';
import { useUserStore } from '@/store/user-store';
import Toast from 'react-native-toast-message';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';


export default function SignUp() {
  const router = useRouter();
  const { countries, cities, universities,
    fetchCountries, fetchCities, fetchUniversities,
  } = useLocationStore();

  const { saveUser } = useUserStore();
  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const { setActive } = useClerk();
  const scrollViewRef = useRef<ScrollView>(null);

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      country: '',
      city: '',
      university: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  // Dropdown states
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
         await fetchCountries();
      } catch (err: any) {
        setError('Failed to load countries');
        Toast.show({ type: 'error', text1: 'Failed to load countries' });
      }
    };
    loadCountries();
  }, []);


  useEffect(() => {
    const loadCities = async () => {
      if (!selectedCountryId) {
        setValue('city', '');
        setValue('university', '');
        setSelectedCityId(null);
        return;
      }
      try {
        await fetchCities(selectedCountryId);
      } catch (err: any) {
        setError('Failed to load cities');
        Toast.show({ type: 'error', text1: 'Failed to load cities' });
      }
    };
    loadCities();
  }, [selectedCountryId, setValue]);


  useEffect(() => {
    const loadUniversities = async () => {
      if (!selectedCityId) {
        setValue('university', '');
        return;
      }
      try {
        await fetchUniversities(selectedCityId);
      } catch (err: any) {
        setError('Failed to load universities');
        Toast.show({ type: 'error', text1: 'Failed to load universities' });
      }
    };
    loadUniversities();
  }, [selectedCityId, setValue]);

  // Memoized dropdown lists using _id
  const countryList = useMemo(() => countries.map((c) => ({ label: c.name, value: c._id })), [countries]);
  const cityList = useMemo(() => cities.map((c) => ({ label: c.name, value: c._id })), [cities]);
  const universityList = useMemo(() => universities.map((u) => ({ label: u.name, value: u._id })), [universities]);

  // Sign-up handler
  const onSignUp = async (data: SignUpData) => {
    if (!isLoaded) {
      setError('Authentication service not loaded.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName, 
      });
   
      if (!result.createdUserId) {
        throw new Error('User ID is missing from Clerk response');
      }

      console.log('Clerk user created:', result.createdUserId);

      const res = await saveUser({
        clerkUserId: result.createdUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        country: data.country, // ObjectId
        city: data.city, // ObjectId
        university: data.university, // ObjectId
      });

      console.log('User saved to MongoDB:', res);

      // Handle signup status
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        console.log('Sign-up successful! User is signed in.');
        router.push('/home');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during sign-up. Please try again.');
      Alert.alert('Sign-up Error', error.message || 'An error occurred during sign-up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const onSubmit = (data: FormData) => {
    console.log('onSubmit called with data:', data);

    // Validate required fields
    if (!data.agreeTerms) {
      setError('You must agree to the terms');
      Toast.show({ type: 'error', text1: 'You must agree to the terms' });
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 500, animated: true });
      }
      return;
    }
    setError(null);
    const { confirmPassword, agreeTerms, ...signupData } = data;
    onSignUp(signupData);
  };

  // handle submit with error scrolling
  const handleFormSubmit = () => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const errorFieldY: { [key: string]: number } = {
        firstName: 100,
        lastName: 100,
        username: 150,
        country: 200,
        city: 250,
        university: 300,
        email: 350,
        password: 400,
        confirmPassword: 450,
      };
      const y = errorFieldY[firstError as keyof FormData];
      if (y && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y, animated: true });
      }
      Toast.show({ type: 'error', text1: 'Please fix form errors' });
    }
    handleSubmit(onSubmit)();
  };

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
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create an account</Text>
              <View style={styles.loginLinkContainer}>
                <Link href="/(auth)/signin" style={styles.loginLink}>
                  Already have an account?
                </Link>
              </View>

              {/* First Name and Last Name */}
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>First name*</Text>
                  <Controller
                    control={control}
                    name="firstName"
                    rules={{ required: 'First name is required', minLength: { value: 2, message: 'First name must be at least 2 characters' } }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, errors.firstName && { borderColor: 'red', borderWidth: 1 }]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Ari"
                        placeholderTextColor="#999"
                        accessibilityLabel="First name"
                        accessibilityHint="Enter your first name"
                      />
                    )}
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName.message}</Text>
                  )}
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Last name*</Text>
                  <Controller
                    control={control}
                    name="lastName"
                    rules={{ required: 'Last name is required', minLength: { value: 2, message: 'Last name must be at least 2 characters' } }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[styles.input, errors.lastName && { borderColor: 'red', borderWidth: 1 }]}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Sais"
                        placeholderTextColor="#999"
                        accessibilityLabel="Last name"
                        accessibilityHint="Enter your last name"
                      />
                    )}
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName.message}</Text>
                  )}
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username*</Text>
                <Controller
                  control={control}
                  name="username"
                  rules={{
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.username && { borderColor: 'red', borderWidth: 1 }]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="Username"
                      placeholderTextColor="#999"
                      accessibilityLabel="Username"
                      accessibilityHint="Enter your username"
                    />
                  )}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username.message}</Text>
                )}
              </View>

              {/* Country Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Country*</Text>
                <Controller
                  control={control}
                  name="country"
                  rules={{ required: 'Country is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={[styles.input, errors.country && { borderColor: 'red', borderWidth: 1 }]}
                      placeholderStyle={{ color: '#999' }}
                      selectedTextStyle={{ color: '#333' }}
                      containerStyle={{ backgroundColor: '#fff', borderRadius: 5 }}
                      data={countryList}
                      search
                      searchPlaceholder="Search country..."
                      labelField="label"
                      valueField="value"
                      placeholder="Country destination"
                      value={value}
                      onChange={(item) => {
                        onChange(item.value); // Set _id
                        setValue('city', '');
                        setValue('university', '');
                        setSelectedCityId(null);
                        setSelectedCountryId(item.value);
                      }}
                    />
                  )}
                />
                {errors.country && <Text style={styles.errorText}>{errors.country.message}</Text>}
              </View>

              {/* City Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>City*</Text>
                <Controller
                  control={control}
                  name="city"
                  rules={{ required: 'City is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={[styles.input, errors.city && { borderColor: 'red', borderWidth: 1 }]}
                      placeholderStyle={{ color: '#999' }}
                      selectedTextStyle={{ color: '#333' }}
                      containerStyle={{ backgroundColor: '#fff', borderRadius: 5 }}
                      data={cityList}
                      search
                      searchPlaceholder="Search city..."
                      labelField="label"
                      valueField="value"
                      placeholder="City destination"
                      value={value}
                      onChange={(item) => {
                        onChange(item.value); // Set _id
                        setValue('university', '');
                        setSelectedCityId(item.value);
                      }}
                      disable={!selectedCountryId}
                    />
                  )}
                />
                {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
              </View>

              {/* University Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>University</Text>
                <Controller
                  control={control}
                  name="university"
                  rules={{ required: 'University is required' }}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={[styles.input, errors.university && { borderColor: 'red', borderWidth: 1 }]}
                      placeholderStyle={{ color: '#999' }}
                      selectedTextStyle={{ color: '#333' }}
                      containerStyle={{ backgroundColor: '#fff', borderRadius: 5 }}
                      data={universityList}
                      search
                      searchPlaceholder="Search university..."
                      labelField="label"
                      valueField="value"
                      placeholder="University destination"
                      value={value}
                      onChange={(item) => {
                        onChange(item.value); // Set _id
                      }}
                      disable={!selectedCityId}
                    />
                  )}
                />
                {errors.university && (
                  <Text style={styles.errorText}>{errors.university.message}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email address*</Text>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.email && { borderColor: 'red', borderWidth: 1 }]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="exam@gmail.com"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      accessibilityLabel="Email address"
                      accessibilityHint="Enter your email address"
                    />
                  )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password*</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.password && { borderColor: 'red', borderWidth: 1 }]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your password"
                    />
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm password*</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Please confirm your password',
                    validate: (value) => value === watch('password') || 'Passwords do not match',
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.confirmPassword && { borderColor: 'red', borderWidth: 1 }]}
                      value={value}
                      onChangeText={onChange}
                      placeholder="confirm password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      accessibilityLabel="Confirm password"
                      accessibilityHint="Re-enter your password"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}
              </View>

              {/* Terms Agreement */}
              <View style={styles.termsContainer}>
                <Controller
                  control={control}
                  name="agreeTerms"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      onPress={() => onChange(!value)}
                      style={[styles.checkbox, error === 'You must agree to the terms' && { borderColor: 'red', borderWidth: 1 }]}
                    >
                      <Ionicons
                        name={value ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color={value ? '#3b82f6' : '#a0aec0'}
                      />
                    </TouchableOpacity>
                  )}
                />
                <Text style={styles.termsText}>
                  I agree to the platform's <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>


              {error && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>}

              {/* Sign-up Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && { opacity: 0.6 }]}
                onPress={handleFormSubmit}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Sign up</Text>
              </TouchableOpacity>

              {/* Social Sign-up
              <View style={styles.separatorContainer}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>or sign up with</Text>
                <View style={styles.separator} />
              </View>

              <View style={styles.socialButtonsContainer}>
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