// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, collections, setDoc, getDoc } from "../firebase"; // Added getDoc

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      const userDocRef = collections.users(result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: result.user.email,
          createdAt: new Date().toISOString(),
        });
        // Initialize friends and files collections for the new user
        await setDoc(collections.friends(result.user.uid), { friends: [] });
        await setDoc(collections.files(result.user.uid), { files: [] });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
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
            onClick={() => { setIsLogin(!isLogin); setError(""); }} 
            className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium focus:outline-none"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}