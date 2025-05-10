// src/hooks/useFiles.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { collections, getDoc, updateDoc, arrayUnion, arrayRemove } from "../firebase";

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Load files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileDoc = await getDoc(collections.files(user.uid));
        setFiles(fileDoc.data()?.files || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load files");
        setLoading(false);
      }
    };

    if (user) loadFiles();
  }, [user]);

  // Upload file
  const uploadFile = async (file) => {
    try {
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      };

      await updateDoc(collections.files(user.uid), {
        files: arrayUnion(fileData)
      });

      setFiles([...files, fileData]);
    } catch (err) {
      setError("Failed to upload file");
    }
  };

  // Delete file
  const deleteFile = async (index) => {
    try {
      const updated = [...files];
      const deleted = updated.splice(index, 1);

      await updateDoc(collections.files(user.uid), {
        files: updated
      });

      setFiles(updated);
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  return {
    files,
    loading,
    error,
    uploadFile,
    deleteFile
  };
};