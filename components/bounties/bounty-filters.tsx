"use client"

import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react"

interface BountyFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedAmount: string
  onAmountChange: (value: string) => void
  selectedDatePosted: string
  onDatePostedChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  resultCount: number
}

export function BountyFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedAmount,
  onAmountChange,
  selectedDatePosted,
  onDatePostedChange,
  sortBy,
  onSortChange,
  resultCount,
}: BountyFiltersProps) {
  const hasFilters =
    !!searchQuery ||
    selectedCategory !== "all" ||
    selectedAmount !== "all" ||
    selectedDatePosted !== "all"

  const clearFilters = () => {
    onSearchChange("")
    onCategoryChange("all")
    onAmountChange("all")
    onDatePostedChange("all")
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search bounties by title, org, or tag..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 leading-normal font-normal"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-400 font-medium leading-normal">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex-1 sm:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-[13px] text-gray-700 focus:border-gray-400 focus:outline-none leading-normal font-normal min-w-0"
        >
          <option value="all">All Categories</option>
          <option value="website">Website</option>
          <option value="integration">Integration</option>
          <option value="automation">Automation</option>
          <option value="data">Data</option>
          <option value="design">Design</option>
          <option value="ai">AI</option>
          <option value="accessibility">Accessibility</option>
          <option value="devops">DevOps</option>
          <option value="mobile">Mobile</option>
          <option value="other">Other</option>
        </select>

        <select
          value={selectedAmount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1 sm:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-[13px] text-gray-700 focus:border-gray-400 focus:outline-none leading-normal font-normal min-w-0"
        >
          <option value="all">Any Amount</option>
          <option value="under-250">Under $250</option>
          <option value="250-500">$250–$500</option>
          <option value="500-1000">$500–$1,000</option>
          <option value="1000-2500">$1,000–$2,500</option>
          <option value="over-2500">Over $2,500</option>
        </select>

        <select
          value={selectedDatePosted}
          onChange={(e) => onDatePostedChange(e.target.value)}
          className="flex-1 sm:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2 sm:py-1.5 text-sm sm:text-[13px] text-gray-700 focus:border-gray-400 focus:outline-none leading-normal font-normal min-w-0"
        >
          <option value="all">Any Time</option>
          <option value="1">Last 24 hours</option>
          <option value="3">Last 3 days</option>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium leading-normal"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Result count + sort */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-sm text-gray-500 font-medium leading-normal">
          {resultCount} {resultCount === 1 ? "bounty" : "bounties"} found
        </p>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border-0 bg-transparent py-0 pr-6 pl-0 text-[13px] text-gray-600 font-medium focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Amount (high to low)</option>
            <option value="amount-low">Amount (low to high)</option>
            <option value="deadline">Deadline (soonest first)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
