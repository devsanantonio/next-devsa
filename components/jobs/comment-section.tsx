"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { User, Trash2, MessageSquare } from "lucide-react"

interface Comment {
  id: string
  jobId: string
  authorUid: string
  authorName: string
  authorImage?: string
  authorRole: "hiring" | "open-to-work"
  content: string
  mentions: string[]
  parentCommentId?: string
  createdAt: string
}

interface CommentSectionProps {
  jobId: string
  comments: Comment[]
  onAddComment: (content: string, mentions: string[]) => Promise<void>
  onDeleteComment: (commentId: string) => Promise<void>
  currentUserUid?: string
}

export function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  currentUserUid,
}: CommentSectionProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const content = newComment.trim()
    if (!content || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Extract @mentions (simple pattern: @name)
      const mentionPattern = /@(\w+)/g
      const mentions: string[] = []
      let match
      while ((match = mentionPattern.exec(content)) !== null) {
        mentions.push(match[1])
      }

      await onAddComment(content, mentions)
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(date).toLocaleDateString()
  }

  // Separate top-level and reply comments
  const topLevel = comments.filter(c => !c.parentCommentId)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#ef426f]" />
        Discussion ({comments.length})
      </h3>

      {/* Comment Input */}
      {user ? (
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share an update, ask a question, or use @name to tag someone..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d93a60] disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            <a href="/jobs/signin" className="text-[#ef426f] hover:underline">Sign in</a> to join the discussion
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevel.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          topLevel.map((comment) => {
            const replies = comments.filter(c => c.parentCommentId === comment.id)
            return (
              <div key={comment.id} id={`comment-${comment.id}`} className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden">
                      {comment.authorImage ? (
                        <img src={comment.authorImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{comment.authorName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          comment.authorRole === "hiring"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}>
                          {comment.authorRole === "hiring" ? "Hiring" : "Open to Work"}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    {currentUserUid === comment.authorUid && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} id={`comment-${reply.id}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 overflow-hidden">
                            {reply.authorImage ? (
                              <img src={reply.authorImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">{reply.authorName}</span>
                              <span className="text-xs text-slate-400">{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{reply.content}</p>
                          </div>
                          {currentUserUid === reply.authorUid && (
                            <button
                              onClick={() => onDeleteComment(reply.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
