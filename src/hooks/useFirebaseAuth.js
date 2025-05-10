// src/hooks/useFirebaseAuth.js
import { useEffect, useState } from "react";
import { getAuth, signInAnonymously } from "firebase/auth";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        // Sign in anonymously
        signInAnonymously(auth)
          .then(() => {
            setLoading(false);
          })
          .catch((error) => {
            console.error("Auth error:", error);
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};