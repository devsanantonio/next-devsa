"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User } from "lucide-react"

interface MessageItem {
  id: string
  senderUid: string
  senderName: string
  senderImage?: string
  content: string
  createdAt: string
  readAt?: string
}

interface MessageThreadProps {
  messages: MessageItem[]
  currentUserUid: string
  onSendMessage: (content: string) => Promise<void>
  isLoading?: boolean
}

export function MessageThread({
  messages,
  currentUserUid,
  onSendMessage,
  isLoading,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const content = newMessage.trim()
    if (!content || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(content)
      setNewMessage("")
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return "Today"
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageItem[] }[] = []
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt)
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup?.date === date) {
      lastGroup.messages.push(msg)
    } else {
      groupedMessages.push({ date, messages: [msg] })
    }
  })

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#ef426f]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">{group.date}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isOwn = msg.senderUid === currentUserUid
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                        {msg.senderImage ? (
                          <img src={msg.senderImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                        <div
                          className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                            isOwn
                              ? "bg-[#ef426f] text-white rounded-br-md"
                              : "bg-slate-100 text-slate-900 rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ef426f] text-white hover:bg-[#d93a60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
