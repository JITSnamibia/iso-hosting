// src/hooks/useFirebaseStorage.js
import { useEffect, useState } from "react";
import { collections, doc, getDoc, setDoc, onSnapshot } from "../firebase";

export const useFirebaseStorage = (collectionName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataDocRef = doc(collections[collectionName], "data");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      dataDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          setData(docSnapshot.data().value);
        } else {
          await setDoc(dataDocRef, { value: initialValue });
          setData(initialValue);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Firestore error in ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, initialValue]);

  const updateData = async (newValue) => {
    try {
      await setDoc(dataDocRef, { value: newValue });
      setData(newValue);
      return true;
    } catch (err) {
      console.error(`Failed to update ${collectionName}:`, err);
      setError(err);
      return false;
    }
  };

  return [data, updateData, loading, error];
};