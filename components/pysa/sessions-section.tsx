"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { featuredSessions } from "@/data/pysa/sessions"

export default function SessionsSection() {
  return (
    <section className="relative bg-black text-white" data-testid="pysa-homepage-container-sessions" id="sessions">
      <div className="flex flex-col gap-10 p-6 md:p-16 lg:p-20 container mx-auto">
        {/* Section Title */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <p className="font-sans text-white leading-tight text-2xl lg:text-4xl xl:text-6xl font-semibold uppercase tracking-tight">
            Sessions
          </p>
          <p className="hidden text-gray-300 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl">
            Join us for compelling talks from industry leaders and community lightning presentations
          </p>
        </motion.header>


        {/* Main Talks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="font-sans text-white text-lg md:text-xl lg:text-2xl font-semibold mb-8 uppercase tracking-tight">
            Main Talks
          </h3>
          <div className="flex flex-col">
            {featuredSessions.filter(session => session.category === "MAIN TALK").map((session, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 first:border-0 last:border-b py-8 lg:py-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                  {/* Content Area */}
                  <div className="flex flex-col gap-4 md:gap-6">
                    {/* Title */}
                    <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                      {session.title}
                    </p>

                    {/* Speaker Info */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                          <Image
                            alt={session.speaker}
                            src={session.speakerImage}
                            fill
                            className="rounded-full object-cover w-full h-full grayscale"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                            {session.speaker}
                          </div>
                          {session.speaker === "Paul Bailey" && (
                            <div className="text-xs text-gray-400 font-mono uppercase">
                              Principal Engineer, Clarity
                            </div>
                          )}
                          {session.speaker === "Joel Grus" && (
                            <div className="text-xs text-gray-400 font-mono uppercase">
                              Principal Engineer/AI Tech Leader, Capital Group
                            </div>
                          )}
                          {session.speaker === "Cody Fincher" && (
                            <div className="text-xs text-gray-400 font-mono uppercase">
                              Staff Technical Solutions Consultant, Google
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                        {session.description}
                      </p>
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="w-full md:w-48 lg:w-52 shrink-0">
                    <div className="aspect-video relative w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="text-sm md:text-base font-mono font-medium text-white mb-2 tracking-wide">
                          {session.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lightning Talks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="font-sans text-white text-lg md:text-xl lg:text-2xl font-semibold mb-4 uppercase tracking-tight">
            Lightning Talks
          </h3>
          
          {/* Lightning Talks Description */}
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
            These 10–15 minute lightning talks will spotlight the different use cases in the Python ecosystem, spanning MedTech, electrical engineering, government, cybersecurity, and agentic workflows:
          </p>

          <div className="flex flex-col space-y-6">
            {/* Individual Lightning Talk Spotlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border-l-4 border-yellow-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                Python Driving Innovation at Alt-Bionics
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-yellow-400 font-mono font-medium">Mauricio Figueroa</span> showcases how Python powers next-generation prosthetic technology and medical device innovation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-l-4 border-blue-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                Meet Charlotte: Your Sarcastic Sidekick Against Digital Threats
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-blue-400 font-mono font-medium">Corrina Alcoser</span> introduces Charlotte, an AI-powered cybersecurity assistant with attitude, built using Python frameworks.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="border-l-4 border-green-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                Building Context-Aware AI with Graph + Vector Synergy
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-green-400 font-mono font-medium">Gennaro Maida</span> explores Military Healthcare Policy Intelligence using advanced Python-based AI architectures.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="border-l-4 border-purple-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                Flexible AI Workflow Automation Powered by Python and n8n
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-purple-400 font-mono font-medium">Mayank Gohil</span> demonstrates seamless integration of Python with n8n for intelligent automation workflows.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="border-l-4 border-red-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                A Mathematician&apos;s Perspective on Math and Python
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-red-400 font-mono font-medium">Sean Roberson</span> bridges mathematical theory and practical Python implementation from an academic viewpoint.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="border-l-4 border-cyan-500 pl-6 py-4"
            >
              <h4 className="font-sans text-white text-lg md:text-xl font-semibold mb-2">
                Python Shaping Work in Government and National Security
              </h4>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                <span className="text-cyan-400 font-mono font-medium">Michael Pendleton</span> reveals how Python drives critical operations in government and defense sectors.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}