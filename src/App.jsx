
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, Hash, Send, Plus, Link, Trash2, LogOut, Paperclip, ArrowRight, Maximize, Minimize, MessageSquare, Users, Settings, Search, Home } from "lucide-react";
import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

const startSession = (name) => apiClient.post("/session/start", { name });
const getMySession = () => apiClient.get("/session/me");

const createRoom = (roomData) => apiClient.post("/rooms", roomData);
const getCommunityRooms = () => apiClient.get("/rooms/community");
const getUserspaceRooms = () => apiClient.get("/rooms/userspaces");
const getMyRooms = () => apiClient.get("/rooms/my");
const getRoom = (roomId) => apiClient.get(`/rooms/${roomId}`);
const deleteRoom = (roomId) => apiClient.delete(`/rooms/${roomId}`);
const joinRoom = (roomId) => apiClient.post(`/rooms/${roomId}/join`);
const leaveRoom = (roomId) => apiClient.post(`/rooms/${roomId}/leave`);

const getRoomMembers = (roomId) => apiClient.get(`/rooms/${roomId}/members`);
const getRoomMessages = (roomId) => apiClient.get(`/rooms/${roomId}/messages`);

const createInvite = (roomId) => apiClient.post(`/rooms/${roomId}/invite`);
const getRoomByInvite = (token) => apiClient.get(`/invite/${token}`);

const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

const showBrowserNotification = (room, message) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const title = `New message in ${room.name}`;
    const options = {
        body: `${message.author.name}: ${message.content || 'Sent an attachment'}`,
        icon: '/favicon.ico',
        tag: room.id,
    };
    
    new Notification(title, options);
};


const LoginModal = ({ onLogin, onClose }) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!name.trim()) {
            setError("Please enter a name.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const { data: user } = await startSession(name);
            if (user) {
                onLogin(user);
                onClose();
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to log in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: -20, opacity: 0 }} className="w-full max-w-sm p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-2">Welcome to OpenChat</h2>
                <p className="text-center text-slate-500 mb-6">Enter your name to join the conversation.</p>
                <input value={name} onChange={(e) => setName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && !isLoading && handleLogin()} placeholder="Your display name..." className="w-full p-3 rounded-lg bg-slate-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all" autoFocus disabled={isLoading} />
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
                <button onClick={handleLogin} disabled={isLoading} className="w-full mt-6 p-3 bg-[#4f46e5] text-white rounded-lg font-semibold hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? "Joining..." : "Join Chat"}
                </button>
            </motion.div>
        </motion.div>
    );
};

