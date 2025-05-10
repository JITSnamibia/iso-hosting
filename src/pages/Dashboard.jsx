// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFiles } from "../hooks/useFiles";
import { useFriends } from "../hooks/useFriends";
import { useNavigate } from "react-router-dom/dist/index.js";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { files, uploadFile, deleteFile } = useFiles();
  const { friends, addFriend, removeFriend, searchUsers, searchResults } = useFriends();
  const [activeTab, setActiveTab] = useState("files");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-10 bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold neon-text">My Realm</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex justify-center gap-8 mt-6">
        <button 
          onClick={() => setActiveTab("files")} 
          className={`font-medium pb-2 ${activeTab === "files" ? "neon-border" : "border-transparent"}`}
        >
          Files
        </button>
        <button 
          onClick={() => setActiveTab("friends")} 
          className={`font-medium pb-2 ${activeTab === "friends" ? "neon-border" : "border-transparent"}`}
        >
          Friends
        </button>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Shared Files</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, index) => (
                <div key={index} className="p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📁</span>
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-400">{file.type} • {formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <a href={file.preview} download={file.name} className="text-blue-400 hover:text-blue-300">Download</a>
                    <button onClick={() => deleteFile(index)} className="text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <label className="btn btn-secondary w-full max-w-xs block text-center">
              Upload File
              <input 
                type="file" 
                multiple 
                onChange={(e) => uploadFile(e.target.files[0])} 
                className="hidden" 
              />
            </label>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">Friends</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friendEmail, index) => (
                  <div key={index} className="p-4 bg-gray-900/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {friendEmail.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{friendEmail}</p>
                        <p className="text-xs text-gray-400">Online</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFriend(friendEmail)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {friends.length === 0 && (
                  <p className="text-center text-gray-500 py-6">No friends yet</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Add Friends</h2>
              
              <div className="mb-4">
                <input 
                  type="email" 
                  placeholder="Enter friend's email" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.includes("@")) searchUsers(e.target.value);
                  }}
                  className="input w-full"
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-gray-900/30 rounded p-3">
                    <p className="text-sm text-gray-400">Found:</p>
                    {searchResults.map((email, i) => (
                      <div key={i} className="flex justify-between items-center mt-2">
                        <span>{email}</span>
                        <button 
                          onClick={() => {
                            addFriend(email);
                            setSearchQuery("");
                            searchUsers("");
                          }}
                          className="text-green-400 hover:text-green-300"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}