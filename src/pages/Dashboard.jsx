import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFiles } from "../hooks/useFiles";
import { useFriends } from "../hooks/useFriends";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { files, uploadFile, deleteFile, error: filesError, loading: filesLoading } = useFiles();
  const {
    currentUserProfile, 
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    loading: friendsLoading, 
    error: friendsError,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState("files");
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
    e.target.value = null; 
  };

  const handleSearchUsers = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 2) { 
      searchUsers(query.trim());
    }
  };

  const renderSectionStatus = (sectionLoading, sectionError, defaultText) => {
    if (sectionLoading) return <p className="text-slate-400 text-sm">Loading...</p>;
    if (sectionError) return <p className="text-red-400 text-sm">Error: {sectionError}</p>;
    return <p className="text-slate-500 text-sm py-4 text-center">{defaultText}</p>;
  };

  return (
    <div className="min-h-screen"> 
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-700 bg-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-400 neon-text">My Realm</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">
              {currentUserProfile?.displayName || user?.email} 
            </span>
            <button onClick={logout} className="py-1 px-3 text-sm">Logout</button>
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
          {/* Files Tab Content (Unchanged) */}
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
                {filesError && filesError.startsWith('Upload failed') && <p className="text-red-400 mt-2 text-sm">{filesError}</p>}
              </div>
            </div>
          )}

          {/* Friends Tab Content - Overhauled */}
          {activeTab === "friends" && (
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-10">
              {/* Generic Action Error/Loading */} 
              {friendsLoading.action && <p className="text-sky-300 text-sm p-2 bg-sky-700/30 rounded-md">Processing action...</p>}
              {friendsError && <p className="text-red-300 text-sm p-2 bg-red-700/30 rounded-md">Error: {friendsError}</p>}

              {/* Incoming Friend Requests Section */}
              <section>
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Incoming Friend Requests</h2>
                {friendsLoading.incomingRequests || incomingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="p-3 bg-slate-700/70 rounded-lg border border-slate-600 flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {req.senderProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <p className="ml-3 font-medium text-slate-200 truncate" title={req.senderProfile?.displayName}>{req.senderProfile?.displayName || 'Unknown User'}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 ml-2">
                          <button onClick={() => acceptFriendRequest(req)} className="text-xs py-1 px-2 bg-green-600 hover:bg-green-700">Accept</button>
                          <button onClick={() => declineFriendRequest(req)} className="text-xs py-1 px-2 bg-yellow-600 hover:bg-yellow-700">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderSectionStatus(friendsLoading.incomingRequests, null, "No incoming friend requests.")
                )}
              </section>

              {/* Outgoing Friend Requests Section */}
              <section>
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Sent Friend Requests</h2>
                {friendsLoading.outgoingRequests || outgoingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {outgoingRequests.map((req) => (
                      <div key={req.id} className="p-3 bg-slate-700/70 rounded-lg border border-slate-600 flex items-center justify-between">
                         <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {req.receiverProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <p className="ml-3 font-medium text-slate-200 truncate" title={req.receiverProfile?.displayName}>{req.receiverProfile?.displayName || 'Unknown User'}</p>
                        </div>
                        <button onClick={() => cancelFriendRequest(req.id)} className="text-xs py-1 px-2 bg-orange-600 hover:bg-orange-700 flex-shrink-0 ml-2">Cancel</button>
                      </div>
                    ))}
                  </div>
                ) : (
                   renderSectionStatus(friendsLoading.outgoingRequests, null, "You haven't sent any friend requests.")
                )}
              </section>

              {/* Current Friends Section */}
              <section>
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Your Friends ({friends.length})</h2>
                {friendsLoading.friends || friends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="p-3 bg-slate-700/70 rounded-lg border border-slate-600 flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {friend.displayName?.charAt(0).toUpperCase() || friend.email?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-3 min-w-0">
                            <p className="font-medium text-slate-100 truncate" title={friend.displayName}>{friend.displayName || 'No Name'}</p>
                            <p className="text-xs text-slate-400 truncate" title={friend.email}>{friend.email}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFriend(friend.id)} className="text-xs py-1 px-2 bg-red-600 hover:bg-red-700 ml-2 flex-shrink-0">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderSectionStatus(friendsLoading.friends, null, "You haven't added any friends yet.")
                )}
              </section>

              {/* Search Users / Add New Friend Section */}
              <section>
                <h2 className="text-xl font-semibold text-slate-100 mb-4">Find New Friends</h2>
                <div className="max-w-md">
                  <input
                    type="search"
                    placeholder="Search by email or display name"
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full mb-3" 
                  />
                  {friendsLoading.search && <p className="text-slate-400 text-sm">Searching...</p>}
                  
                  {searchResults.length > 0 && !friendsLoading.search && (
                    <div className="mt-3 bg-slate-700/50 rounded-md p-4 space-y-3">
                      <p className="text-sm text-slate-300 font-medium">Search Results:</p>
                      {searchResults.map((foundUser) => (
                        <div key={foundUser.id} className="flex justify-between items-center bg-slate-600/50 p-2 rounded-md">
                          <div className="flex items-center min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {foundUser.displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="font-medium text-slate-200 truncate" title={foundUser.displayName}>{foundUser.displayName || 'Unknown User'}</p>
                                <p className="text-xs text-slate-400 truncate" title={foundUser.email}>{foundUser.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              sendFriendRequest(foundUser);
                              setSearchQuery(""); 
                              // searchResults will clear/update via useFriends logic or next search
                            }}
                            className="text-xs py-1 px-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 transition ease-in-out duration-150 ml-2 flex-shrink-0"
                          >
                            Send Request
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery.length > 2 && searchResults.length === 0 && !friendsLoading.search && (
                     <p className="text-sm text-slate-500 mt-2">No users found matching "{searchQuery}" or they are already friends/have pending requests.</p>
                  )}
                </div>
              </section>
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