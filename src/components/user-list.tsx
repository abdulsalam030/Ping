interface User {
  username: string;
  status: "online" | "offline";
  lastSeen: number;
  isTyping: boolean;
}

interface UserListProps {
  users: Record<string, User>;
  currentUsername: string;
}

export default function UserList({ users, currentUsername }: UserListProps) {
  const onlineUsers = Object.entries(users)
    .filter(([name, u]) => u.status === "online" && name !== currentUsername)
    .sort(([, a], [, b]) => b.lastSeen - a.lastSeen);

  return (
    <div className="space-y-2">
      {onlineUsers.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No other users online</p>
      ) : (
        onlineUsers.map(([name, user]) => (
          <div
            key={name}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name}
              </p>
              {user.isTyping && (
                <p className="text-xs text-indigo-600 font-medium">typing...</p>
              )}
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          </div>
        ))
      )}
    </div>
  );
}
