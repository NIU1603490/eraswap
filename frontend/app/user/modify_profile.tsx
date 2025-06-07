import { View, Text, SafeAreaView, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Backend API URL for image upload (replace with your actual backend or Cloudinary URL)


export default function ModifyProfile() {
  const { user } = useClerk();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState(''); // Not used in Clerk, can be sent to backend
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fullName = user.fullName || '';
      const [fName, lName] = fullName.split(' ');
      setFirstName(fName || '');
      setLastName(lName || '');
      setEmail(user.emailAddresses[0]?.emailAddress || '');
      setUsername(user.username || '');
      setImage(user.imageUrl || '');
    }
  }, [user]);

  const handleCancel = () => {
    router.push('/profile');
  };


  const handleEditImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'Permission to access media library is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      user?.update({
        unsafeMetadata: { imageUrl: result.assets[0].uri }
      });
      console.log('Image selected:', result.assets[0].uri);
    } else {
      console.log('No image selected');
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Validate inputs
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
      // Update profile image if changed
      let updatedImageUrl = user.imageUrl;

      // Update Clerk user profile
      await user.update({
        firstName,
        lastName,
        username,
        unsafeMetadata: { imageUrl: updatedImageUrl },
      });

      // Update email if changed
      if (email !== user.emailAddresses[0]?.emailAddress) {
        const newEmail = await user.createEmailAddress({ email: email });
        await user.update({ primaryEmailAddressId: newEmail.id });
      }

      // Update password if provided
      if (password) {
        await user.updatePassword({ newPassword: password });
      }

      // Optionally: Update backend database with additional fields (e.g., address)
      // Example: await api.patch(`/users/${user.id}`, { address });

      Alert.alert('Success', 'Profile updated successfully');
      router.push('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

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
        <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage} disabled={isSaving}>
          <Text style={[styles.editImageText, isSaving && styles.disabledButton]}>Edit image</Text>
        </TouchableOpacity>
      </View>

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
        <Text style={styles.inputText}>Password</Text>
        <TextInput
          placeholder="Password"
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

      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>Address</Text>
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          editable={!isSaving}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isSaving && styles.disabledButtonContainer]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={[styles.buttonText, isSaving && styles.disabledButton]}>
          {isSaving ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
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
  cancelButton: {
    fontSize: 14,
    color: 'red',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  disabledButton: {
    color: '#A0A0A0',
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
  inputContainer: {
    marginTop: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
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
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 5,
    width: 250,
    height: 30,
  },
  inputText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    marginLeft: 5,
    width: 80,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 16,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});