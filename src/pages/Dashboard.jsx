import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFiles } from "../hooks/useFiles";
import { useFriends } from "../hooks/useFriends";
// import { useNavigate } from "react-router-dom"; // useNavigate seems unused

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { files, uploadFile, deleteFile, error: filesError, loading: filesLoading } = useFiles(); // Added error/loading states
  const { friends, addFriend, removeFriend, searchUsers, searchResults, error: friendsError, loading: friendsLoading } = useFriends(); // Added error/loading states
  const [activeTab, setActiveTab] = useState("files");
  const [searchQuery, setSearchQuery] = useState("");
  // const navigate = useNavigate(); // useNavigate seems unused

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
    e.target.value = null; // Reset file input
  };

  return (
    <div className="min-h-screen"> {/* Removed bg-black */}
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-700 bg-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-400 neon-text">My Realm</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="py-1 px-3 text-sm">Logout</button> {/* Base styles apply */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="flex space-x-1 rounded-lg bg-slate-700/60 p-1">
            <button
              onClick={() => setActiveTab("files")}
              className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2 transition-colors duration-150
                ${activeTab === "files"
                  ? "bg-white shadow text-sky-600"
                  : "text-slate-300 hover:bg-slate-700/80 hover:text-white"
                }`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2 transition-colors duration-150
                ${activeTab === "friends"
                  ? "bg-white shadow text-sky-600"
                  : "text-slate-300 hover:bg-slate-700/80 hover:text-white"
                }`}
            >
              Friends
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main>
          {/* Files Tab Content */}
          {activeTab === "files" && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-6">
              <h2 className="text-2xl font-semibold text-slate-100">Shared Files</h2>
              {filesLoading && <p className="text-slate-400">Loading files...</p>}
              {filesError && <p className="text-red-400">Error loading files: {filesError}</p>}
              
              {files.length === 0 && !filesLoading && (
                <p className="text-center text-slate-500 py-10">No files uploaded yet. Use the button below to upload your first file!</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => (
                  <div key={file.id || file.name} className="p-4 bg-slate-700/70 rounded-lg border border-slate-600 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-3xl mr-3">📁</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-100 truncate" title={file.name}>{file.name}</p>
                          <p className="text-xs text-slate-400">{file.type} • {formatFileSize(file.size)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <a href={file.url} download={file.name} className="text-xs py-1 px-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition ease-in-out duration-150" target="_blank" rel="noopener noreferrer">Download</a>
                      <button onClick={() => deleteFile(file)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition ease-in-out duration-150">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="inline-flex items-center justify-center cursor-pointer py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-700 text-white font-semibold">
                  Upload New File
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                </label>
                {/* Displaying file upload errors if any from useFiles hook */}
                {filesError && filesError.startsWith('Upload failed') && <p className="text-red-400 mt-2 text-sm">{filesError}</p>}
              </div>
            </div>
          )}

          {/* Friends Tab Content */}
          {activeTab === "friends" && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">Your Friends</h2>
                {friendsLoading && <p className="text-slate-400">Loading friends...</p>}
                {friendsError && <p className="text-red-400">Error loading friends: {friendsError}</p>}
                {friends.length === 0 && !friendsLoading && (
                  <p className="text-center text-slate-500 py-10">You haven't added any friends yet.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {friends.map((friendEmail) => (
                    <div key={friendEmail} className="p-4 bg-slate-700/70 rounded-lg border border-slate-600 flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {friendEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                          <p className="font-medium text-slate-100 truncate" title={friendEmail}>{friendEmail}</p>
                          {/* <p className="text-xs text-slate-400">Online</p> Placeholder */}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFriend(friendEmail)}
                        className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition ease-in-out duration-150 ml-2 flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">Add New Friend</h2>
                <div className="max-w-md">
                  <input
                    type="email"
                    placeholder="Enter friend's email to search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length > 3 && e.target.value.includes("@")) searchUsers(e.target.value);
                    }}
                    className="w-full mb-2" // Base styles apply
                  />
                  {/* Display friend search errors */}
                  {friendsError && friendsError.startsWith('Search failed') && <p className="text-red-400 mt-2 text-sm">{friendsError}</p>}
                  {friendsError && friendsError.startsWith('Cannot add') && <p className="text-yellow-400 mt-2 text-sm">{friendsError}</p>}

                  {searchResults.length > 0 && (
                    <div className="mt-3 bg-slate-700/50 rounded-md p-4 space-y-3">
                      <p className="text-sm text-slate-300 font-medium">Search Results:</p>
                      {searchResults.map((email) => (
                        <div key={email} className="flex justify-between items-center bg-slate-600/50 p-2 rounded-md">
                          <span className="text-slate-200 truncate" title={email}>{email}</span>
                          <button
                            onClick={() => {
                              addFriend(email);
                              setSearchQuery("");
                              // searchUsers(""); // Clearing search results implicitly via addFriend or state update
                            }}
                            className="text-xs py-1 px-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition ease-in-out duration-150 ml-2 flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery.length > 3 && searchResults.length === 0 && !friendsLoading && (
                     <p className="text-sm text-slate-500 mt-2">No users found matching "{searchQuery}".</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes == null || isNaN(bytes) || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}