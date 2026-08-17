"use client"

import { useCallback, useState } from "react"

/**
 * Reorderable lists via the native HTML5 drag-and-drop API — no library.
 *
 * Shared by the admin's communities list and its partners grid, which have
 * different markup but identical behaviour. The hook owns the drag state and
 * hands back prop bundles; the lists decide what a row looks like.
 *
 * ## Keyboard
 *
 * HTML5 drag events fire for a pointer and nothing else, so a drag-only list is
 * unusable without a mouse. The handle is therefore a real button that also
 * takes ArrowUp/ArrowDown, moving its row one position per press. That is the
 * whole accessibility story here and it is deliberately simple — the
 * alternative, a full ARIA grab-and-drop pattern, is a great deal of
 * machinery for an admin screen with two lists on it.
 */
export interface DragOrderResult<T> {
  /** The list as currently arranged, including any in-flight drag preview. */
  items: T[]
  /** Id being dragged, for styling the lifted row. */
  draggingId: string | null
  /** Id currently under the pointer, for the drop indicator. */
  overId: string | null
  /** True between the first move and a successful save. */
  isSaving: boolean
  /** Spread onto the row container. */
  getRowProps: (id: string) => {
    draggable: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDragEnd: () => void
    onDrop: (e: React.DragEvent) => void
  }
  /** Spread onto the grab handle. */
  getHandleProps: (id: string) => {
    "aria-label": string
    onKeyDown: (e: React.KeyboardEvent) => void
  }
}

export function useDragOrder<T extends { id: string; name?: string }>(
  items: T[],
  onPersist: (orderedIds: string[]) => Promise<void>
): DragOrderResult<T> {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  /**
   * A local arrangement that overrides `items` while one is in flight.
   *
   * Without it the list snaps back to the server's order between the drop and
   * the refetch, so every reorder flickers through the old arrangement. Cleared
   * once the parent's `items` reflect the change.
   */
  const [override, setOverride] = useState<T[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const current = override ?? items

  const commit = useCallback(
    async (next: T[]) => {
      setOverride(next)
      setIsSaving(true)
      try {
        await onPersist(next.map((i) => i.id))
      } finally {
        setIsSaving(false)
        // Hand control back to the parent's data. If the save failed the
        // refetch restores the server's order, which is the honest outcome —
        // better than leaving the screen showing an arrangement nobody stored.
        setOverride(null)
      }
    },
    [onPersist]
  )

  const move = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return
      const from = current.findIndex((i) => i.id === fromId)
      const to = current.findIndex((i) => i.id === toId)
      if (from < 0 || to < 0) return
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      void commit(next)
    },
    [current, commit]
  )

  const getRowProps = useCallback(
    (id: string) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDraggingId(id)
        // Firefox refuses to start a drag unless data is set on the transfer.
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", id)
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
        setOverId(id)
      },
      // Without preventDefault on dragover the element is not a valid drop
      // target and the drop event never fires at all.
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      },
      onDragEnd: () => {
        setDraggingId(null)
        setOverId(null)
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        const fromId = e.dataTransfer.getData("text/plain") || draggingId
        setDraggingId(null)
        setOverId(null)
        if (fromId) move(fromId, id)
      },
    }),
    [draggingId, move]
  )

  const getHandleProps = useCallback(
    (id: string) => {
      const index = current.findIndex((i) => i.id === id)
      const label = current[index]?.name || id
      return {
        "aria-label": `Reorder ${label}. Position ${index + 1} of ${current.length}. Use arrow keys to move.`,
        onKeyDown: (e: React.KeyboardEvent) => {
          const delta = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0
          if (!delta) return
          const target = index + delta
          if (target < 0 || target >= current.length) return
          e.preventDefault()
          const next = [...current]
          const [moved] = next.splice(index, 1)
          next.splice(target, 0, moved)
          void commit(next)
        },
      }
    },
    [current, commit]
  )

  return { items: current, draggingId, overId, isSaving, getRowProps, getHandleProps }
}
