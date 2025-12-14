"use client";

import { Button } from "@/components/ui/button";
import { AgentDetails } from "@/lib/types";
import { RefreshCwIcon, Send, Bot, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/variants";

type Props = {
  GenerateAgentToolConfig: () => void;
  loading: boolean;
  agentDetail: AgentDetails;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatUi({
  GenerateAgentToolConfig,
  loading,
  agentDetail,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome! I'm ${agentDetail?.name || "your AI agent"}. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!agentDetail?.agentToolConfig) {
      toast.error("Please generate agent tool configuration first.");
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/agent-chat", {
        input: userMessage.content,
        agentToolConfig: agentDetail.agentToolConfig,
        conversationId: conversationId,
      });

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response.data.response || "I apologize, but I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationId(response.data.conversationId || conversationId);
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: `Error: ${axiosError.response?.data?.error || axiosError.message || "Failed to get response"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-background/50 backdrop-blur-sm"
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-md rounded-lg pointer-events-none" />
            <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{agentDetail?.name}</h2>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={GenerateAgentToolConfig}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2 border-border/50 hover:bg-muted/50"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${
                  message.role === "user" 
                    ? "bg-primary/20 border border-primary/30" 
                    : "bg-muted/50 border border-border/50"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-muted/50 border border-border/50 text-foreground rounded-tl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <span className={`text-[10px] mt-1.5 block ${
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-muted/50 border border-border/50">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-md bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        variants={itemVariants}
        className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="flex items-end gap-2 p-2 rounded-xl bg-muted/30 border border-border/50 focus-within:border-primary/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send)"
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none min-h-[36px] max-h-[120px] placeholder:text-muted-foreground/60"
            rows={1}
            disabled={isLoading}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-9 w-9 rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Press Shift+Enter for new line
        </p>
      </motion.div>
    </motion.div>
  );
}