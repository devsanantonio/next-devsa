"use client"

import { motion, AnimatePresence } from "motion/react"
import { X, Download, Clock, MapPin } from "lucide-react"
import { useState } from "react"
import { schedule } from "@/data/pysa/sessions"

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "main" | "workshops" | "lightning">("all")

  const exportSchedule = () => {
    const scheduleText = schedule
      .map((item) => `${item.time} - ${item.event}${item.speaker ? ` (${item.speaker})` : ""}`)
      .join("\n")

    const blob = new Blob([scheduleText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pysanantonio-schedule.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredSchedule = schedule.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "main") return item.location === "Main Stage"
    if (activeTab === "workshops") return item.location === "Workshop Room"
    if (activeTab === "lightning") return item.type === "talk" && item.time.includes("4:")
    return true
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-200">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold text-black mb-2">Schedule</h2>
                <p className="text-sm lg:text-base text-gray-600 font-mono">November 8, 2025</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportSchedule}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 md:px-8 pt-6 border-b border-gray-200">
              {[
                { id: "all", label: "All Sessions" },
                { id: "main", label: "Main Stage" },
                { id: "workshops", label: "Workshops" },
                { id: "lightning", label: "Lightning Talks" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 text-sm font-mono font-semibold uppercase transition-colors ${
                    activeTab === tab.id
                      ? "bg-gray-100 text-black border-b-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Schedule Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-4">
                {filteredSchedule.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-6 rounded-xl border-l-4 ${
                      item.type === "talk"
                        ? "bg-white border-blue-500 shadow-sm"
                        : item.type === "break"
                          ? "bg-yellow-50 border-yellow-500"
                          : item.type === "social"
                            ? "bg-blue-50 border-blue-600"
                            : "bg-gray-50 border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-bold text-blue-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </p>
                          {item.location && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.location}
                            </p>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-black mb-1">{item.event}</h3>
                        {item.speaker && <p className="text-sm text-gray-600">Speaker: {item.speaker}</p>}
                      </div>
                      {item.type === "talk" && (
                        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          Talk
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                All times are in Central Time (CT). Schedule subject to change.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
