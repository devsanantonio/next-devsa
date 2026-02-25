"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { MessageThread } from "@/components/jobs/message-thread"
import {
  Loader2,
  MessageSquare,
  Search,
  User,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  participantImages: Record<string, string>
  lastMessage: string
  lastMessageAt: string
  unreadCount?: number
}

interface Message {
  id: string
  conversationId: string
  senderUid: string
  senderName: string
  senderImage?: string
  content: string
  createdAt: string
  readAt?: string
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Handle starting a new conversation from query params
  const startWith = searchParams.get("startWith")

  useEffect(() => {
    if (!authLoading && !user) router.push("/jobs/signin")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadConversations = async () => {
    try {
      const token = await getIdToken()
      if (!token) return

      // First get the user uid
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })
      const verifyData = await verifyRes.json()
      if (verifyData.hasProfile) {
        setCurrentUserUid(verifyData.profile.uid)
      }

      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setConversations(data.conversations || [])

      // If startWith param, check if conversation exists or auto-select
      if (startWith && data.conversations) {
        const existing = data.conversations.find((c: Conversation) =>
          c.participants.includes(startWith)
        )
        if (existing) {
          setSelectedConversation(existing.id)
          setMobileShowThread(true)
          loadMessages(existing.id)
        } else {
          // New conversation — show thread panel on mobile
          setMobileShowThread(true)
        }
      }
    } catch {
      console.error("Failed to load conversations")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {
      console.error("Failed to load messages")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // On mobile, track whether we're viewing a thread or the list
  const [mobileShowThread, setMobileShowThread] = useState(false)

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id)
    setMobileShowThread(true)
    loadMessages(id)
  }

  const handleMobileBack = () => {
    setMobileShowThread(false)
    setSelectedConversation(null)
  }

  const handleSendMessage = async (content: string) => {
    if (!currentUserUid) return
    const token = await getIdToken()

    // If new conversation via startWith
    if (startWith && !selectedConversation) {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientUid: startWith,
          content,
        }),
      })
      const data = await res.json()
      if (data.success && data.conversationId) {
        setSelectedConversation(data.conversationId)
        await loadConversations()
        await loadMessages(data.conversationId)
      }
      return
    }

    if (!selectedConversation) return

    // Find other participant
    const conv = conversations.find((c) => c.id === selectedConversation)
    const recipientUid = conv?.participants.find((p) => p !== currentUserUid)

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId: selectedConversation,
        recipientUid,
        content,
      }),
    })

    if (res.ok) {
      await loadMessages(selectedConversation)
      // Refresh conversation list to update last message
      await loadConversations()
    }
  }

  const getOtherParticipantName = (conv: Conversation) => {
    if (!currentUserUid) return "Unknown"
    const otherUid = conv.participants.find((p) => p !== currentUserUid)
    return otherUid ? conv.participantNames[otherUid] || "Unknown" : "Unknown"
  }

  const getOtherParticipantImage = (conv: Conversation) => {
    if (!currentUserUid) return undefined
    const otherUid = conv.participants.find((p) => p !== currentUserUid)
    return otherUid ? conv.participantImages[otherUid] : undefined
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const d = new Date(date)
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "now"
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    return d.toLocaleDateString()
  }

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true
    const name = getOtherParticipantName(c).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-white pt-6">

      <main className="mx-auto max-w-6xl px-5 sm:px-6 py-8">
        <Link
          href="/jobs/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100dvh-200px)]">
          {/* Conversation List — hidden on mobile when viewing a thread */}
          <div className={`md:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col ${mobileShowThread ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No conversations yet</p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 border-b border-slate-100 text-left hover:bg-slate-50 transition-colors ${
                      selectedConversation === conv.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                        {getOtherParticipantImage(conv) ? (
                          <img
                            src={getOtherParticipantImage(conv)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {getOtherParticipantName(conv)}
                          </p>
                          <span className="text-xs text-slate-400 shrink-0">
                            {timeAgo(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread — hidden on mobile when viewing conversation list */}
          <div className={`md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col ${mobileShowThread ? "flex" : "hidden md:flex"}`}>
            {selectedConversation || (startWith && !selectedConversation) ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                  <button
                    onClick={handleMobileBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Conversations
                  </button>
                  {selectedConversation && (() => {
                    const conv = conversations.find((c) => c.id === selectedConversation)
                    return conv ? (
                      <span className="ml-auto text-sm font-semibold text-slate-900 truncate">
                        {getOtherParticipantName(conv)}
                      </span>
                    ) : null
                  })()}
                </div>
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center flex-1">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <MessageThread
                    messages={messages}
                    currentUserUid={currentUserUid || ""}
                    onSendMessage={handleSendMessage}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-8">
                <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a conversation</h3>
                <p className="text-sm text-slate-500 text-center">
                  Choose a conversation from the list or start one from a job listing.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
