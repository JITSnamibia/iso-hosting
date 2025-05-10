// src/hooks/useFiles.js
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"; 
import { storage, collections, getDoc, updateDoc, arrayUnion, arrayRemove, db } from "../firebase"; 
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"; 

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Load files
  useEffect(() => {
    const loadFiles = async () => {
      if (!user) {
        setFiles([]);
        setLoading(false);
        return;
      }
      try {
        const fileDocRef = collections.files(user.uid); 
        const fileDoc = await getDoc(fileDocRef);
        setFiles(fileDoc.data()?.files || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load files:", err); 
        setError("Failed to load files");
        setLoading(false);
      }
    };

    loadFiles(); 
  }, [user]);

  // Upload file
  const uploadFile = async (file) => {
    if (!user || !file) return;
    setError(null);

    // Create a storage reference
    const storageRef = ref(storage, `files/${user.uid}/${file.name}`);

    try {
      const uploadTask = uploadBytesResumable(storageRef, file);

      // We can add progress tracking here if needed in the future
      // uploadTask.on('state_changed', (snapshot) => { ... });

      await uploadTask; 

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL, 
        path: storageRef.fullPath, 
        uploadedAt: new Date().toISOString(),
      };

      await updateDoc(collections.files(user.uid), {
        files: arrayUnion(fileData),
      });

      setFiles((prevFiles) => [...prevFiles, fileData]);
    } catch (err) {
      console.error("Failed to upload file:", err); 
      setError("Failed to upload file. Please try again.");
    }
  };

  // Delete file
  const deleteFile = async (fileToDelete) => { 
    if (!user || !fileToDelete || !fileToDelete.path) return;
    setError(null);

    const fileStorageRef = ref(storage, fileToDelete.path);

    try {
      // Delete from Firebase Storage
      await deleteObject(fileStorageRef);

      // Remove from Firestore
      const updatedFiles = files.filter(f => f.path !== fileToDelete.path);
      await updateDoc(collections.files(user.uid), {
        files: updatedFiles,
      });

      setFiles(updatedFiles);
    } catch (err) {
      console.error("Failed to delete file:", err); 
      if (err.code === 'storage/object-not-found') {
        setError("File not found in storage. Removing from list.");
        // If not in storage, still try to remove from Firestore list
        const updatedFiles = files.filter(f => f.path !== fileToDelete.path);
        try {
          await updateDoc(collections.files(user.uid), {
            files: updatedFiles,
          });
          setFiles(updatedFiles);
        } catch (dbError) {
          console.error("Failed to update Firestore after storage error:", dbError);
          setError("Failed to delete file and update list.");
        }
      } else {
        setError("Failed to delete file. Please try again.");
      }
    }
  };

  return {
    files,
    loading,
    error,
    uploadFile,
    deleteFile,
  };
};