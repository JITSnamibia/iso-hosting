// src/hooks/useFriends.js
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { db, collections, getDoc, updateDoc, arrayUnion, arrayRemove } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const useFriends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  const { user } = useAuth();

  // Load friends
  useEffect(() => {
    const loadFriends = async () => {
      if (!user) {
        setFriends([]);
        setLoading(false);
        return;
      }
      try {
        const friendDocRef = collections.friends(user.uid);
        const friendDoc = await getDoc(friendDocRef);
        setFriends(friendDoc.data()?.friends || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load friends:", err);
        setError("Failed to load friends");
        setLoading(false);
      }
    };

    loadFriends();
  }, [user]);

  // Add friend
  const addFriend = async (friendEmail) => {
    if (!user || !friendEmail) return;
    setError(null);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", friendEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("User not found with that email.");
      }

      if (friendEmail === user.email) {
        throw new Error("You cannot add yourself as a friend.");
      }

      if (friends.includes(friendEmail)) {
        throw new Error("This user is already your friend.");
      }

      await updateDoc(collections.friends(user.uid), {
        friends: arrayUnion(friendEmail),
      });

      setFriends((prevFriends) => [...prevFriends, friendEmail]);
      setSearchResults([]); // Clear search results after adding
    } catch (err) {
      console.error("Failed to add friend:", err);
      setError(err.message || "Failed to add friend.");
    }
  };

  // Remove friend
  const removeFriend = async (email) => {
    if (!user || !email) return;
    setError(null);
    try {
      await updateDoc(collections.friends(user.uid), {
        friends: arrayRemove(email),
      });

      setFriends((prevFriends) => prevFriends.filter((f) => f !== email));
    } catch (err) {
      console.error("Failed to remove friend:", err);
      setError(err.message || "Failed to remove friend.");
    }
  };

  // Search users
  const searchUsers = async (searchQuery) => {
    if (!searchQuery || !searchQuery.includes('@') || !user) {
      setSearchResults([]);
      return;
    }
    setError(null);

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchQuery));
      const querySnapshot = await getDocs(q);

      const results = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().email !== user.email) {
          results.push(doc.data().email);
        }
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Failed to search users:", err);
      setError("Failed to search users.");
      setSearchResults([]);
    }
  };

  return {
    friends,
    loading,
    error,
    addFriend,
    removeFriend,
    searchUsers,
    searchResults,
    friendRequests
  };
};