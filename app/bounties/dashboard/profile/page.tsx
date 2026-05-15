"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Loader2,
  Save,
  Plus,
  X,
  Upload,
  Trash2,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Globe,
  User,
  ArrowLeft,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  Heart,
  Code,
  Users,
  Award,
  FileText,
  Target,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface WorkHistory {
  company: string
  title: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  institution: string
  degree: string
  field: string
  year: string
}

interface ProjectSpotlight {
  title: string
  description: string
  url?: string
  imageUrl?: string
  videoUrl?: string
}

interface Certification {
  name: string
  issuer: string
  year: string
}

interface JobPreferences {
  desiredTitle: string
  desiredTypes: string[]
  desiredLocations: string[]
  desiredSalary: string
  openToRelocation: boolean
}

interface Profile {
  uid: string
  email: string
  role: "hiring" | "open-to-work"
  displayName: string
  firstName: string
  lastName: string
  profileImage: string
  phone: string
  bio: string
  companyName: string
  companyLogo: string
  companyDescription: string
  companySize: string
  industry: string
  companyLocation: string
  foundedYear: string
  benefits: string[]
  techStack: string[]
  workHistory: WorkHistory[]
  education: Education[]
  projectSpotlights: ProjectSpotlight[]
  linkedin: string
  github: string
  twitter: string
  website: string
  skills: string[]
  certifications: Certification[]
  resumeUrl: string
  jobPreferences: JobPreferences
}

const emptyWorkHistory: WorkHistory = { company: "", title: "", startDate: "", endDate: "", description: "" }
const emptyEducation: Education = { institution: "", degree: "", field: "", year: "" }
const emptyProject: ProjectSpotlight = { title: "", description: "", url: "", imageUrl: "", videoUrl: "" }
const emptyCertification: Certification = { name: "", issuer: "", year: "" }
const emptyJobPreferences: JobPreferences = { desiredTitle: "", desiredTypes: [], desiredLocations: [], desiredSalary: "", openToRelocation: false }

