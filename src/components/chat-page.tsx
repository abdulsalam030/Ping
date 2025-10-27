import { useState, useEffect, useRef } from "react";
import { ref, set, onValue, push, remove, update } from "firebase/database";
import { LogOut, Users } from "lucide-react";
import MessageList from "../components/message-list";
import MessageInput from "./message-input";
import UserList from "./user-list";
import { database } from "../libs/firebase"; // Import database from firebase.tsx

interface ChatPageProps {
  username: string;
  onLogout: () => void;
}

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

interface User {
  username: string;
  status: "online" | "offline";
  lastSeen: number;
  isTyping: boolean;
}

export default function ChatPage({ username, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register user and set up listeners
  useEffect(() => {
    const userRef = ref(database, `users/${username}`);
    const messagesRef = ref(database, "messages");
    const usersRef = ref(database, "users");

    // Set user as online
    set(userRef, {
      username,
      status: "online",
      lastSeen: Date.now(),
      isTyping: false,
    });

    // Listen for messages
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, msg]: any) => ({
          id,
          ...msg,
        }));
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    // Listen for users
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data);
      }
    });

    // Handle page unload
    const handleBeforeUnload = () => {
      remove(userRef);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribeMessages();
      unsubscribeUsers();
      remove(userRef);
    };
  }, [username]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const messagesRef = ref(database, "messages");
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      username,
      text: text.trim(),
      timestamp: Date.now(),
    });

    // Clear typing indicator
    setIsTyping(false);
    const userRef = ref(database, `users/${username}`);
    await update(userRef, { isTyping: false });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const userRef = ref(database, `users/${username}`);
      update(userRef, { isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const userRef = ref(database, `users/${username}`);
      update(userRef, { isTyping: false });
    }, 3000);
  };

  const handleLogoutClick = () => {
    const userRef = ref(database, `users/${username}`);
    remove(userRef);
    onLogout();
  };

  const onlineUsers = Object.values(users).filter(
    (u) => u.status === "online"
  ).length;
  const typingUsers = Object.entries(users)
    .filter(([name, u]) => u.isTyping && name !== username)
    .map(([name]) => name);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{username}</p>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Online ({onlineUsers})
            </h3>
          </div>
          <UserList users={users} currentUsername={username} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <MessageList
            messages={messages}
            currentUsername={username}
            typingUsers={typingUsers}
          />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
          />
        </div>
      </div>
    </div>
  );
}
