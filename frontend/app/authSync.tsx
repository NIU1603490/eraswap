import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { setAuthToken } from '../services/api';
import {registerTokenGetter} from '@/services/authToken';

export default function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  useEffect(() => {
    const syncToken = async () => {
      if (isSignedIn) {
        const token = await getToken({ skipCache: true });
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    };
    registerTokenGetter(() => getToken({ skipCache: true }));
    syncToken();
  }, [isSignedIn, getToken]);


  return null; // No renderiza nada visible
}
