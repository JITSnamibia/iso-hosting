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
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth failed:", err);
          setError(err.message);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};