// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  collections,
  setDoc,
  getDoc,
  serverTimestamp // Import serverTimestamp
} from "../firebase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState(""); // State for display name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Validate displayName for registration
        if (!displayName.trim()) {
          setError("Display Name is required for registration.");
          return;
        }
        result = await createUserWithEmailAndPassword(auth, email, password);
        const userDocRef = collections.users(result.user.uid);
        // No need to check if doc exists for new user, just set it.
        await setDoc(userDocRef, {
          email: result.user.email,
          displayName: displayName.trim(),
          displayNameLower: displayName.trim().toLowerCase(),
          createdAt: serverTimestamp(),
          avatarUrl: null,
          // Add other initial fields if necessary
        });
        // Initialize friends and files collections for the new user
        await setDoc(collections.friends(result.user.uid), { friends: [] });
        // For files, it might be better to not create an empty doc here
        // but rather let the useFiles hook handle it when the first file is uploaded.
        // Or ensure the rules allow creating this empty doc structure.
        // For now, let's assume the current /files/{userId} with { files: [] } is fine.
        await setDoc(collections.files(result.user.uid), { files: [] });
      }

      // For login, we might want to fetch user data if it's needed immediately after login
      // For now, navigating to dashboard is sufficient as dashboard fetches its own data.
      // const userDocRef = collections.users(result.user.uid);
      // const userDoc = await getDoc(userDocRef);
      // if (!userDoc.exists() && !isLogin) { // This block was for new users, handled above.
        // ... existing logic to create user sub-collections ...
      // }

      navigate("/dashboard");
    } catch (err) {
      // Provide more user-friendly error messages
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please try logging in or use a different email.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please use a stronger password (at least 6 characters).');
      } else {
        setError(err.message); // Fallback to Firebase's message
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-xl bg-slate-800 shadow-2xl neon-border border-2 border-sky-500/50">
        <h2 className="text-3xl font-bold mb-8 text-center text-sky-400 neon-text">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && ( // Only show Display Name for registration
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-1">Display Name</label>
              <input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full"
                required={!isLogin} // Required only for registration
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <button type="submit" className="w-full mt-2">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              // Clear form fields when switching modes
              setEmail("");
              setPassword("");
              setDisplayName("");
            }}
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium focus:outline-none"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}