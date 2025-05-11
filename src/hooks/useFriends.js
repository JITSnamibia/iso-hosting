// src/hooks/useFriends.js
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  db,
  collections, // Custom helper for doc references
  doc,       // Firestore doc function
  getDoc,
  getDocs,
  setDoc,    // For initializing friends doc if it doesn't exist
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection as fbCollection, // Alias Firestore's collection to fbCollection
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  orderBy // For ordering requests, e.g., by createdAt
} from "../firebase"; // Ensure all these are exported from firebase.js

export const useFriends = () => {
  const { user } = useAuth(); 

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [friends, setFriends] = useState([]); 
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState({
    profile: true,
    friends: true,
    incomingRequests: true,
    outgoingRequests: true,
    search: false,
    action: false, 
  });
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const userDoc = await getDoc(collections.users(userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      console.warn(`No profile found for userId: ${userId}`);
      return null;
    } catch (err) {
      console.error(`Error fetching profile for ${userId}:`, err);
      setError(`Error fetching user profile: ${err.message}`);
      return null;
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      setLoading(prev => ({ ...prev, profile: true }));
      fetchUserProfile(user.uid)
        .then(profile => {
          setCurrentUserProfile(profile);
          setLoading(prev => ({ ...prev, profile: false }));
        })
        .catch(err => {
            console.error("Failed to fetch current user profile:", err);
            setError("Failed to load your profile data.");
            setLoading(prev => ({ ...prev, profile: false }));
        });
    }
  }, [user?.uid, fetchUserProfile]);

  useEffect(() => {
    if (!user?.uid) {
      setFriends([]);
      setLoading(prev => ({ ...prev, friends: false }));
      return () => {};
    }
    setLoading(prev => ({ ...prev, friends: true }));
    const friendsDocRef = collections.friends(user.uid);

    const unsubscribe = onSnapshot(friendsDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const friendUIDs = docSnapshot.data()?.friendUIDs || [];
        const friendProfiles = await Promise.all(
          friendUIDs.map(uid => fetchUserProfile(uid))
        );
        setFriends(friendProfiles.filter(Boolean));
      } else {
        try {
            await setDoc(friendsDocRef, { friendUIDs: [] });
            setFriends([]);
        } catch (initError) {
            console.error("Failed to initialize friends document:", initError);
            setError("Failed to initialize friends list.");
        }
      }
      setLoading(prev => ({ ...prev, friends: false }));
    }, (err) => {
      console.error("Error listening to friends document:", err);
      setError("Failed to load friends list.");
      setLoading(prev => ({ ...prev, friends: false }));
    });
    return () => unsubscribe();
  }, [user?.uid, fetchUserProfile]);

  useEffect(() => {
    if (!user?.uid) {
      setIncomingRequests([]);
      setLoading(prev => ({ ...prev, incomingRequests: false }));
      return () => {};
    }
    setLoading(prev => ({ ...prev, incomingRequests: true }));
    const q = query(
      collections.friendRequestsCollection,
      where("receiverId", "==", user.uid),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = await Promise.all(snapshot.docs.map(async (doc) => {
        const requestData = doc.data();
        const senderProfile = await fetchUserProfile(requestData.senderId);
        return { id: doc.id, ...requestData, senderProfile };
      }));
      setIncomingRequests(requests.filter(req => req.senderProfile));
      setLoading(prev => ({ ...prev, incomingRequests: false }));
    }, (err) => {
      console.error("Error listening to incoming requests:", err);
      setError("Failed to load incoming friend requests.");
      setLoading(prev => ({ ...prev, incomingRequests: false }));
    });
    return () => unsubscribe();
  }, [user?.uid, fetchUserProfile]);

  useEffect(() => {
    if (!user?.uid) {
      setOutgoingRequests([]);
      setLoading(prev => ({ ...prev, outgoingRequests: false }));
      return () => {};
    }
    setLoading(prev => ({ ...prev, outgoingRequests: true }));
    const q = query(
      collections.friendRequestsCollection,
      where("senderId", "==", user.uid),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = await Promise.all(snapshot.docs.map(async (doc) => {
        const requestData = doc.data();
        const receiverProfile = await fetchUserProfile(requestData.receiverId);
        return { id: doc.id, ...requestData, receiverProfile };
      }));
      setOutgoingRequests(requests.filter(req => req.receiverProfile));
      setLoading(prev => ({ ...prev, outgoingRequests: false }));
    }, (err) => {
      console.error("Error listening to outgoing requests:", err);
      setError("Failed to load outgoing friend requests.");
      setLoading(prev => ({ ...prev, outgoingRequests: false }));
    });
    return () => unsubscribe();
  }, [user?.uid, fetchUserProfile]);

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim() || !user?.uid) {
      setSearchResults([]);
      return;
    }
    setLoading(prev => ({ ...prev, search: true }));
    setError(null);
    try {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const emailQuery = query(collections.userCollection, where("email", "==", lowerSearchTerm));
      const nameQuery = query(collections.userCollection, 
                              where("displayNameLower", ">=", lowerSearchTerm),
                              where("displayNameLower", "<=", lowerSearchTerm + '\uf8ff')
                            );
      
      const [emailSnapshot, nameSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(nameQuery)]);
      
      const resultsMap = new Map();
      emailSnapshot.forEach(doc => {
        if (doc.id !== user.uid) resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      nameSnapshot.forEach(doc => {
        if (doc.id !== user.uid) resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      const friendUIDs = friends.map(f => f.id);
      const incomingReqSenderUIDs = incomingRequests.map(r => r.senderId);
      const outgoingReqReceiverUIDs = outgoingRequests.map(r => r.receiverId);

      const filteredResults = Array.from(resultsMap.values()).filter(foundUser => 
        !friendUIDs.includes(foundUser.id) && 
        !incomingReqSenderUIDs.includes(foundUser.id) && 
        !outgoingReqReceiverUIDs.includes(foundUser.id)
      );

      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Failed to search users:", err);
      setError("Failed to search users.");
      setSearchResults([]);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };
  
  const sendFriendRequest = async (targetUser) => {
    if (!currentUserProfile || !targetUser?.id) {
      setError("Cannot send request: current user or target user is invalid.");
      return;
    }
    if (currentUserProfile.id === targetUser.id) {
        setError("You cannot send a friend request to yourself.");
        return;
    }
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    try {
      // Ensure we have the displayName for the receiver
      let finalTargetUser = targetUser;
      if (!targetUser.displayName) {
        console.warn(`Target user object for ${targetUser.id} is missing displayName. Fetching profile.`);
        const fetchedProfile = await fetchUserProfile(targetUser.id);
        if (fetchedProfile && fetchedProfile.displayName) {
          finalTargetUser = fetchedProfile;
        } else {
          // Fallback if profile fetch fails or still no displayName
          // Using email as a fallback, or a generic placeholder if email is also missing
          finalTargetUser = {
            ...targetUser, // Keep other potential fields from search result
            displayName: targetUser.email || fetchedProfile?.email || "User"
          };
          console.warn(`Could not fetch displayName for ${targetUser.id}. Using fallback: ${finalTargetUser.displayName}`);
        }
      }

      // Check if a request already exists (incoming or outgoing and pending)
      const existingOutgoingQuery = query(
        collections.friendRequestsCollection,
        where("senderId", "==", currentUserProfile.id),
        where("receiverId", "==", finalTargetUser.id),
        where("status", "==", "pending")
      );
      const existingIncomingQuery = query(
        collections.friendRequestsCollection,
        where("senderId", "==", finalTargetUser.id),
        where("receiverId", "==", currentUserProfile.id),
        where("status", "==", "pending")
      );

      const [existingOutgoingSnapshot, existingIncomingSnapshot] = await Promise.all([
        getDocs(existingOutgoingQuery),
        getDocs(existingIncomingQuery)
      ]);

      if (!existingOutgoingSnapshot.empty) {
        setError("You have already sent a friend request to this user.");
        setLoading(prev => ({ ...prev, action: false }));
        return;
      }
      if (!existingIncomingSnapshot.empty) {
        setError("This user has already sent you a friend request. Check your incoming requests.");
        setLoading(prev => ({ ...prev, action: false }));
        return;
      }

      const requestData = {
        senderId: currentUserProfile.id,
        senderDisplayName: currentUserProfile.displayName || currentUserProfile.email || "User", // Also add fallback for sender
        receiverId: finalTargetUser.id,
        receiverDisplayName: finalTargetUser.displayName, // Should now be populated
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await addDoc(collections.friendRequestsCollection, requestData);
      // UI will update via onSnapshot for outgoingRequests
    } catch (err) {
      console.error("Failed to send friend request:", err);
      setError(err.message || "Failed to send friend request.");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleRequestAction = async (requestId, newStatus) => {
    if (!user?.uid || !requestId) return;
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    const requestRef = doc(db, "friendRequests", requestId);
    try {
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists() || requestDoc.data().receiverId !== user.uid || requestDoc.data().status !== 'pending') {
        throw new Error("Invalid request or not authorized.");
      }

      const batch = writeBatch(db);
      batch.update(requestRef, { status: newStatus, updatedAt: serverTimestamp() });

      if (newStatus === "accepted") {
        const senderId = requestDoc.data().senderId;
        const receiverId = user.uid; 

        const currentUserFriendsRef = collections.friends(receiverId);
        const senderFriendsRef = collections.friends(senderId);

        batch.update(currentUserFriendsRef, { friendUIDs: arrayUnion(senderId) });
        batch.update(senderFriendsRef, { friendUIDs: arrayUnion(receiverId) });
      }
      await batch.commit();
    } catch (err) {
      console.error(`Failed to ${newStatus === 'accepted' ? 'accept' : 'decline'} friend request:`, err);
      setError(err.message || `Failed to ${newStatus === 'accepted' ? 'accept' : 'decline'} request.`);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const acceptFriendRequest = (request) => handleRequestAction(request.id, "accepted");
  const declineFriendRequest = (request) => handleRequestAction(request.id, "declined");

  const cancelFriendRequest = async (requestId) => {
    if (!user?.uid || !requestId) return;
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    try {
      const requestRef = doc(db, "friendRequests", requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists() || requestDoc.data().senderId !== user.uid || requestDoc.data().status !== 'pending'){
          throw new Error("Request not found or not authorized to cancel.");
      }
      await deleteDoc(requestRef);
    } catch (err) {
      console.error("Failed to cancel friend request:", err);
      setError(err.message || "Failed to cancel friend request.");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const removeFriend = async (friendId) => {
    if (!user?.uid || !friendId) return;
    setLoading(prev => ({ ...prev, action: true }));
    setError(null);
    try {
      const batch = writeBatch(db);
      const currentUserFriendsRef = collections.friends(user.uid);
      const friendUserFriendsRef = collections.friends(friendId);

      batch.update(currentUserFriendsRef, { friendUIDs: arrayRemove(friendId) });
      batch.update(friendUserFriendsRef, { friendUIDs: arrayRemove(user.uid) });

      const q = query(collections.friendRequestsCollection, 
                      where("senderId", "in", [user.uid, friendId]), 
                      where("receiverId", "in", [user.uid, friendId]),
                      where("status", "==", "accepted"));
      const requestSnapshot = await getDocs(q);
      requestSnapshot.forEach(doc => {
        batch.update(doc.ref, { status: 'unfriended', updatedAt: serverTimestamp() }); 
      });

      await batch.commit();
    } catch (err) {
      console.error("Failed to remove friend:", err);
      setError(err.message || "Failed to remove friend.");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  return {
    currentUserProfile,
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
  };
};