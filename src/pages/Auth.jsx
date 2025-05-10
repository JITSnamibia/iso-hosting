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
    
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      // Initialize user data if needed
      const userDoc = await getDoc(collections.users(result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(collections.users(result.user.uid), {
          email: result.user.email,
          createdAt: new Date().toISOString()
        });
        await setDoc(collections.friends(result.user.uid), { friends: [] });
        await setDoc(collections.files(result.user.uid), { files: [] });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-xl neon-border border-2 border-gray-800 backdrop-blur-md bg-gray-900/30">
        <h2 className="text-2xl font-bold mb-6 text-center neon-text">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && <div className="bg-red-900/50 p-3 rounded mb-4 text-sm text-red-300">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="btn btn-primary w-full mt-4">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-gray-400 hover:text-white transition-colors">
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}