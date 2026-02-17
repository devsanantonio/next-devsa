"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bold, List, Link as LinkIcon, X } from "lucide-react"

interface RichTextEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  className?: string
  darkMode?: boolean
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Enter description...",
  rows = 5,
  required = false,
  className = "",
  darkMode = true,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const updateToolbarPosition = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    if (start === end || !selectedText.trim()) {
      setShowToolbar(false)
      setShowLinkInput(false)
      return
    }

    setSelection({ start, end, text: selectedText })

    // Get textarea position
    const textareaRect = textarea.getBoundingClientRect()
    
    // Calculate approximate position based on character position
    // This is a simplified approach - for production, you might want to use a library
    const textBeforeSelection = value.substring(0, start)
    const lines = textBeforeSelection.split('\n')
    const lineHeight = 24 // Approximate line height
    const charWidth = 8 // Approximate character width
    
    const lineNumber = lines.length - 1
    const charInLine = lines[lines.length - 1].length
    
    // Position toolbar above the selection
    const top = Math.min(lineNumber * lineHeight, textarea.scrollHeight - textarea.scrollTop) - 10
    const left = Math.min(charInLine * charWidth, textareaRect.width / 2)

    setToolbarPosition({
      top: Math.max(0, top - 45),
      left: Math.max(50, Math.min(left, textareaRect.width - 150)),
    })
    setShowToolbar(true)
  }, [value])

  const handleSelect = useCallback(() => {
    // Small delay to ensure selection is complete
    setTimeout(updateToolbarPosition, 10)
  }, [updateToolbarPosition])

  const handleMouseUp = useCallback(() => {
    setTimeout(updateToolbarPosition, 10)
  }, [updateToolbarPosition])

  // Handle click outside to close toolbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowToolbar(false)
        setShowLinkInput(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyFormatting = (format: 'bold' | 'bullet' | 'link', url?: string) => {
    if (!selection || !textareaRef.current) return

    const { start, end, text } = selection
    let newText = ''
    let newValue = ''

    switch (format) {
      case 'bold':
        newText = `**${text}**`
        newValue = value.substring(0, start) + newText + value.substring(end)
        break
      case 'bullet':
        // Add bullet points to each line
        const lines = text.split('\n')
        newText = lines.map(line => `- ${line}`).join('\n')
        newValue = value.substring(0, start) + newText + value.substring(end)
        break
      case 'link':
        if (url) {
          newText = `[${text}](${url})`
          newValue = value.substring(0, start) + newText + value.substring(end)
        }
        break
    }

    if (newValue) {
      onChange(newValue)
      setShowToolbar(false)
      setShowLinkInput(false)
      setLinkUrl("")

      // Restore focus and set cursor position after the inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newCursorPos = start + newText.length
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    }
  }

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      applyFormatting('link', linkUrl.trim())
    }
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleLinkSubmit()
    }
  }

  const baseInputClass = darkMode
    ? "w-full rounded-xl border border-gray-700 bg-gray-800 py-3 px-4 text-sm text-white placeholder:text-gray-500 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-y min-h-[200px] leading-relaxed"
    : "w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/20 resize-y min-h-[200px] leading-relaxed"

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        id={id}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onMouseUp={handleMouseUp}
        onKeyUp={handleSelect}
        placeholder={placeholder}
        className={`${baseInputClass} ${className}`}
      />

      {/* Floating Toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute z-50 flex items-center gap-1 p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 shadow-xl"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {showLinkInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="https://..."
                className="w-48 px-2 py-1 text-sm rounded bg-neutral-800 border border-neutral-600 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#ef426f]"
              />
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="p-1.5 rounded hover:bg-neutral-700 text-green-400 transition-colors"
                title="Apply link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false)
                  setLinkUrl("")
                }}
                className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 transition-colors"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => applyFormatting('bold')}
                className="p-1.5 rounded hover:bg-neutral-700 text-neutral-200 transition-colors"
                title="Bold (**text**)"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('bullet')}
                className="p-1.5 rounded hover:bg-neutral-700 text-neutral-200 transition-colors"
                title="Bullet list (- item)"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowLinkInput(true)}
                className="p-1.5 rounded hover:bg-neutral-700 text-neutral-200 transition-colors"
                title="Add link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        Select text to format: <span className="font-medium">Bold</span>, <span className="font-medium">Bullets</span>, or <span className="font-medium">Links</span>
      </p>
    </div>
  )
}
