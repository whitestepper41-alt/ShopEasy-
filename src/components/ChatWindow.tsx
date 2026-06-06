import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  X, 
  MessageSquare, 
  Store, 
  User, 
  Clock,
  ChevronLeft
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { ChatThread, ChatMessage, UserProfile } from "../types";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeThreadId: string | null;
  onSelectThread: (threadId: string | null) => void;
}

export default function ChatWindow({
  isOpen,
  onClose,
  currentUser,
  activeThreadId,
  onSelectThread,
}: ChatWindowProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch available chat thread channels
  useEffect(() => {
    if (!isOpen) return;

    let q;
    const path = "chats";

    if (currentUser.role === "admin") {
      q = query(collection(db, path), orderBy("updatedAt", "desc"));
    } else if (currentUser.role === "seller") {
      q = query(collection(db, path), where("sellerId", "==", currentUser.uid), orderBy("updatedAt", "desc"));
    } else {
      q = query(collection(db, path), where("buyerId", "==", currentUser.uid), orderBy("updatedAt", "desc"));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const items: ChatThread[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as ChatThread);
      });
      setThreads(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [currentUser, isOpen]);

  // 2. Fetch messages representing the active thread
  useEffect(() => {
    if (!isOpen || !activeThreadId) {
      setMessages([]);
      return;
    }

    const path = `chats/${activeThreadId}/messages`;
    const q = query(
      collection(db, path),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(items);
      // Auto scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsub();
  }, [activeThreadId, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const messageText = inputText.trim();
    setInputText("");

    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread) return;

    try {
      const parentPath = "chats";
      // Update thread timestamp and message snippet
      await setDoc(doc(db, parentPath, activeThreadId), {
        ...activeThread,
        lastMessage: messageText,
        updatedAt: serverTimestamp()
      });

      const messagePath = `chats/${activeThreadId}/messages`;
      // Write message subdocument
      await addDoc(collection(db, messagePath), {
        senderId: currentUser.uid,
        senderName: currentUser.username,
        text: messageText,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeThreadId}/messages`);
    }
  };

  const currentThreadObj = threads.find(t => t.id === activeThreadId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-4 right-4 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[580px] rounded-2xl bg-white shadow-2xl border border-gray-150 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom duration-200" id="chatbox-floating-anchor">
      {/* Header bar */}
      <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeThreadId && (
            <button 
              onClick={() => onSelectThread(null)}
              className="md:hidden text-gray-300 hover:text-white mr-1 p-1 hover:bg-neutral-800 rounded transition"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
          <div>
            <h3 className="text-xs font-black tracking-wide">Live Merchant Messenger</h3>
            {activeThreadId && currentThreadObj && (
              <p className="text-[10px] text-gray-300 truncate max-w-[200px]">
                Talking with {currentUser.role === "buyer" ? currentThreadObj.sellerName : currentThreadObj.buyerName}
              </p>
            )}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main double-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel A: Channel Selector thread list (Hidden on small mobile view when thread active) */}
        <div className={`w-full md:w-36.5 border-r border-gray-100 flex flex-col ${activeThreadId ? "hidden md:flex" : "flex"}`}>
          <div className="bg-gray-50 border-b border-gray-100 p-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">
            Conversations ({threads.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 no-scrollbar">
            {threads.length === 0 ? (
              <p className="text-[10px] text-gray-400 p-4 text-center">No active chats.</p>
            ) : (
              threads.map((t) => {
                const partnerName = currentUser.role === "buyer" ? t.sellerName : t.buyerName;
                const isSelected = t.id === activeThreadId;

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectThread(t.id)}
                      className={`p-3 cursor-pointer text-xs transition-colors hover:bg-neutral-50 ${
                      isSelected ? "bg-indigo-50/70 border-l-4 border-indigo-600 text-indigo-950 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-gray-900 mb-0.5">
                      {currentUser.role === "buyer" ? <Store className="h-3 w-3 text-violet-500" /> : <User className="h-3 w-3 text-blue-500" />}
                      <span className="truncate max-w-[110px]">{partnerName}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1 truncate" title={t.lastMessage}>{t.lastMessage}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel B: Active Chat conversation box */}
        <div className={`flex-1 flex flex-col bg-slate-50 relative ${!activeThreadId ? "hidden md:flex items-center justify-center p-6 text-center text-gray-400" : "flex"}`}>
          {!activeThreadId ? (
            <div className="space-y-2 text-xs font-semibold">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
              <p>Choose an active storefront channel or listing details option to talk.</p>
            </div>
          ) : (
            <>
              {/* Message scroll hub */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
                {messages.length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic text-center py-6">Initiating secure chat tunnel. Send a message to start.</p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUser.uid;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end ml-auto" : "self-start items-start mr-auto"}`}
                      >
                        <span className="text-[9px] text-gray-400 font-bold mb-0.5">{m.senderName}</span>
                        <div className={`p-2.5 rounded-2xl text-xs leading-relaxed font-medium ${
                          isMe 
                            ? "bg-indigo-600 text-white rounded-br-none" 
                            : "bg-white text-gray-800 border border-gray-150 rounded-bl-none shadow-xs"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message composer */}
              <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-150 p-2.5 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about discount, stock..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 rounded-xl"
                  id="chat-send-input"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-2.5 rounded-xl shadow transition"
                  id="chat-send-btn"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
