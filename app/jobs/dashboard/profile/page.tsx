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
  Camera,
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
} from "lucide-react"
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
}

const emptyWorkHistory: WorkHistory = { company: "", title: "", startDate: "", endDate: "", description: "" }
const emptyEducation: Education = { institution: "", degree: "", field: "", year: "" }
const emptyProject: ProjectSpotlight = { title: "", description: "", url: "", imageUrl: "", videoUrl: "" }

export default function ProfileEditorPage() {
  const router = useRouter()
  const { user, getIdToken, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push("/jobs/signin")
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
        setSaveMessage("Profile saved successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
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

      <main className="mx-auto max-w-3xl px-5 sm:px-6 py-8 sm:py-12 mt-6">
        <Link
          href="/jobs/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6 sm:mb-8">
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
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-7 w-7 text-slate-400" />
                    )}
                  </div>
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
                <label className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
                  {uploadingField === "profileImage" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload("profileImage", file)
                    }}
                  />
                </label>
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
          {/* Profile Image */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Profile Photo</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
              </div>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                {uploadingField === "profileImage" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload("profileImage", file)
                  }}
                />
              </label>
            </div>
          </section>

          {/* Personal Info */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                <input
                  value={profile.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                <input
                  value={profile.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
                <input
                  value={profile.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(210) 555-0000"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  placeholder={profile.role === "hiring" ? "Tell candidates about yourself and your role at the company..." : "Tell hiring managers about yourself..."}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 shadow-sm resize-none"
                />
              </div>
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
            {profile.projectSpotlights.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No projects added yet</p>
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
                          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                        />
                        <input
                          value={item.url || ""}
                          onChange={(e) => updateProject(i, "url", e.target.value)}
                          placeholder="Project URL"
                          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                        />
                      </div>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateProject(i, "description", e.target.value)}
                        placeholder="Project description..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none"
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

          {/* Work History */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Work History</h2>
              </div>
              <button onClick={addWorkHistory} className="inline-flex items-center gap-1 text-sm text-[#ef426f] hover:underline">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {profile.workHistory.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No work history added yet</p>
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
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.title}
                        onChange={(e) => updateWorkHistory(i, "title", e.target.value)}
                        placeholder="Job Title"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.startDate}
                        onChange={(e) => updateWorkHistory(i, "startDate", e.target.value)}
                        placeholder="Start Date (e.g. Jan 2020)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.endDate}
                        onChange={(e) => updateWorkHistory(i, "endDate", e.target.value)}
                        placeholder="End Date (or Present)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updateWorkHistory(i, "description", e.target.value)}
                        placeholder="Description..."
                        rows={2}
                        className="sm:col-span-2 rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10 resize-none"
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
            {profile.education.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No education added yet</p>
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
                        placeholder="Institution"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.degree}
                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                        placeholder="Degree (e.g. B.S.)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.field}
                        onChange={(e) => updateEducation(i, "field", e.target.value)}
                        placeholder="Field of Study"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                      <input
                        value={item.year}
                        onChange={(e) => updateEducation(i, "year", e.target.value)}
                        placeholder="Year (e.g. 2022)"
                        className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#ef426f] focus:outline-none focus:ring-2 focus:ring-[#ef426f]/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
            </>
          )}

          {/* Save Button (bottom) */}
          <div className="flex justify-end pt-4 gap-2">
            <Link
              href="/jobs/dashboard"
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
