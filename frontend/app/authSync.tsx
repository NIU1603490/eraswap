// src/AuthSync.tsx
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { setAuthToken } from '../services/api';

export default function AuthSync() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    // sincronize the heather
    (async () => {
      if (isSignedIn) {
        const token = await getToken();
        setAuthToken(token);
      } else {
        setAuthToken(null);
      }
    })();
  }, [isSignedIn, getToken]);

  return null; // No renderiza nada visible
}
