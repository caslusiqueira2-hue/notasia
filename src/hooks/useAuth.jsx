import { useState, useEffect, createContext, useContext } from 'react';
import { auth, signInAnonymously } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        signInAnonymously(auth)
          .then(() => {
            // onAuthStateChanged will trigger again
          })
          .catch((error) => {
            console.error("Anonymous auth failed:", error);
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
