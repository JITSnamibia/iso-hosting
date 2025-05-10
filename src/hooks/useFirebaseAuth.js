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
          // Ensure anonymous sign-in is enabled in Firebase Console
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Anonymous auth failed:", err);
          setError("Firebase auth error: Check Firebase Console for configuration");
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};