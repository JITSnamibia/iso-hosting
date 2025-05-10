import React, { useState, useEffect } from "react";
import { useFirebaseStorage } from "./hooks/useFirebaseStorage";
import { useFirebaseAuth } from "./hooks/useFirebaseAuth";

// Components
const ServerCard = ({ server, onToggleStatus }) => (
  <div className={`p-6 rounded-xl bg-gray-900/30 backdrop-blur-md neon-border border-2 ${server.status === 'online' ? 'glow-green' : 'glow-purple'} transition-all duration-300 hover:scale-[1.02]`}>
    <h3 className="text-xl font-bold mb-2">{server.name}</h3>
    <div className="space-y-1 text-sm text-gray-300">
      <p>Type: {server.type}</p>
      <p>IP: {server.ip}:{server.port}</p>
      {server.type === 'game' && <p>Players: {server.maxPlayers || 0}/10</p>}
    </div>
    <button 
      onClick={() => onToggleStatus(server.id)}
      className={`mt-4 w-full py-2 rounded-lg font-medium ${
        server.status === 'online' 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-green-500 hover:bg-green-600'
      }`}
    >
      {server.status === 'online' ? 'Stop Server' : 'Start Server'}
    </button>
  </div>
);

const FriendCard = ({ friend }) => (
  <div className="p-5 rounded-xl bg-gray-900/30 backdrop-blur-md neon-border border-2 transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-lg font-bold">
        {friend.name.charAt(0)}
      </div>
      <div>
        <h3 className="font-semibold">{friend.name}</h3>
        <p className="text-xs text-gray-400">{friend.status}</p>
      </div>
    </div>
    {friend.game && (
      <div className="mt-2 px-3 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
        Playing: {friend.game}
      </div>
    )}
  </div>
);

