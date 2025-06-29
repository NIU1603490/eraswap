import { View, Text, SafeAreaView, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useLocationStore } from '@/store/location-store';
import { useUserStore } from '@/store/user-store';
import { uploadImage } from '@/services/imageService';

export default function ModifyProfile() {
  const { user } = useClerk();
  const router = useRouter();
  const { countries, cities, universities,
    fetchCountries, fetchCities, fetchUniversities,
  } = useLocationStore();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { fetchUser, user: userData, updateProfile } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchUser(user.id);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.emailAddresses[0]?.emailAddress || '');
      setUsername(user.username || '');
      setImage(user.imageUrl || '');
    }
  }, [user]);

  useEffect(() => {
    fetchCountries().catch(() => { });
  }, [])

  useEffect(() => {
    if (userData) {
      setSelectedCountry(userData.country._id);
      setSelectedCity(userData.city._id);
      setSelectedUniversity(userData.university._id);
    }
  }, [userData]);

  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry).catch(() => { });
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCity) {
      fetchUniversities(selectedCity).catch(() => { });
    }
  }, [selectedCity]);

  const handleCancel = () => {
    router.push('/profile');
  };


  const handleEditImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      return Alert.alert('Permission Denied', 'Permission to access media library is required to upload images.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
    });
    if (result.canceled || !result.assets?.length) return;
    const b64 = result.assets[0].base64;
    if (b64) setImageBase64(`data:image/jpeg;base64,${b64}`);
    setImage(result.assets[0].uri);

  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!firstName || !username || !email) {
      Alert.alert('Error', 'First name, username, and email are required');
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = image;
      
      if (image !== user.imageUrl) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadImage(image);
          finalImageUrl = uploadResult;
        } finally{
          setIsUploading(false);
        }
      
      }

      // Update Clerk user profile
      await user.update({
        firstName: firstName,
        lastName: lastName,
        username: username,
      });

      if(imageBase64){
        const res = await user.setProfileImage({ file: imageBase64 });
        console.log(res);
      }
      

      // Update email if changed
      if (email !== user.emailAddresses[0]?.emailAddress) {
        const newEmail = await user.createEmailAddress({ email: email });
        await user.update({ primaryEmailAddressId: newEmail.id });
      }

      // Update password if provided
      if (password) {
        await user.updatePassword({ newPassword: password, currentPassword: oldPassword });
      }
      
      await updateProfile(user?.id, {
        firstName,
        lastName,
        username,
        country: selectedCountry,
        city: selectedCity,
        university: selectedUniversity,
        profilePicture: finalImageUrl,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.push('/profile');

    } catch (error) {
      // console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  }

    if (!fontsLoaded) {
      return null;
    }

    return (
      <SafeAreaView style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>Modify Profile</Text>
          <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
            <Text style={[styles.cancelButton, isSaving && styles.disabledButton]}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: image || user?.imageUrl || 'https://via.placeholder.com/130?text=No+Image' }}
            style={styles.profileImage}

          />
          {isUploading && (
            <View style={styles.imageOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage} disabled={isSaving || isUploading}>
            <Text style={[styles.editImageText, isSaving && styles.disabledButton]}>Edit image</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>First Name</Text>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Last Name</Text>
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Username</Text>
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={!isSaving}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Country</Text>
            <Dropdown
              style={styles.input}
              data={countries.map(c => ({ label: c.name, value: c._id }))}
              labelField="label"
              valueField="value"
              placeholder="Select country"
              value={selectedCountry}
              onChange={item => {
                setSelectedCountry(item.value);
                setSelectedCity('');
                setSelectedUniversity('');
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>City</Text>
            <Dropdown
              style={styles.input}
              data={cities.map(c => ({ label: c.name, value: c._id }))}
              labelField="label"
              valueField="value"
              placeholder="Select city"
              value={selectedCity}
              onChange={item => {
                setSelectedCity(item.value);
                setSelectedUniversity('');
              }}
              disable={!selectedCountry}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>University</Text>
            <Dropdown
              style={styles.input}
              data={universities.map(u => ({ label: u.name, value: u._id }))}
              labelField="label"
              valueField="value"
              placeholder="Select university"
              value={selectedUniversity}
              onChange={item => setSelectedUniversity(item.value)}
              disable={!selectedCity}
            />
          </View>

          <Text style={styles.sectionSubtitle}> Change Password </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Current Password</Text>
            <TextInput
              placeholder="Current Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              style={styles.input}
              secureTextEntry
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}> New Password</Text>
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              editable={!isSaving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Confirm Password</Text>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
              editable={!isSaving}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isSaving && styles.disabledButtonContainer]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={[styles.buttonText, isSaving && styles.disabledButton]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
      marginTop: 30,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center', // Fixed typo from alignContent
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    title: {
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Bold',
    },
    sectionSubtitle: {
      fontSize: 18,
      fontFamily: 'PlusJakartaSans-Bold',
      color: '#000',
      marginBottom: 4,
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    cancelButton: {
      fontSize: 14,
      color: 'red',
      fontFamily: 'PlusJakartaSans-Bold',
    },
    disabledButton: {
      color: 'white',
    },
    disabledButtonContainer: {
      backgroundColor: '#A0A0A0',
    },
    profileContainer: {
      marginTop: 10,
      alignItems: 'center',
      fontFamily: 'PlusJakartaSans-Regular',
    },
    profileImage: {
      width: 130,
      height: 130,
      borderRadius: 100,
      marginBottom: 10,
    },
    imageOverlay: { 
      ...StyleSheet.absoluteFillObject, 
      backgroundColor: 'rgba(0,0,0,0.4)', 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderRadius: 100 },
    inputContainer: {
      marginHorizontal: 20,
      marginVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    editImageButton: {
      marginBottom: 10,
    },
    editImageText: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Bold',
      marginLeft: 5,
      color: 'blue',
    },
    input: {
      fontSize: 15,
      fontFamily: 'PlusJakartaSans-Regular',
      marginLeft: 5,
      borderWidth: 1,
      borderColor: '#E5E5E7',
      borderRadius: 8,
      padding: 5,
      width: '70%',
      height: 40,
      backgroundColor: '#FAFAFA',
    },
    inputText: {
      fontSize: 15,
      fontFamily: 'PlusJakartaSans-Bold',
      marginLeft: 5,
      width: 80,
    },
    buttonContainer: {
      padding: 16,
    },
    button: {
      backgroundColor: '#007AFF',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      margin: 16,
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'PlusJakartaSans-Bold',
    },
  });