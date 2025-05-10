// src/hooks/useFriends.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { collections, getDoc, updateDoc, arrayUnion, arrayRemove } from "../firebase";

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
      try {
        const friendDoc = await getDoc(collections.friends(user.uid));
        setFriends(friendDoc.data()?.friends || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load friends");
        setLoading(false);
      }
    };

    if (user) loadFriends();
  }, [user]);

  // Add friend
  const addFriend = async (email) => {
    try {
      const friendDoc = await getDoc(collections.users(email));
      if (!friendDoc.exists()) throw new Error("User not found");

      await updateDoc(collections.friends(user.uid), {
        friends: arrayUnion(email)
      });

      setFriends([...friends, email]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove friend
  const removeFriend = async (email) => {
    try {
      await updateDoc(collections.friends(user.uid), {
        friends: arrayRemove(email)
      });

      setFriends(friends.filter(f => f !== email));
    } catch (err) {
      setError(err.message);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query) return setSearchResults([]);
  
    try {
      // Query user by email
      const usersRef = doc(db, "users", query); // Changed from collections.users(query)
      const userDoc = await getDoc(usersRef);
      
      setSearchResults(userDoc.exists() ? [query] : []);
    } catch (err) {
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