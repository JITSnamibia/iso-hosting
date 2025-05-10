import React, { useState, useEffect } from 'react';

export default function App() {
  // Server state
  const [servers, setServers] = useState([]);
  const [newServer, setNewServer] = useState({
    name: '',
    type: 'game',
    ip: '',
    port: '',
    maxPlayers: 0,
    status: 'offline'
  });
  
  // Friends state
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState({
    name: '',
    status: 'offline',
    game: ''
  });
  
  // Files state
  const [files, setFiles] = useState([]);
  const [theme, setTheme] = useState('dark');
  
  // Load data from localStorage
  useEffect(() => {
    const savedServers = localStorage.getItem('servers');
    const savedFriends = localStorage.getItem('friends');
    const savedFiles = localStorage.getItem('files');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedServers) setServers(JSON.parse(savedServers));
    if (savedFriends) setFriends(JSON.parse(savedFriends));
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedTheme) setTheme(savedTheme);
    
    // Set up theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('servers', JSON.stringify(servers));
  }, [servers]);
  
  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);
  
  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Server functions
  const handleServerChange = (e) => {
    setNewServer({...newServer, [e.target.name]: e.target.value});
  };
  
  const addServer = (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.ip || !newServer.port) return;
    
    setServers([...servers, {
      ...newServer,
      id: Date.now(),
      status: 'offline'
    }]);
    
    setNewServer({...newServer, name: '', ip: '', port: ''});
  };
  
  const toggleServerStatus = (id) => {
    setServers(servers.map(server => 
      server.id === id ? {
        ...server, 
        status: server.status === 'online' ? 'offline' : 'online'
      } : server
    ));
  };
  
  // Friend functions
  const handleFriendChange = (e) => {
    setNewFriend({...newFriend, [e.target.name]: e.target.value});
  };
  
  const addFriend = (e) => {
    e.preventDefault();
    if (!newFriend.name) return;
    
    setFriends([...friends, {
      ...newFriend,
      id: Date.now()
    }]);
    
    setNewFriend({...newFriend, name: ''});
  };
  
  // File functions
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      preview: URL.createObjectURL(file)
    }));
    
    setFiles([...files, ...uploadedFiles]);
  };
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('games');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Header */}
      <header className="py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <h1 className="text-2xl font-bold">Personal Server Hub</h1>
            </div>
            
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <button 
                    onClick={() => setActiveTab('games')}
                    className={`pb-1 ${activeTab === 'games' 
                      ? 'border-b-2 border-blue-600 dark:border-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Servers
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('files')}
                    className={`pb-1 ${activeTab === 'files' 
                      ? 'border-b-2 border-blue-600 dark:border-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    Files
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('friends')}
                    className={`pb-1 ${activeTab === 'friends' 
                      ? 'border-b-2 border-blue-600 dark:border-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
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
        {activeTab === 'games' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Game Servers</h2>
              <button 
                onClick={() => document.getElementById('addServerModal').showModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Server
              </button>
            </div>
            
            {servers.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <p className="text-gray-600 dark:text-gray-400">No servers added yet. Click "Add Server" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => (
                  <div key={server.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{server.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          server.status === 'online' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {server.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Type: {server.type}</p>
                        <p>IP: {server.ip}:{server.port}</p>
                        {server.type === 'game' && (
                          <p>Max Players: {server.maxPlayers || 0}</p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button 
                          onClick={() => toggleServerStatus(server.id)}
                          className={`flex-1 py-2 rounded ${
                            server.status === 'online' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white transition-colors`}
                        >
                          {server.status === 'online' ? 'Stop' : 'Start'}
                        </button>
                        <button 
                          onClick={() => {
                            document.getElementById(`serverDetails-${server.id}`).classList.toggle('hidden');
                          }}
                          className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      <div id={`serverDetails-${server.id}`} className="mt-4 hidden">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                          <h4 className="font-medium mb-2">Connection Details</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {server.type === 'game' ? 'Connect to this server using the IP and port above.' : 'This is a file server.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* Files Section */}
        {activeTab === 'files' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Shared Files</h2>
              <div className="flex space-x-3">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Upload File
                  <input type="file" onChange={handleFileUpload} className="hidden" multiple />
                </label>
                <button 
                  onClick={() => setFiles([])}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            {files.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <p className="text-gray-600 dark:text-gray-400">No files uploaded yet. Click "Upload File" to share files with friends.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="relative px-6 py-3">
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
                                {file.type.startsWith('image/') ? (
                                  <img className="h-10 w-10 rounded object-cover" src={file.preview} alt={file.name} />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {file.type || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(file.lastModified).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => {
                                const link = document.createElement('a');
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
                              onClick={() => {
                                setFiles(files.filter((_, i) => i !== index));
                              }}
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
        {activeTab === 'friends' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Friends</h2>
              <button 
                onClick={() => document.getElementById('addFriendModal').showModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Friend
              </button>
            </div>
            
            {friends.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <p className="text-gray-600 dark:text-gray-400">No friends added yet. Click "Add Friend" to start connecting.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                              {friend.name.charAt(0)}
                            </span>
                          </div>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                            friend.status === 'online' ? 'bg-green-500' : 
                            friend.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></span>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold">{friend.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {friend.status === 'online' ? 'Online' : 
                             friend.status === 'away' ? 'Away' : 'Offline'}
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
                        {friend.status === 'online' && (
                          <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Personal Server Hub • Built with React & Tailwind CSS • © {new Date().getFullYear()}</p>
        </div>
      </footer>
      
      {/* Modals */}
      {/* Add Server Modal */}
      <dialog id="addServerModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add New Server</h3>
          <form onSubmit={addServer}>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Server Name</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={newServer.name}
                  onChange={handleServerChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select 
                  name="type"
                  value={newServer.type}
                  onChange={handleServerChange}
                  className="select select-bordered w-full"
                >
                  <option value="game">Game Server</option>
                  <option value="file">File Server</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">IP Address</span>
                </label>
                <input 
                  type="text" 
                  name="ip"
                  value={newServer.ip}
                  onChange={handleServerChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Port</span>
                </label>
                <input 
                  type="number" 
                  name="port"
                  value={newServer.port}
                  onChange={handleServerChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              {newServer.type === 'game' && (
                <div>
                  <label className="label">
                    <span className="label-text">Max Players</span>
                  </label>
                  <input 
                    type="number" 
                    name="maxPlayers"
                    value={newServer.maxPlayers}
                    onChange={handleServerChange}
                    className="input input-bordered w-full"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-action">
              <button type="button" onClick={() => document.getElementById('addServerModal').close()} className="btn mr-2">Cancel</button>
              <button type="submit" className="btn btn-primary">Add Server</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      
      {/* Add Friend Modal */}
      <dialog id="addFriendModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Add New Friend</h3>
          <form onSubmit={addFriend}>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={newFriend.name}
                  onChange={handleFriendChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select 
                  name="status"
                  value={newFriend.status}
                  onChange={handleFriendChange}
                  className="select select-bordered w-full"
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Currently Playing</span>
                </label>
                <input 
                  type="text" 
                  name="game"
                  value={newFriend.game}
                  onChange={handleFriendChange}
                  className="input input-bordered w-full"
                  placeholder="Game name"
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button type="button" onClick={() => document.getElementById('addFriendModal').close()} className="btn mr-2">Cancel</button>
              <button type="submit" className="btn btn-primary">Add Friend</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}