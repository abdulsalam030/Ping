import { useEffect, useRef } from "react";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
}

export default function MessageList({
  messages,
  currentUsername,
  typingUsers,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-gray-500 text-lg font-medium mb-2">
              No messages yet
            </p>
            <p className="text-gray-400 text-sm">Start the conversation!</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.username === currentUsername
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.username === currentUsername
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                  : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
              }`}
            >
              {message.username !== currentUsername && (
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  {message.username}
                </p>
              )}
              <p className="break-words">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.username === currentUsername
                    ? "text-indigo-100"
                    : "text-gray-500"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(", ")} are typing...`}
          </span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