const CreateRoomModal = ({ onClose, onRoomCreated }) => {
    const [roomName, setRoomName] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!roomName.trim()) {
            setError("Room name cannot be empty.");
            return;
        }
        setIsLoading(true);
        try {
            const { data: newRoom } = await createRoom({ name: roomName, is_public: isPublic });
            onRoomCreated(newRoom);
            onClose();
        } catch (err) {
            setError("Failed to create room. Please try again.");
            console.error("Create room error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-lg p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-5">Create a New Space</h2>
                <p className="text-slate-500 mb-1">Space Name</p>
                <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. #project-phoenix" className="w-full p-3 rounded-lg bg-slate-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] mb-5" autoFocus />
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-300">
                    <div>
                        <label htmlFor="isPublic" className="font-medium text-slate-800">Public Space</label>
                        <p className="text-sm text-slate-500">Discoverable by anyone in the community.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                    </label>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={isLoading} className="px-5 py-2 rounded-lg bg-[#4f46e5] text-white font-semibold hover:bg-[#4338ca] disabled:opacity-50">
                        {isLoading ? "Creating..." : "Create Space"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const JoinByInviteModal = ({ onClose, onJoin }) => {
    const [inviteLink, setInviteLink] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!inviteLink.trim()) {
            setError("Please paste an invite link.");
            return;
        }
        const tokenMatch = inviteLink.match(/\/invite\/([a-fA-F0-9-]+)/);
        if (!tokenMatch || !tokenMatch[1]) {
            setError("Invalid invite link format.");
            return;
        }
        const token = tokenMatch[1];
        setIsLoading(true);
        setError("");
        try {
            const { data: room } = await getRoomByInvite(token);
            await onJoin(room);
            onClose();
        } catch (err) {
            console.error("Join by invite error:", err);
            setError(err.response?.data?.detail || "Failed to find room from invite.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-lg p-8 bg-white rounded-2xl border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Join by Invite</h2>
                <p className="text-slate-500 mb-1">Invite Link</p>
                <input type="text" value={inviteLink} onChange={(e) => setInviteLink(e.target.value)} placeholder="Paste invite link here..." className="w-full p-3 rounded-lg bg-slate-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] mb-4" autoFocus />
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleJoin} disabled={isLoading} className="px-5 py-2 rounded-lg bg-[#4f46e5] text-white font-semibold hover:bg-[#4338ca] disabled:opacity-50">
                        {isLoading ? "Joining..." : "Join"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const RoomCard = ({ room, onSelect, isJoined }) => (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between transition-all hover:border-slate-300 hover:bg-slate-50">
        <div>
            <span className="font-bold flex items-center gap-2"><Hash size={18} className="text-slate-500" />{room.name}</span>
            <p className="text-sm text-slate-500 mt-2">{room.active_users || 0} user{room.active_users !== 1 && 's'} online</p>
        </div>
        <div className="mt-4">
            <button onClick={() => onSelect(room)} className={`w-full text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${isJoined ? "bg-slate-200 text-slate-800 hover:bg-slate-300" : "bg-[#4f46e5] text-white hover:bg-[#4338ca]"}`}>
                {isJoined ? "Enter Chat" : "Join Space"}
            </button>
        </div>
    </div>
);

const ChatPanel = ({ room, messages, user, onSendMessage, onInvite, onDelete, onLeave, onFileUpload, isExpanded, onToggleExpand, onToggleMembersList }) => {
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [messageContent, setMessageContent] = useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (messageContent.trim()) {
            onSendMessage({ content: messageContent, type: 'text' });
            setMessageContent("");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
            event.target.value = null;
        }
    };

    if (!room) {
        return (
            <div className="flex-1 flex items-center justify-center bg-transparent">
                <div className="text-center p-8 bg-white rounded-lg border border-slate-200">
                    <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to OpenChat</h3>
                    <p className="text-slate-500">Select a room from the left to start chatting.</p>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === room.owner_id;

    return (
        <div className="flex-1 flex flex-col bg-white h-full rounded-lg border border-slate-200">
            <header className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2"><Hash size={22} className="text-slate-400" /> {room.name}</h3>
                <div className="flex items-center gap-1">
                    <button onClick={onToggleMembersList} title="Toggle Members List" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        <Users size={18} />
                    </button>
                    <button onClick={onToggleExpand} title={isExpanded ? "Minimize" : "Expand"} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                        {isExpanded ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                    <button onClick={() => onInvite(room.id)} title="Create Invite Link" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"><Link size={18} /></button>
                    {isOwner ? (
                        <button onClick={() => onDelete(room.id)} title="Delete Room" className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={18} /></button>
                    ) : (
                        <button onClick={() => onLeave(room.id)} title="Leave Room" className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"><LogOut size={18} /></button>
                    )}
                </div>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-5">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div key={msg.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 items-start ${msg.author.id === user?.id ? "flex-row-reverse" : ""}`}>
                            <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ring-white">{msg.author.name.charAt(0).toUpperCase()}</div>
                            <div className={`p-3 rounded-lg max-w-lg relative ${msg.author.id === user?.id ? "bg-[#4f46e5] text-white" : "bg-slate-100 text-slate-800"}`}>
                                <p className={`font-semibold text-sm mb-1 ${msg.author.id === user?.id ? "text-slate-200" : "text-slate-700"}`}>{msg.author.name}</p>
                                {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                                {msg.file_url && (
                                    <div className="mt-2">
                                        {/\.(jpg|jpeg|png|gif)$/i.test(msg.file_url) ? (
                                            <img src={msg.file_url} alt="Uploaded content" className="rounded-lg max-w-xs cursor-pointer" onClick={() => window.open(msg.file_url, '_blank')} />
                                        ) : (
                                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-200/50 rounded-lg hover:bg-slate-200 transition-colors">
                                                <Paperclip size={18} className="text-slate-500" />
                                                <span className="text-blue-500 hover:underline text-sm">View Attachment</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>
            <footer className="p-4 border-t border-slate-200 flex items-center gap-3 flex-shrink-0 bg-white rounded-b-lg">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} disabled={!user} className="p-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors"><Paperclip size={20} /></button>
                <div className="relative flex-1">
                    <input type="text" placeholder={user ? `Message #${room.name}...` : "Log in to send a message"} value={messageContent} onChange={(e) => setMessageContent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="w-full pl-4 pr-12 py-3 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-slate-800 transition-all" disabled={!user} />
                    <button onClick={handleSend} disabled={!user || !messageContent.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#4f46e5] text-white rounded-md font-semibold hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Send size={20} /></button>
                </div>
            </footer>
        </div>
    );
};

const ToastNotification = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed top-5 left-1/2 -translate-x-1/2 p-3 px-5 bg-blue-500 text-white rounded-full shadow-lg z-50 text-sm font-medium">{message}</motion.div>);
};


function App() {
    const [user, setUser] = useState(null);
    const [communityRooms, setCommunityRooms] = useState([]);
    const [userspaceRooms, setUserspaceRooms] = useState([]);
    const [myRooms, setMyRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);
    const [isJoinModalOpen, setJoinModalOpen] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [notification, setNotification] = useState(null);
    const ws = useRef(null);
    const [activeTab, setActiveTab] = useState('community'); 
    const [publicSearchQuery, setPublicSearchQuery] = useState("");
    const [myRoomsSearchQuery, setMyRoomsSearchQuery] = useState("");
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isMembersListVisible, setMembersListVisible] = useState(false);
    const profileRef = useRef(null);
    
    const notifiedMessageIds = useRef(new Set());
    

    useEffect(() => {
        
        document.documentElement.classList.remove('dark');
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchAllPublicRooms = async () => {
        try {
            const [communityRes, userspaceRes] = await Promise.all([getCommunityRooms(), getUserspaceRooms()]);
            setCommunityRooms(communityRes.data);
            setUserspaceRooms(userspaceRes.data);
        } catch (error) {
            console.error("Failed to fetch public rooms:", error);
        }
    };

    const fetchMyRooms = async () => {
        if (!user) return;
        try {
            const { data } = await getMyRooms();
            setMyRooms(data);
        } catch (error) {
            if (error.response?.status !== 401) console.error("Failed to fetch my rooms:", error);
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            await fetchAllPublicRooms();
            try {
                const { data } = await getMySession();
                setUser(data);
            } catch (error) {
                
            }
        };
        initializeApp();
    }, []);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (!selectedRoom) {
                fetchAllPublicRooms();
            }
        }, 5000); 

        return () => clearInterval(interval);
    }, [selectedRoom]);


    useEffect(() => {
        if (user) {
            fetchMyRooms();
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [user]);

   
    useEffect(() => {
        if (!user || myRooms.length === 0) return;

        const interval = setInterval(async () => {
            for (const room of myRooms) {
                try {
                    
                    const { data: recentMessages } = await apiClient.get(`/rooms/${room.id}/messages?limit=10`);
                    
                    recentMessages.forEach((msg) => {
                        
                        if (!notifiedMessageIds.current.has(msg.id) && msg.author.id !== user.id) {
                            notifiedMessageIds.current.add(msg.id);

                            setMyRooms(prevRooms =>
                                prevRooms.map(r =>
                                    r.id === room.id ? { ...r, unread_count: (r.unread_count || 0) + 1 } : r
                                )
                            );
                            
                            if (!document.hasFocus()) {
                                showBrowserNotification(room, msg);
                            }
                        }
                    });
                } catch (err) {
                    console.error(`Polling failed for room ${room.name}:`, err);
                }
            }
        }, 10000); 

        return () => clearInterval(interval);
    }, [myRooms, user]); 

    useEffect(() => {
        if (!selectedRoom || !user) {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            setMembers([]);
            setMembersListVisible(false);
            return;
        }

        const fetchRoomDetails = async () => {
            try {
                const [messagesRes, membersRes] = await Promise.all([getRoomMessages(selectedRoom.id), getRoomMembers(selectedRoom.id)]);
                setMessages(messagesRes.data.reverse());
                setMembers(membersRes.data);
            } catch (error) {
                console.error("Failed to fetch room details:", error);
                setNotification("Could not load room details.");
            }
        };
        fetchRoomDetails();

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/${selectedRoom.id}`;
        const socket = new WebSocket(wsUrl);
        ws.current = socket;

        socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            
            if (messageData.room_id === selectedRoom.id) {
                setMessages((prev) => {
                    if (prev.some(msg => msg.id === messageData.id)) return prev;
                    return [...prev, messageData];
                });
            }

            if (notifiedMessageIds.current.has(messageData.id)) return;

            if (messageData.author.id === user.id) return;
            
            notifiedMessageIds.current.add(messageData.id);

            setMyRooms(prev => prev.map(room => room.id === messageData.room_id ? { ...room, unread_count: (room.unread_count || 0) + 1 } : room));

            if (!document.hasFocus() || messageData.room_id !== selectedRoom.id) {
                const notifyingRoom = myRooms.find(r => r.id === messageData.room_id);
                if (notifyingRoom) {
                    showBrowserNotification(notifyingRoom, messageData);
                }
            }
        };

        socket.onclose = () => console.log("WebSocket disconnected from", selectedRoom.name);
        socket.onerror = (err) => console.error("WebSocket error:", err);

        return () => {
            if (socket) socket.close();
        };
    }, [selectedRoom, user, myRooms]); // Added myRooms to dependency array for accurate notification data.

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setLoginModalOpen(false);
    };

    const handleLogout = () => {
        document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        setMyRooms([]);
        setSelectedRoom(null);
        setProfileOpen(false);
    };

    const handleRoomSelect = async (room) => {
        if (!user) {
            setLoginModalOpen(true);
            return;
        }
        const isAlreadyMember = myRooms.some((myRoom) => myRoom.id === room.id);
        try {
            if (!isAlreadyMember) {
                await joinRoom(room.id);
                const { data: newRoomData } = await getRoom(room.id);
                setMyRooms(prev => [...prev, { ...newRoomData, unread_count: 0, active_users: 1 }]);
                setSelectedRoom(newRoomData);
            } else {
                setSelectedRoom(room);
                setMyRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
            }
        } catch (error) {
            console.error("Failed to join or select room:", error);
            setNotification("Could not join room.");
            if (error.response?.status === 401) handleLogout();
        }
    };

    const handleRoomCreated = (newRoom) => {
        setMyRooms(prev => [...prev, { ...newRoom, unread_count: 0, active_users: 1 }]);
        setSelectedRoom(newRoom);
        if (newRoom.is_public) {
            fetchAllPublicRooms();
        }
    };

    const handleSendMessage = (messagePayload) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(messagePayload));
        } else {
            setNotification("Connection lost. Please refresh.");
        }
    };

    const handleFileUpload = async (file) => {
        try {
            const { data } = await uploadFile(file);
            handleSendMessage({ content: '', file_url: data.file_url, type: 'file' });
        } catch (error) {
            console.error("File upload failed:", error);
            setNotification("File upload failed.");
        }
    };

    const handleInvite = async (roomId) => {
        try {
            const { data } = await createInvite(roomId);
            const inviteLink = `${window.location.origin}/invite/${data.token}`;
            navigator.clipboard.writeText(inviteLink);
            setNotification("Invite link copied to clipboard!");
        } catch (error) {
            console.error("Failed to create invite:", error);
            setNotification(error.response?.data?.detail || "Could not create invite.");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm("Are you sure you want to delete this room? This cannot be undone.")) {
            if (selectedRoom?.id === roomId) setSelectedRoom(null);
            try {
                await deleteRoom(roomId);
                setMyRooms(prev => prev.filter(r => r.id !== roomId));
                setUserspaceRooms(prev => prev.filter(r => r.id !== roomId));
                setNotification("Room deleted successfully.");
            } catch (error) {
                console.error("Failed to delete room:", error);
                setNotification(error.response?.data?.detail || "Could not delete room.");
            }
        }
    };

    const handleLeaveRoom = async (roomId) => {
        if (window.confirm("Are you sure you want to leave this room?")) {
            if (selectedRoom?.id === roomId) setSelectedRoom(null);
            try {
                await leaveRoom(roomId);
                setMyRooms(prev => prev.filter(r => r.id !== roomId));
                setNotification("You have left the room.");
            } catch (error) {
                console.error("Failed to leave room:", error);
                setNotification(error.response?.data?.detail || "Could not leave room.");
                fetchMyRooms();
            }
        }
    };

    const totalUnreadCount = useMemo(() => {
        return myRooms.reduce((acc, room) => acc + (room.unread_count || 0), 0);
    }, [myRooms]);
    
    const filteredMyRooms = useMemo(() => {
        return myRooms.filter(room => room.name.toLowerCase().includes(myRoomsSearchQuery.toLowerCase()));
    }, [myRooms, myRoomsSearchQuery]);
    
    const filteredPublicRooms = useMemo(() => {
        if (!publicSearchQuery) return [];
        const allPublic = [...communityRooms, ...userspaceRooms];
        return allPublic.filter(room => room.name.toLowerCase().includes(publicSearchQuery.toLowerCase()));
    }, [communityRooms, userspaceRooms, publicSearchQuery]);

    const myRoomIds = new Set(myRooms.map((r) => r.id));

    const chatPanelComponent = (
        <ChatPanel
            room={selectedRoom} messages={messages} user={user}
            onSendMessage={handleSendMessage} onInvite={handleInvite}
            onDelete={handleDeleteRoom} onLeave={handleLeaveRoom}
            onFileUpload={handleFileUpload} isExpanded={isChatExpanded}
            onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
            onToggleMembersList={() => setMembersListVisible(!isMembersListVisible)}
        />
    );

    
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <AnimatePresence>
                {notification && <ToastNotification message={notification} onDismiss={() => setNotification(null)} />}
                {isLoginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} onLogin={handleLogin} />}
                {isCreateRoomModalOpen && <CreateRoomModal onClose={() => setCreateRoomModalOpen(false)} onRoomCreated={handleRoomCreated} />}
                {isJoinModalOpen && <JoinByInviteModal onClose={() => setJoinModalOpen(false)} onJoin={handleRoomSelect} />}
            </AnimatePresence>

            <header className="sticky top-0 bg-white/80 backdrop-blur-lg z-40 border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 bg-slate-900 text-white flex items-center justify-center rounded-md font-bold text-xl">OC</div>
                        </div>
                        <div className="flex-1 max-w-md">
                             <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                  <input 
                                       type="text"
                                       placeholder={selectedRoom ? "Search your joined rooms..." : "Search all public rooms..."}
                                       value={selectedRoom ? myRoomsSearchQuery : publicSearchQuery}
                                       onChange={(e) => selectedRoom ? setMyRoomsSearchQuery(e.target.value) : setPublicSearchQuery(e.target.value)}
                                       className="w-full bg-slate-100 border border-slate-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all"
                                  />
                             </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMyRooms(prev => prev.map(r => ({ ...r, unread_count: 0 })))} className="relative w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors" title="Clear Notifications">
                                <Bell size={20} className="text-slate-500" />
                                {totalUnreadCount > 0 && (<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{totalUnreadCount}</span>)}
                            </button>
                            <div className="relative flex items-center gap-2" ref={profileRef}>
                                {user ? (
                                    <>
                                        <button onClick={() => setProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-[#4f46e5] flex items-center justify-center font-bold text-lg text-white" title={`Logged in as ${user.name}.`}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </button>
                                        <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 p-2">
                                                  <div className="p-2 border-b border-slate-200 mb-2">
                                                      <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                                                      <p className="text-sm text-slate-500">ID: {String(user.id).substring(0,8)}...</p>
                                                  </div>
                                                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 text-left rounded-md text-red-500 hover:bg-red-500/10 transition-colors">
                                                      <LogOut size={18} /> <span className="font-medium">Log Out</span>
                                                  </button>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <button onClick={() => setLoginModalOpen(true)} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 font-bold transition-colors whitespace-nowrap">Create account</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* --- Left Sidebar --- */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                             <button onClick={() => setSelectedRoom(null)} className="w-full p-3 mb-4 rounded-lg bg-slate-100 text-slate-800 font-semibold text-left transition-all hover:bg-slate-200 flex items-center justify-center gap-2"><Home size={20} /> Go to Discovery</button>
                             <button onClick={() => (user ? setCreateRoomModalOpen(true) : setLoginModalOpen(true))} className="w-full p-3 mb-3 rounded-lg bg-slate-100 text-slate-800 font-semibold text-left transition-all hover:bg-slate-200 flex items-center justify-center gap-2"><Plus size={20} /> Create New Space</button>
                             <button onClick={() => (user ? setJoinModalOpen(true) : setLoginModalOpen(true))} className="w-full p-3 rounded-lg bg-slate-100 text-slate-800 font-semibold text-left transition-all hover:bg-slate-200 flex items-center justify-center gap-2"><ArrowRight size={20} /> Join with Invite</button>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-3 text-lg">My Spaces</h3>
                            <div className="space-y-1">
                                {filteredMyRooms.length > 0 ? filteredMyRooms.map((room) => (
                                    <button key={room.id} onClick={() => handleRoomSelect(room)} className={`w-full p-2.5 text-left rounded-md flex justify-between items-center transition-colors text-base ${selectedRoom?.id === room.id ? "bg-[#4f46e5]/10 text-[#4338ca]" : "text-slate-600 hover:bg-slate-100"}`}>
                                        <span className="flex items-center gap-2 font-medium truncate"><Hash size={16} />{room.name}</span>
                                        {room.unread_count > 0 && <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full flex-shrink-0">{room.unread_count}</span>}
                                    </button>
                                )) : <p className="text-slate-500 text-sm p-2">{myRoomsSearchQuery ? 'No rooms match your search.' : "You haven't joined any spaces yet."}</p>}
                            </div>
                        </div>
                    </aside>

                    {/* --- Center Content --- */}
                    <div className={`transition-all duration-300 ease-in-out ${selectedRoom ? (isMembersListVisible ? 'lg:col-span-6' : 'lg:col-span-9') : 'lg:col-span-9'}`}>
                        {selectedRoom ? (
                            <div className="h-[calc(100vh-12rem)] min-h-[500px]">
                                {chatPanelComponent}
                            </div>
                        ) : (
                            <div>
                                {publicSearchQuery ? (
                                    <>
                                        <h2 className="text-xl font-bold mb-4">Search Results for "{publicSearchQuery}"</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredPublicRooms.length > 0 ? filteredPublicRooms.map((room) => <RoomCard key={room.id} room={room} onSelect={handleRoomSelect} isJoined={myRoomIds.has(room.id)} />)
                                            : <p className="text-slate-500 md:col-span-2 xl:col-span-3">No public rooms found.</p>}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
                                            <button onClick={() => setActiveTab('community')} className={`py-3 px-1 font-semibold transition-colors ${activeTab === 'community' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Community</button>
                                            <button onClick={() => setActiveTab('userspaces')} className={`py-3 px-1 font-semibold transition-colors ${activeTab === 'userspaces' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>Userspaces</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {activeTab === 'community' && communityRooms.map((room) => <RoomCard key={room.id} room={room} onSelect={handleRoomSelect} isJoined={myRoomIds.has(room.id)} />)}
                                            {activeTab === 'userspaces' && userspaceRooms.map((room) => <RoomCard key={room.id} room={room} onSelect={handleRoomSelect} isJoined={myRoomIds.has(room.id)} />)}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- Right Sidebar --- */}
                    <AnimatePresence>
                    {selectedRoom && isMembersListVisible && (
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="lg:col-span-3"
                        >
                            <div className="p-4 bg-white rounded-lg border border-slate-200 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2"><Users size={20} /> Members ({members.length})</h3>
                                <ul className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                                    {members.length > 0 ? members.map((member) => (
                                        <li key={member.id} className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold flex-shrink-0 relative">
                                                {member.name.charAt(0).toUpperCase()}
                                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${user?.id === member.id ? "bg-blue-500" : "bg-green-500"} ring-2 ring-white`}></span>
                                            </div>
                                            <span className="font-medium truncate">{member.name}</span>
                                        </li>
                                    )) : <p className="text-slate-500 text-sm">{selectedRoom ? 'No one is here yet.' : 'Select a room to see members.'}</p>}
                                </ul>
                            </div>
                        </motion.aside>
                    )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {isChatExpanded && selectedRoom && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-4 sm:p-8 md:p-12 lg:p-16">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full shadow-2xl">
                            {chatPanelComponent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;









