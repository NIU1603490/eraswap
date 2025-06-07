import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Ensure gradient is visible
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 60,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'left', // Consistent with login.tsx
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16, // Added for consistency
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  loginLink: {
    color: 'white',
    fontWeight: 'bold',
    margin: 6,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputHalf: {
    width: '48%',
    marginBottom: 18,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  checkbox: {
    marginRight: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  termsText: {
    color: 'white',
    flex: 1,
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  separatorText: {
    color: 'white',
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#333',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  forgotPassword: {
    color: '#3b82f6',
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 30,
    marginLeft: 30,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  errorText: {
  color: 'red',
  fontSize: 12,
  marginTop: 5,
},
});