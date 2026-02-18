import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Search, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
  read: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const defaultChats: ChatContact[] = [
  {
    id: "u1",
    name: "Jane Wanjiku",
    avatar: "JW",
    lastMessage: "Is the apartment still available?",
    time: "2:30 PM",
    unread: 2,
    online: true,
    messages: [
      { id: "1", text: "Hi, I saw your listing for the 2BR apartment in Westlands", sender: "other", time: "2:25 PM", read: true },
      { id: "2", text: "Is the apartment still available?", sender: "other", time: "2:30 PM", read: false },
    ],
  },
  {
    id: "u2",
    name: "Peter Omondi",
    avatar: "PO",
    lastMessage: "Thank you, I'll schedule a visit",
    time: "Yesterday",
    unread: 0,
    online: false,
    messages: [
      { id: "1", text: "Hello, what's the security deposit for the Karen house?", sender: "other", time: "Yesterday", read: true },
      { id: "2", text: "The deposit is 2 months rent, which is KES 240,000", sender: "me", time: "Yesterday", read: true },
      { id: "3", text: "Thank you, I'll schedule a visit", sender: "other", time: "Yesterday", read: true },
    ],
  },
  {
    id: "u3",
    name: "Sarah Njeri",
    avatar: "SN",
    lastMessage: "Can I see the property this weekend?",
    time: "Mon",
    unread: 1,
    online: true,
    messages: [
      { id: "1", text: "Hi! I'm interested in the studio in Kilimani", sender: "other", time: "Mon", read: true },
      { id: "2", text: "Can I see the property this weekend?", sender: "other", time: "Mon", read: false },
    ],
  },
  {
    id: "u4",
    name: "David Mwangi",
    avatar: "DM",
    lastMessage: "Start a conversation",
    time: "",
    unread: 0,
    online: false,
    messages: [],
  },
];

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const sellerIdParam = searchParams.get("seller");
  const sellerNameParam = searchParams.get("name");
  const sellerAvatarParam = searchParams.get("avatar");
  const itemTitleParam = searchParams.get("item");

  const [chats, setChats] = useState<ChatContact[]>(() => {
    // If navigating from a listing, ensure the seller exists in chat list
    if (sellerIdParam && sellerNameParam) {
      const exists = defaultChats.find((c) => c.id === sellerIdParam);
      if (!exists) {
        return [
          ...defaultChats,
          {
            id: sellerIdParam,
            name: sellerNameParam,
            avatar: sellerAvatarParam || sellerNameParam.split(" ").map(n => n[0]).join(""),
            lastMessage: "Start a conversation",
            time: "",
            unread: 0,
            online: true,
            messages: [],
          },
        ];
      }
    }
    return defaultChats;
  });

  const [selectedChat, setSelectedChat] = useState<ChatContact | null>(() => {
    if (sellerIdParam) {
      const found = chats.find((c) => c.id === sellerIdParam);
      if (found) {
        // Auto-send intro message about the item
        if (itemTitleParam && found.messages.length === 0) {
          const introMsg: Message = {
            id: "auto-1",
            text: `Hi! I'm interested in your listing: "${itemTitleParam}". Is it still available?`,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            read: false,
          };
          found.messages = [introMsg];
          found.lastMessage = introMsg.text;
          found.time = "Now";
        }
        return found;
      }
    }
    return null;
  });

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: messageText, time: "Now" }
          : chat
      )
    );

    setSelectedChat((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMessage], lastMessage: messageText } : null
    );

    setMessageText("");
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div
          className={`w-full border-r border-border bg-card md:w-80 lg:w-96 ${
            selectedChat ? "hidden md:flex" : "flex"
          } flex-col`}
        >
          <div className="border-b border-border p-4">
            <h2 className="font-display text-xl font-bold text-card-foreground">Messages</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted/50 ${
                  selectedChat?.id === chat.id ? "bg-muted" : ""
                }`}
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm text-muted-foreground">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-1 flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="text-muted-foreground md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                      {selectedChat.avatar}
                    </div>
                    {selectedChat.online && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{selectedChat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
                <div className="space-y-3">
                  {selectedChat.messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === "me"
                            ? "rounded-br-md bg-accent text-accent-foreground"
                            : "rounded-bl-md bg-card text-card-foreground border border-border"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className={`mt-1 flex items-center gap-1 text-[10px] ${
                          msg.sender === "me" ? "justify-end text-accent-foreground/60" : "text-muted-foreground"
                        }`}>
                          {msg.time}
                          {msg.sender === "me" && (
                            msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-card p-3">
                <div className="flex items-center gap-2">
                  <button className="text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    size="icon"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Send className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">Your Messages</h3>
                <p className="mt-1 text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