export default function ProfileEditorPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [uploadingResume, setUploadingResume] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push("/bounties/signin")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    try {
      const token = await getIdToken()
      if (!token) return
      const res = await fetch("/api/job-board/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.profile) {
        setProfile({
          ...data.profile,
          firstName: data.profile.firstName || "",
          lastName: data.profile.lastName || "",
          phone: data.profile.phone || "",
          bio: data.profile.bio || "",
          companyName: data.profile.companyName || "",
          companyLogo: data.profile.companyLogo || "",
          companyDescription: data.profile.companyDescription || "",
          companySize: data.profile.companySize || "",
          industry: data.profile.industry || "",
          companyLocation: data.profile.companyLocation || "",
          foundedYear: data.profile.foundedYear || "",
          benefits: data.profile.benefits || [],
          techStack: data.profile.techStack || [],
          profileImage: data.profile.profileImage || "",
          workHistory: data.profile.workHistory || [],
          education: data.profile.education || [],
          projectSpotlights: data.profile.projectSpotlights || [],
          linkedin: data.profile.linkedin || data.profile.socialLinks?.linkedin || "",
          github: data.profile.github || data.profile.socialLinks?.github || "",
          twitter: data.profile.twitter || data.profile.socialLinks?.twitter || "",
          website: data.profile.website || data.profile.socialLinks?.website || "",
          skills: data.profile.skills || [],
          certifications: data.profile.certifications || [],
          resumeUrl: data.profile.resumeUrl || "",
          jobPreferences: data.profile.jobPreferences || { ...emptyJobPreferences },
        })
      }
    } catch {
      console.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    setSaveMessage("")
    try {
      const token = await getIdToken()
      const res = await fetch("/api/job-board/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (data.success) {
        router.push("/bounties/dashboard")
        return
      } else {
        setSaveMessage("Failed to save profile")
      }
    } catch {
      setSaveMessage("Error saving profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (field: string, file: File, index?: number) => {
    setUploadingField(field)
    try {
      const token = await getIdToken()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", field === "companyLogo" ? "company" : field === "profileImage" ? "profile" : "project")

      const res = await fetch("/api/job-board/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url && profile) {
        if (field === "profileImage") {
          setProfile({ ...profile, profileImage: data.url })
        } else if (field === "companyLogo") {
          setProfile({ ...profile, companyLogo: data.url })
        } else if (field === "projectImage" && index !== undefined) {
          const updated = [...profile.projectSpotlights]
          updated[index] = { ...updated[index], imageUrl: data.url }
          setProfile({ ...profile, projectSpotlights: updated })
        }
      }
    } catch {
      console.error("Upload failed")
    } finally {
      setUploadingField(null)
    }
  }

  const updateField = (field: keyof Profile, value: string) => {
    if (profile) setProfile({ ...profile, [field]: value })
  }

  const updateSocial = (key: string, value: string) => {
    if (profile) setProfile({ ...profile, [key]: value })
  }

  const addWorkHistory = () => {
    if (profile) setProfile({ ...profile, workHistory: [...profile.workHistory, { ...emptyWorkHistory }] })
  }

  const updateWorkHistory = (i: number, field: keyof WorkHistory, value: string) => {
    if (!profile) return
    const updated = [...profile.workHistory]
    updated[i] = { ...updated[i], [field]: value }
    setProfile({ ...profile, workHistory: updated })
  }

  const removeWorkHistory = (i: number) => {
    if (!profile) return
    setProfile({ ...profile, workHistory: profile.workHistory.filter((_, idx) => idx !== i) })
  }

  const addEducation = () => {
    if (profile) setProfile({ ...profile, education: [...profile.education, { ...emptyEducation }] })
  }

  const updateEducation = (i: number, field: keyof Education, value: string) => {
    if (!profile) return
    const updated = [...profile.education]
    updated[i] = { ...updated[i], [field]: value }
    setProfile({ ...profile, education: updated })
  }

  const removeEducation = (i: number) => {
    if (!profile) return
    setProfile({ ...profile, education: profile.education.filter((_, idx) => idx !== i) })
  }

  const addProject = () => {
    if (profile) setProfile({ ...profile, projectSpotlights: [...profile.projectSpotlights, { ...emptyProject }] })
  }

  const updateProject = (i: number, field: keyof ProjectSpotlight, value: string) => {
    if (!profile) return
    const updated = [...profile.projectSpotlights]
    updated[i] = { ...updated[i], [field]: value }
    setProfile({ ...profile, projectSpotlights: updated })
  }

  const removeProject = (i: number) => {
    if (!profile) return
    setProfile({ ...profile, projectSpotlights: profile.projectSpotlights.filter((_, idx) => idx !== i) })
  }

  const addCertification = () => {
    if (profile) setProfile({ ...profile, certifications: [...profile.certifications, { ...emptyCertification }] })
  }

  const updateCertification = (i: number, field: keyof Certification, value: string) => {
    if (!profile) return
    const updated = [...profile.certifications]
    updated[i] = { ...updated[i], [field]: value }
    setProfile({ ...profile, certifications: updated })
  }

  const removeCertification = (i: number) => {
    if (!profile) return
    setProfile({ ...profile, certifications: profile.certifications.filter((_, idx) => idx !== i) })
  }

  const updateJobPreference = (field: keyof JobPreferences, value: string | string[] | boolean) => {
    if (!profile) return
    setProfile({ ...profile, jobPreferences: { ...profile.jobPreferences, [field]: value } })
  }

  const handleResumeUpload = async (file: File) => {
    setUploadingResume(true)
    try {
      const token = await getIdToken()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "resume")

      const res = await fetch("/api/job-board/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url && profile) {
        setProfile({ ...profile, resumeUrl: data.url })
      }
    } catch {
      console.error("Resume upload failed")
    } finally {
      setUploadingResume(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-dvh bg-white">

      <main className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12 md:pt-20 lg:pt-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:pt-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">Edit Profile</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1.5 leading-relaxed">
              {profile.role === "hiring" ? "Company profile visible to candidates" : "Your profile visible to hiring managers"}
            </p>
          </div>
        </div>

        {saveMessage && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            saveMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {saveMessage.includes("success") && <CheckCircle className="h-4 w-4 shrink-0" />}
            {saveMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* === Hiring Manager: single compact contact card instead of separate photo + personal sections === */}
          {profile.role === "hiring" ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Your Contact Details</h2>
              </div>
              <p className="text-sm text-slate-500 mb-5">Candidates see this when viewing your job listings.</p>
              <div className="flex items-center gap-5 mb-5">
                <div className="relative shrink-0 group">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Image src="/devsa-gradient.svg" alt="Default avatar" width={64} height={64} className="h-full w-full object-cover" />
                    )}
                  </div>
                  {uploadingField === "profileImage" ? (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <label className="flex items-center justify-center h-7 w-7 rounded-full bg-white/90 hover:bg-white cursor-pointer transition-colors" title={profile.profileImage ? "Replace photo" : "Add photo"}>
                        <Upload className="h-3.5 w-3.5 text-slate-700" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload("profileImage", file) }} />
                      </label>
                      {profile.profileImage && (
                        <button onClick={() => setProfile({ ...profile, profileImage: "" })} className="flex items-center justify-center h-7 w-7 rounded-full bg-white/90 hover:bg-white transition-colors" title="Remove photo">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                      <input
                        value={profile.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                      <input
                        value={profile.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Display Name</label>
                  <input
                    value={profile.displayName}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(210) 555-0000"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    rows={3}
                    placeholder="Your title / role at the company (e.g. Engineering Manager, Recruiter)..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                  />
                </div>
              </div>
            </section>
          ) : (
            <>
          {/* Compact Contact Card (matching the hiring manager pattern) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">About You</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">This is your personal info used when applying to jobs.</p>
            <div className="flex items-center gap-5 mb-5">
              <div className="relative shrink-0 group">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Image src="/devsa-gradient.svg" alt="Default avatar" width={64} height={64} className="h-full w-full object-cover" />
                  )}
                </div>
                {uploadingField === "profileImage" ? (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <label className="flex items-center justify-center h-7 w-7 rounded-full bg-white/90 hover:bg-white cursor-pointer transition-colors" title={profile.profileImage ? "Replace photo" : "Add photo"}>
                      <Upload className="h-3.5 w-3.5 text-slate-700" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload("profileImage", file) }} />
                    </label>
                    {profile.profileImage && (
                      <button onClick={() => setProfile({ ...profile, profileImage: "" })} className="flex items-center justify-center h-7 w-7 rounded-full bg-white/90 hover:bg-white transition-colors" title="Remove photo">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                    <input
                      value={profile.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                    <input
                      value={profile.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Display Name</label>
                <input
                  value={profile.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(210) 555-0000"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Headline</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                  placeholder="e.g. Full-stack developer with 5 years of experience in React & Node.js, passionate about building accessible web apps..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Write a brief summary of your skills and what you&apos;re looking for. This is the first thing hiring managers see.</p>
              </div>
            </div>
          </section>

          {/* Job Preferences */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Job Preferences</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Help us match you with the right opportunities.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Desired Job Title</label>
                <input
                  value={profile.jobPreferences.desiredTitle}
                  onChange={(e) => updateJobPreference("desiredTitle", e.target.value)}
                  placeholder="e.g. Senior Frontend Developer, DevOps Engineer..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "w2", label: "W-2 (Full-time)" },
                    { value: "1099", label: "1099 (Contract)" },
                    { value: "equity", label: "Equity / Co-founder" },
                    { value: "internship", label: "Internship" },
                  ].map((type) => {
                    const isSelected = profile.jobPreferences.desiredTypes.includes(type.value)
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          const current = profile.jobPreferences.desiredTypes
                          updateJobPreference(
                            "desiredTypes",
                            isSelected ? current.filter((t) => t !== type.value) : [...current, type.value]
                          )
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
                          isSelected
                            ? "bg-[#ef426f]/10 text-[#ef426f] border-[#ef426f]/30"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Work Location</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "remote", label: "Remote" },
                    { value: "onsite", label: "On-site" },
                    { value: "hybrid", label: "Hybrid" },
                  ].map((loc) => {
                    const isSelected = profile.jobPreferences.desiredLocations.includes(loc.value)
                    return (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => {
                          const current = profile.jobPreferences.desiredLocations
                          updateJobPreference(
                            "desiredLocations",
                            isSelected ? current.filter((l) => l !== loc.value) : [...current, loc.value]
                          )
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
                          isSelected
                            ? "bg-[#ef426f]/10 text-[#ef426f] border-[#ef426f]/30"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {loc.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Desired Salary Range</label>
                  <input
                    value={profile.jobPreferences.desiredSalary}
                    onChange={(e) => updateJobPreference("desiredSalary", e.target.value)}
                    placeholder="e.g. $80k - $120k"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => updateJobPreference("openToRelocation", !profile.jobPreferences.openToRelocation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.jobPreferences.openToRelocation ? "bg-[#ef426f]" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.jobPreferences.openToRelocation ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <label className="text-sm text-slate-700">Open to relocation</label>
                </div>
              </div>
            </div>
          </section>

          {/* Resume Upload */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Resume</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">Upload your resume so hiring managers can learn more about your experience.</p>
            {profile.resumeUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FileText className="h-8 w-8 text-[#ef426f] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">Resume uploaded</p>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#ef426f] hover:underline truncate block"
                  >
                    View current resume
                  </a>
                </div>
                <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                  {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Replace
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleResumeUpload(file)
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, resumeUrl: "" })}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 cursor-pointer hover:border-[#ef426f]/30 hover:bg-[#ef426f]/5 transition-colors">
                {uploadingResume ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[#ef426f]" />
                ) : (
                  <Upload className="h-8 w-8 text-slate-400" />
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Upload your resume</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleResumeUpload(file)
                  }}
                />
              </label>
            )}
          </section>

          {/* Skills */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Skills</h2>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-4">Add your technical and professional skills. Hiring managers filter candidates by skills.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm text-slate-700 font-medium">
                  {skill}
                  <button
                    type="button"
                    onClick={() => {
                      setProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) })
                    }}
                    className="text-slate-400 hover:text-red-500 ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="skills-input"
                placeholder="e.g. React, TypeScript, Python, AWS, Figma..."
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const input = e.currentTarget
                    const val = input.value.trim()
                    if (val && !profile.skills.includes(val)) {
                      setProfile({ ...profile, skills: [...profile.skills, val] })
                      input.value = ""
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("skills-input") as HTMLInputElement
                  const val = input?.value.trim()
                  if (val && !profile.skills.includes(val)) {
                    setProfile({ ...profile, skills: [...profile.skills, val] })
                    input.value = ""
                  }
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </section>
            </>
          )}

          {/* Company Info (Hiring only) */}
          {profile.role === "hiring" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">Company Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
                      <input
                        value={profile.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                      <select
                        value={profile.industry}
                        onChange={(e) => updateField("industry", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Government">Government</option>
                        <option value="Defense & Cybersecurity">Defense & Cybersecurity</option>
                        <option value="Energy">Energy</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Media & Entertainment">Media & Entertainment</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Nonprofit">Nonprofit</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
                      <select
                        value={profile.companySize}
                        onChange={(e) => updateField("companySize", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1,000 employees</option>
                        <option value="1000+">1,000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Founded Year</label>
                      <input
                        value={profile.foundedYear}
                        onChange={(e) => updateField("foundedYear", e.target.value)}
                        placeholder="e.g. 2018"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      Headquarters Location
                    </label>
                    <input
                      value={profile.companyLocation}
                      onChange={(e) => updateField("companyLocation", e.target.value)}
                      placeholder="e.g. San Antonio, TX"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">About the Company</label>
                    <textarea
                      value={profile.companyDescription}
                      onChange={(e) => updateField("companyDescription", e.target.value)}
                      rows={4}
                      placeholder="Describe your company's mission, culture, and what makes it a great place to work..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {profile.companyLogo && (
                        <img src={profile.companyLogo} alt="Logo" className="h-12 w-12 rounded-lg object-contain bg-slate-100 p-1" />
                      )}
                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                        {uploadingField === "companyLogo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload("companyLogo", file)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Benefits & Perks */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Benefits & Perks</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">Select all benefits your company offers. Candidates look for this.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Health Insurance",
                    "Dental & Vision",
                    "401(k) / Retirement",
                    "Remote Work",
                    "Hybrid Schedule",
                    "Flexible Hours",
                    "Unlimited PTO",
                    "Paid Parental Leave",
                    "Stock Options / Equity",
                    "Professional Development",
                    "Tuition Reimbursement",
                    "Relocation Assistance",
                    "Gym / Wellness",
                    "Free Meals / Snacks",
                    "Company Events",
                    "Home Office Stipend",
                  ].map((benefit) => {
                    const isSelected = profile.benefits.includes(benefit)
                    return (
                      <button
                        key={benefit}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setProfile({ ...profile, benefits: profile.benefits.filter((b) => b !== benefit) })
                          } else {
                            setProfile({ ...profile, benefits: [...profile.benefits, benefit] })
                          }
                        }}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
                          isSelected
                            ? "bg-[#ef426f]/10 text-[#ef426f] border-[#ef426f]/30"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {benefit}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Tech Stack */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-slate-400" />
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Tech Stack</h2>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">What technologies does your team use? Helps developers find the right fit.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.techStack.map((tech, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm text-slate-700 font-medium">
                      {tech}
                      <button
                        type="button"
                        onClick={() => {
                          setProfile({ ...profile, techStack: profile.techStack.filter((_, idx) => idx !== i) })
                        }}
                        className="text-slate-400 hover:text-red-500 ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    id="tech-stack-input"
                    placeholder="e.g. React, Python, AWS..."
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const input = e.currentTarget
                        const val = input.value.trim()
                        if (val && !profile.techStack.includes(val)) {
                          setProfile({ ...profile, techStack: [...profile.techStack, val] })
                          input.value = ""
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("tech-stack-input") as HTMLInputElement
                      const val = input?.value.trim()
                      if (val && !profile.techStack.includes(val)) {
                        setProfile({ ...profile, techStack: [...profile.techStack, val] })
                        input.value = ""
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Social Links */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Social Links</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn</label>
                <input
                  value={profile.linkedin}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub</label>
                <input
                  value={profile.github}
                  onChange={(e) => updateSocial("github", e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Twitter / X</label>
                <input
                  value={profile.twitter}
                  onChange={(e) => updateSocial("twitter", e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                <input
                  value={profile.website}
                  onChange={(e) => updateSocial("website", e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
            </div>
          </section>

          {/* === Job Seeker Sections (open-to-work only) === */}
          {profile.role === "open-to-work" && (
            <>
          {/* Work History */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Work Experience</h2>
              </div>
              <button onClick={addWorkHistory} className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">List your most relevant positions. Start with your current or most recent role.</p>
            {profile.workHistory.length === 0 ? (
              <button
                onClick={addWorkHistory}
                className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 cursor-pointer hover:border-[#ef426f]/30 hover:bg-[#ef426f]/5 transition-colors"
              >
                <Briefcase className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-500">Add your first work experience</span>
                <span className="text-xs text-slate-400">Profiles with experience get 2x more responses</span>
              </button>
            ) : (
              <div className="space-y-4">
                {profile.workHistory.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                    <button
                      onClick={() => removeWorkHistory(i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={item.company}
                        onChange={(e) => updateWorkHistory(i, "company", e.target.value)}
                        placeholder="Company"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.title}
                        onChange={(e) => updateWorkHistory(i, "title", e.target.value)}
                        placeholder="Job Title"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.startDate}
                        onChange={(e) => updateWorkHistory(i, "startDate", e.target.value)}
                        placeholder="Start Date (e.g. Jan 2020)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.endDate}
                        onChange={(e) => updateWorkHistory(i, "endDate", e.target.value)}
                        placeholder="End Date (or Present)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateWorkHistory(i, "description", e.target.value)}
                        placeholder="What did you accomplish? Use bullet points for impact (e.g. Built a REST API serving 10k requests/day)..."
                        rows={2}
                        className="sm:col-span-2 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Education */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Education</h2>
              </div>
              <button onClick={addEducation} className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Include degrees, bootcamps, and relevant certifications programs.</p>
            {profile.education.length === 0 ? (
              <button
                onClick={addEducation}
                className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 cursor-pointer hover:border-[#ef426f]/30 hover:bg-[#ef426f]/5 transition-colors"
              >
                <GraduationCap className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-500">Add your education</span>
              </button>
            ) : (
              <div className="space-y-4">
                {profile.education.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                    <button
                      onClick={() => removeEducation(i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={item.institution}
                        onChange={(e) => updateEducation(i, "institution", e.target.value)}
                        placeholder="Institution (e.g. UTSA, Codeup)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.degree}
                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                        placeholder="Degree (e.g. B.S., Certificate)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.field}
                        onChange={(e) => updateEducation(i, "field", e.target.value)}
                        placeholder="Field of Study"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.year}
                        onChange={(e) => updateEducation(i, "year", e.target.value)}
                        placeholder="Year (e.g. 2022)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Certifications */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Certifications</h2>
              </div>
              <button onClick={addCertification} className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">AWS, Google Cloud, Azure, CompTIA, or any industry certifications you hold.</p>
            {profile.certifications.length === 0 ? (
              <button
                onClick={addCertification}
                className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 cursor-pointer hover:border-[#ef426f]/30 hover:bg-[#ef426f]/5 transition-colors"
              >
                <Award className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-500">Add a certification</span>
              </button>
            ) : (
              <div className="space-y-4">
                {profile.certifications.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                    <button
                      onClick={() => removeCertification(i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        value={item.name}
                        onChange={(e) => updateCertification(i, "name", e.target.value)}
                        placeholder="Certification Name"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.issuer}
                        onChange={(e) => updateCertification(i, "issuer", e.target.value)}
                        placeholder="Issuing Organization"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.year}
                        onChange={(e) => updateCertification(i, "year", e.target.value)}
                        placeholder="Year Earned"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Project Spotlights */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Project Spotlights</h2>
              </div>
              <button onClick={addProject} className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Showcase your best work. Side projects, open source, or anything you&apos;re proud of.</p>
            {profile.projectSpotlights.length === 0 ? (
              <button
                onClick={addProject}
                className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 cursor-pointer hover:border-[#ef426f]/30 hover:bg-[#ef426f]/5 transition-colors"
              >
                <FolderOpen className="h-8 w-8 text-slate-300" />
                <span className="text-sm font-medium text-slate-500">Add a project</span>
                <span className="text-xs text-slate-400">Show hiring managers what you can build</span>
              </button>
            ) : (
              <div className="space-y-4">
                {profile.projectSpotlights.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 relative">
                    <button
                      onClick={() => removeProject(i)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={item.title}
                          onChange={(e) => updateProject(i, "title", e.target.value)}
                          placeholder="Project Title"
                          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                        />
                        <input
                          value={item.url || ""}
                          onChange={(e) => updateProject(i, "url", e.target.value)}
                          placeholder="Project URL"
                          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                        />
                      </div>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateProject(i, "description", e.target.value)}
                        placeholder="What does this project do? What technologies did you use?"
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none"
                      />
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                        )}
                        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer">
                          {uploadingField === "projectImage" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload("projectImage", file, i)
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
            </>
          )}

          {/* Save feedback (bottom, near button) */}
          {saveMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              saveMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {saveMessage.includes("success") && <CheckCircle className="h-4 w-4 shrink-0" />}
              {saveMessage}
            </div>
          )}

          {/* Save Button (bottom) */}
          <div className="flex justify-end pt-4 gap-2">
            <Link
              href="/bounties/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ef426f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d93a60] transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
