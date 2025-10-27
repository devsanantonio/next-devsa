"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { partners, type Partner } from "@/data/partners"
import { ArrowRight, ExternalLink, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import * as THREE from "three"

function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.offsetWidth / containerRef.current.offsetHeight,
      0.1,
      1000,
    )
    camera.position.z = 50

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    // Particle system
    const particleCount = 100
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities: number[] = []

    const color = new THREE.Color("#ef426f")

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100
      positions[i + 1] = (Math.random() - 0.5) * 100
      positions[i + 2] = (Math.random() - 0.5) * 50

      velocities.push((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.05)
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: color,
      size: 2,
      transparent: true,
      opacity: 0.6,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    // Lines between particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
    })

    // Animation
    let animationId: number
    const animate = () => {
      const positions = particleSystem.geometry.attributes.position.array as Float32Array

      // Update particle positions
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]

        // Wrap around edges
        if (Math.abs(positions[i]) > 50) velocities[i] *= -1
        if (Math.abs(positions[i + 1]) > 50) velocities[i + 1] *= -1
        if (Math.abs(positions[i + 2]) > 25) velocities[i + 2] *= -1
      }

      particleSystem.geometry.attributes.position.needsUpdate = true

      // Draw lines between close particles
      const lines: THREE.Line[] = []
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3]
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance < 15) {
            const lineGeometry = new THREE.BufferGeometry()
            const linePositions = new Float32Array([
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2],
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2],
            ])
            lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))
            const line = new THREE.Line(lineGeometry, lineMaterial)
            scene.add(line)
            lines.push(line)
          }
        }
      }

      renderer.render(scene, camera)

      // Clean up lines
      lines.forEach((line) => {
        scene.remove(line)
        line.geometry.dispose()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.offsetWidth / containerRef.current.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
      particles.dispose()
      particleMaterial.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none", overflow: "hidden" }}
    />
  )
}

interface PartnerModalProps {
  partner: Partner | null
  isOpen: boolean
  onClose: () => void
}

function PartnerModal({ partner, isOpen, onClose }: PartnerModalProps) {
  if (!partner || !isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md md:max-w-[400px] max-h-[90vh]" style={{ aspectRatio: "4/5" }}>
          <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl flex flex-col overflow-hidden h-full shadow-2xl">
            <div className="relative h-32 md:h-36 bg-slate-900 flex items-center justify-center flex-shrink-0">
              <Image
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                width={120}
                height={120}
                className="h-20 md:h-24 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-800 rounded-full p-1.5 backdrop-blur-sm shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              <h3 className="text-neutral-900 text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {partner.name}
              </h3>
              <p className="text-neutral-700 leading-relaxed text-base">{partner.description}</p>

              <div className="pt-2">
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-[#ef426f] hover:text-[#d63860] transition-colors text-sm font-semibold hover:bg-pink-50 rounded-lg p-2.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export function PartnersSection() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPartner(null)
  }

  const partnersPerRow = 6
  const rows = []
  for (let i = 0; i < partners.length; i += partnersPerRow) {
    rows.push(partners.slice(i, i + partnersPerRow))
  }

  return (
    <>
      <section className="w-full bg-white py-12 md:py-20 relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />

        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-8 mb-8 md:mb-12">
            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-slate-950 tracking-tight text-balance text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] mb-4 md:mb-6 text-left md:text-center">
                Powering the Tech Ecosystem
              </h2>
              <p className="text-slate-700 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-bold text-left md:text-center tracking-tight md:tracking-normal">
                <strong className="text-[#ef426f]">Thanks to Our Partners</strong> we are able to bridge the gap between
                passionate builders and our local partners.
              </p>
            </motion.div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12 md:mb-16">
            <div className="space-y-4 md:space-y-6">
              {rows.map((row, rowIndex) => (
                <motion.div
                  key={rowIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: rowIndex * 0.1 }}
                  className="flex flex-wrap justify-center gap-3 md:gap-4"
                >
                  {row.map((partner, index) => (
                    <motion.button
                      key={partner.id}
                      onClick={() => handlePartnerClick(partner)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (rowIndex * partnersPerRow + index) * 0.03 }}
                      className="group relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center overflow-hidden flex-shrink-0 p-4 cursor-pointer"
                      style={{ pointerEvents: "auto" }}
                    >
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={120}
                        height={120}
                        className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-300 max-w-full max-h-full"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* DevSA Community Space Spotlight - Black CTA Section */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-black rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="inline-block px-4 py-2 bg-white/10 rounded-full mb-6">
                    <span className="text-white text-sm font-medium">Community Space</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    DevSA Community Space
                  </h3>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mb-6">
                    A dedicated coworking space for San Antonio&apos;s tech community. Connect, collaborate, and build the
                    future together.
                  </p>
                  <ul className="space-y-3 text-gray-300 mb-8">
                    <li className="flex items-start">
                      <span className="text-white mr-3">✓</span>
                      <span>High-speed internet and modern workspaces</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3">✓</span>
                      <span>Meeting rooms and event spaces</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-white mr-3">✓</span>
                      <span>Community events and networking opportunities</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link
                  href="/coworking-space"
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Explore the Space
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Modal */}
      <PartnerModal partner={selectedPartner} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  )
}
