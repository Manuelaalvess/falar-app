import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { onAuthStateChanged } from '../services/auth';

interface AuthState {
  user: User | null;
  initializing: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return { user, initializing };
}
