// src/hooks/useFirebaseStorage.js
import { useEffect, useState } from "react";
import { collections, doc, getDoc, setDoc, onSnapshot } from "../firebase";

export const useFirebaseStorage = (collectionName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document reference for this collection
  const dataDocRef = doc(collections[collectionName], "data");

  // Load initial data and set up real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      dataDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData(docSnapshot.data().value);
        } else {
          // Create document with initial value if it doesn't exist
          await setDoc(dataDocRef, { value: initialValue });
          setData(initialValue);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, initialValue]);

  // Update data in Firestore
  const updateData = async (newValue) => {
    try {
      await setDoc(dataDocRef, { value: newValue });
      setData(newValue);
      return true;
    } catch (err) {
      console.error("Error updating Firestore:", err);
      setError(err);
      return false;
    }
  };

  return [data, updateData, loading, error];
};