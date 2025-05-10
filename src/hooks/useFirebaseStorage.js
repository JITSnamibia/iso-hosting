import { useEffect, useState } from "react";
import { collections, doc, getDoc, setDoc, onSnapshot } from "../firebase";

export const useFirebaseStorage = (collectionName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataDocRef = doc(collections[collectionName], "data");

  useEffect(() => {
    const unsubscribe = onSnapshot(dataDocRef, snap => {
      if (snap.exists()) {
        setData(snap.data().value);
      } else {
        setDoc(dataDocRef, { value: initialValue }).then(() => setData(initialValue));
      }
      setLoading(false);
    }, err => {
      console.error("Firestore error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  const updateData = async (newValue) => {
    try {
      await setDoc(dataDocRef, { value: newValue });
      setData(newValue);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return [data, updateData, loading, error];
};