const FileItem = ({ file, onDelete }) => (
  <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg neon-border border-2 hover:bg-gray-800/40 transition">
    <div className="flex items-center space-x-3 truncate">
      <span className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">📁</span>
      <div>
        <p className="font-medium">{file.name}</p>
        <p className="text-xs text-gray-400">{file.type} • {formatFileSize(file.size)}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={() => {
        const link = document.createElement("a");
        link.href = file.preview;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }} className="text-blue-400 hover:text-blue-300">
        Download
      </button>
      <button onClick={onDelete} className="text-red-400 hover:text-red-300">
        Delete
      </button>
    </div>
  </div>
);

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function App() {
  const { user, loading: authLoading, error: authError } = useFirebaseAuth();
  const [servers, setServers] = useFirebaseStorage("servers", []);
  const [friends, setFriends] = useFirebaseStorage("friends", []);
  const [files, setFiles] = useFirebaseStorage("files", []);

  const [activeTab, setActiveTab] = useState("games");
  const [newServer, setNewServer] = useState({ name: "", type: "game", ip: "", port: "" });
  const [newFriend, setNewFriend] = useState({ name: "", status: "offline", game: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Floating background particles
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 80; i++) {
      const size = Math.random() * 2 + 1;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 5;
      particles.push(
        <div
          key={i}
          className="absolute rounded-full bg-cyan-500 opacity-30"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animation: `float ${Math.random() * 5 + 5}s infinite ease-in-out`,
            animationDelay: `${animationDelay}s`,
          }}
        />
      );
    }
    return particles;
  };

  // Toggle server status
  const toggleServerStatus = async (id) => {
    try {
      const updated = servers.map(s =>
        s.id === id ? { ...s, status: s.status === "online" ? "offline" : "online" } : s
      );
      await setServers(updated);
    } catch (err) {
      alert("Failed to update server.");
    }
  };

  // Add server
  const addServer = async (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.ip || !newServer.port) return;
    await setServers([...servers, { ...newServer, id: Date.now(), status: "offline" }]);
    setNewServer({ name: "", type: "game", ip: "", port: "" });
    setIsModalOpen(false);
  };

  // Add friend
  const addFriend = async (e) => {
    e.preventDefault();
    if (!newFriend.name) return;
    await setFriends([...friends, { ...newFriend, id: Date.now() }]);
    setNewFriend({ name: "", status: "offline", game: "" });
    setIsModalOpen(false);
  };

  // Upload file
  const handleFileUpload = async (e) => {
    const uploaded = Array.from(e.target.files).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      preview: URL.createObjectURL(f)
    }));
    await setFiles([...files, ...uploaded]);
  };

  // Delete file
  const deleteFile = async (index) => {
    const updated = files.filter((_, i) => i !== index);
    await setFiles(updated);
  };

  // Loading state
  if (authLoading) return <div className="text-center p-8">Connecting to Firebase...</div>;
  if (authError) return <div className="text-red-500 text-center p-8">{authError.message}</div>;

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Background particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {renderParticles()}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero */}
        <section className="py-20 px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight neon-text mb-4">
            My Realm
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Where me and my friends play, share, and connect.
          </p>
        </section>

        {/* Navigation Tabs */}
        <nav className="flex justify-center gap-4 mb-8 relative z-10">
          <button onClick={() => setActiveTab("games")} className={`px-5 py-2 rounded-lg transition-colors ${activeTab === "games" ? "bg-blue-500/30" : "hover:bg-gray-800/30"}`}>Game Servers</button>
          <button onClick={() => setActiveTab("friends")} className={`px-5 py-2 rounded-lg transition-colors ${activeTab === "friends" ? "bg-purple-500/30" : "hover:bg-gray-800/30"}`}>Friends</button>
          <button onClick={() => setActiveTab("files")} className={`px-5 py-2 rounded-lg transition-colors ${activeTab === "files" ? "bg-pink-500/30" : "hover:bg-gray-800/30"}`}>Shared Files</button>
        </nav>

        {/* Tab Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {activeTab === "games" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Game Servers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {servers.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">No servers yet.</p>
                ) : (
                  servers.map(server => (
                    <ServerCard key={server.id} server={server} onToggleStatus={toggleServerStatus} />
                  ))
                )}
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add Game Server</button>
            </>
          )}

          {activeTab === "friends" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Friends</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {friends.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">No friends added yet.</p>
                ) : (
                  friends.map(friend => <FriendCard key={friend.id} friend={friend} />)
                )}
              </div>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add Friend</button>
            </>
          )}

          {activeTab === "files" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Shared Files</h2>
              <div className="space-y-3 mb-6">
                {files.length === 0 ? (
                  <p className="text-center text-gray-500">No files uploaded yet.</p>
                ) : (
                  files.map((file, i) => (
                    <FileItem key={i} file={file} onDelete={() => deleteFile(i)} />
                  ))
                )}
              </div>
              <label className="btn btn-secondary block text-center cursor-pointer">Upload File
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm pb-6 mt-10">
          Personal Server Hub • Built with React & Firebase • © {new Date().getFullYear()}
        </footer>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content bg-gray-900 p-6 rounded-xl shadow-2xl transform transition-all scale-100 opacity-100">
              <h3 className="text-xl font-bold mb-4">Add New Item</h3>
              <form onSubmit={activeTab === "games" ? addServer : addFriend}>
                {activeTab === "games" ? (
                  <>
                    <input value={newServer.name} onChange={e => setNewServer({ ...newServer, name: e.target.value })} placeholder="Server Name" className="input mb-3 w-full" required />
                    <select value={newServer.type} onChange={e => setNewServer({ ...newServer, type: e.target.value })} className="input mb-3 w-full">
                      <option value="game">Game Server</option>
                      <option value="file">File Server</option>
                    </select>
                    <input value={newServer.ip} onChange={e => setNewServer({ ...newServer, ip: e.target.value })} placeholder="IP Address" className="input mb-3 w-full" required />
                    <input value={newServer.port} onChange={e => setNewServer({ ...newServer, port: e.target.value })} placeholder="Port" className="input mb-3 w-full" required />
                  </>
                ) : (
                  <>
                    <input value={newFriend.name} onChange={e => setNewFriend({ ...newFriend, name: e.target.value })} placeholder="Friend's Name" className="input mb-3 w-full" required />
                    <select value={newFriend.status} onChange={e => setNewFriend({ ...newFriend, status: e.target.value })} className="input mb-3 w-full">
                      <option value="online">Online</option>
                      <option value="away">Away</option>
                      <option value="offline">Offline</option>
                    </select>
                    <input value={newFriend.game} onChange={e => setNewFriend({ ...newFriend, game: e.target.value })} placeholder="Currently Playing (optional)" className="input mb-3 w-full" />
                  </>
                )}
                <div className="flex justify-end mt-4 gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                  <button type="submit" className="btn btn-accent">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .neon-text {
          background: linear-gradient(90deg, #00f2ff, #ff00d4);
          -webkit-background-clip: text;
          color: transparent;
        }
        .input {
          @apply px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white w-full;
        }
        .btn {
          @apply px-4 py-2 rounded-lg font-medium transition-colors;
        }
        .btn-primary {
          @apply bg-blue-600 hover:bg-blue-700 text-white;
        }
        .btn-secondary {
          @apply bg-gray-700 hover:bg-gray-600 text-white;
        }
        .btn-accent {
          @apply bg-fuchsia-600 hover:bg-fuchsia-700 text-white;
        }
        .btn-outline {
          @apply bg-transparent border border-gray-600 hover:bg-gray-800 text-white;
        }
        .modal-overlay {
          @apply fixed inset-0 bg-black/70 z-50 flex items-center justify-center;
        }
        .modal-content {
          @apply w-full max-w-md p-6 bg-opacity-90 backdrop-blur-md border border-fuchsia-500/30 shadow-2xl shadow-fuchsia-500/20 text-white;
        }
      `}</style>
    </div>
  );
}