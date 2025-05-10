// src/hooks/useFirebaseAuth.js
import { useEffect, useState } from "react";
import { auth, signInAnonymously, onAuthStateChanged } from "../firebase";

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        try {
          // Sign in anonymously if no user
          await signInAnonymously(auth);
          setLoading(false);
        } catch (err) {
          console.error("Anonymous auth failed:", err);
          setError(err);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};