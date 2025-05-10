// src/App.jsx
import React, { useState, useEffect } from "react";
import { useFirebaseStorage } from "./hooks/useFirebaseStorage";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";

// Custom Components
const ServerCard = React.memo(({ server, onToggleStatus }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{server.name}</h3>
        <span
          className={`px-2 py-1 rounded text-xs ${
            server.status === "online"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {server.status === "online" ? "Online" : "Offline"}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>Type: {server.type}</p>
        <p>IP: {server.ip}:{server.port}</p>
        {server.type === "game" && <p>Max Players: {server.maxPlayers || 0}</p>}
      </div>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onToggleStatus(server.id)}
          className={`flex-1 py-2 rounded ${
            server.status === "online"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white transition-colors duration-200`}
        >
          {server.status === "online" ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  </div>
));

const FriendCard = React.memo(({ friend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
              {friend.name.charAt(0)}
            </span>
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              friend.status === "online"
                ? "bg-green-500"
                : friend.status === "away"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }`}
          ></span>
        </div>
        <div className="ml-4">
          <h3 className="font-bold">{friend.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {friend.status === "online" ? "Online" : friend.status === "away" ? "Away" : "Offline"}
          </p>
        </div>
      </div>
      {friend.game && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Playing {friend.game}
          </p>
        </div>
      )}
      <div className="mt-4 flex gap-3">
        <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
          Message
        </button>
        {friend.status === "online" && (
          <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Connect
          </button>
        )}
      </div>
    </div>
  </div>
));

export default function App() {
  // Firebase Auth
  const { user, loading: authLoading } = useFirebaseAuth();

  // Firebase Storage
  const [servers, setServers, serversLoading] = useFirebaseStorage("servers", []);
  const [friends, setFriends, friendsLoading] = useFirebaseStorage("friends", []);
  const [files, setFiles, filesLoading] = useFirebaseStorage("files", []);

  // State
  const [activeTab, setActiveTab] = useState("games");
  const [theme, setTheme] = useState("dark");
  const [newServer, setNewServer] = useState({
    name: "",
    type: "game",
    ip: "",
    port: "",
    maxPlayers: 0
  });
  const [newFriend, setNewFriend] = useState({ name: "", status: "offline", game: "" });
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  // Apply theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Toggle server status
  const toggleServerStatus = async (id) => {
    const updatedServers = servers.map((server) =>
      server.id === id
        ? { ...server, status: server.status === "online" ? "offline" : "online" }
        : server
    );
    await setServers(updatedServers);
  };

  // Add server
  const addServer = async (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.ip || !newServer.port) return;

    await setServers([
      ...servers,
      {
        ...newServer,
        id: Date.now(),
        status: "offline"
      }
    ]);

    setNewServer({ ...newServer, name: "", ip: "", port: "" });
    setIsAddServerModalOpen(false);
  };

  // Add friend
  const addFriend = async (e) => {
    e.preventDefault();
    if (!newFriend.name) return;

    await setFriends([...friends, { ...newFriend, id: Date.now() }]);
    setNewFriend({ ...newFriend, name: "" });
    setIsAddFriendModalOpen(false);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      preview: URL.createObjectURL(file)
    }));
    await setFiles([...files, ...uploadedFiles]);
  };

  // Delete file
  const deleteFile = async (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    await setFiles(updatedFiles);
  };

  // Loading state
  if (authLoading || serversLoading || friendsLoading || filesLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Header */}
      <header className="py-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
              <h1 className="text-2xl font-bold">Personal Server Hub</h1>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <button
                    onClick={() => setActiveTab("games")}
                    className={`pb-1 transition-colors duration-200 ${
                      activeTab === "games"
                        ? "border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Servers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("files")}
                    className={`pb-1 transition-colors duration-200 ${
                      activeTab === "files"
                        ? "border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Files
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("friends")}
                    className={`pb-1 transition-colors duration-200 ${
                      activeTab === "friends"
                        ? "border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Friends
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Game Servers Section */}
        {activeTab === "games" && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                Game Servers
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                  {servers.filter((s) => s.status === "online").length} online
                </span>
              </h2>
              <button
                onClick={() => setIsAddServerModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
              >
                Add Server
              </button>
            </div>

            {servers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No servers added yet. Click "Add Server" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <ServerCard key={server.id} server={server} onToggleStatus={toggleServerStatus} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Files Section */}
        {activeTab === "files" && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Shared Files</h2>
              <div className="flex space-x-3">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer">
                  Upload File
                  <input type="file" onChange={handleFileUpload} className="hidden" multiple />
                </label>
                <button
                  onClick={() => setFiles([])}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Clear All
                </button>
              </div>
            </div>

            {files.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No files uploaded yet. Click "Upload File" to share files with friends.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {files.map((file, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {file.type.startsWith("image/") ? (
                                  <img className="h-10 w-10 rounded object-cover" src={file.preview} alt={file.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900 dark:text-white">{file.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {file.type || "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(file.lastModified).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = file.preview;
                                link.download = file.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => deleteFile(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Friends Section */}
        {activeTab === "friends" && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Friends</h2>
              <button
                onClick={() => setIsAddFriendModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Add Friend
              </button>
            </div>

            {friends.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">No friends added yet. Click "Add Friend" to start connecting.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {friends.map((friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Modals */}
        {isAddServerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Server</h2>
                  <button
                    onClick={() => setIsAddServerModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={addServer}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Server Name</label>
                      <input
                        type="text"
                        value={newServer.name}
                        onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={newServer.type}
                        onChange={(e) => setNewServer({ ...newServer, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="game">Game Server</option>
                        <option value="file">File Server</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IP Address</label>
                      <input
                        type="text"
                        value={newServer.ip}
                        onChange={(e) => setNewServer({ ...newServer, ip: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Port</label>
                      <input
                        type="number"
                        value={newServer.port}
                        onChange={(e) => setNewServer({ ...newServer, port: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    {newServer.type === "game" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Players</label>
                        <input
                          type="number"
                          value={newServer.maxPlayers}
                          onChange={(e) => setNewServer({ ...newServer, maxPlayers: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddServerModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add Server
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {isAddFriendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Friend</h2>
                  <button
                    onClick={() => setIsAddFriendModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={addFriend}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={newFriend.name}
                        onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={newFriend.status}
                        onChange={(e) => setNewFriend({ ...newFriend, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="online">Online</option>
                        <option value="away">Away</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Currently Playing</label>
                      <input
                        type="text"
                        value={newFriend.game}
                        onChange={(e) => setNewFriend({ ...newFriend, game: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Game name"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddFriendModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add Friend
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Personal Server Hub • Built with React & Firebase • © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}