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


        {/* Schedule Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="font-sans text-white text-lg md:text-xl lg:text-2xl font-semibold mb-8 uppercase tracking-tight">
            Conference Schedule
          </h3>
          <div className="flex flex-col">
            {/* Joel Grus - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Building Your Own AI Coding Assistant with DSPy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Joel Grus"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-joel-grus.png"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Joel Grus
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Principal Engineer/AI Tech Leader, Capital Group
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Introducing the Alamo Python community to building your own AI coding assistant using DSPy. Discover how to create intelligent development tools.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-sm md:text-base font-mono font-medium text-white mb-2 tracking-wide">
                        1:15 PM - 2:00 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mauricio Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Python Driving Innovation at Alt-Bionics
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Mauricio Figueroa"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-mauricio.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Mauricio Figueroa
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Electrical Engineer, Alt-Bionics
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Showcasing how Python powers next-generation prosthetic technology and medical device innovation.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-yellow-600 border border-yellow-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        2:00 PM - 2:15 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mayank Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Flexible AI Workflow Automation Powered by Python and n8n
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Mayank Gohil"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/LTAISASW-13.jpg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Mayank Gohil
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          AI Innovation, Learn2AI
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Demonstrating seamless integration of Python with n8n for intelligent automation workflows.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-purple-600 border border-purple-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        2:15 PM - 2:30 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Paul Bailey - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Asynchronous Patterns for Django
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Paul Bailey"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-paul-bailey.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Paul Bailey
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Principal Engineer, Clarity
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Presenting asynchronous patterns for Django in celebration of Django&apos;s 20th anniversary. Learn modern async techniques to improve your Django applications.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-sm md:text-base font-mono font-medium text-white mb-2 tracking-wide">
                        2:30 PM - 3:15 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Break */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Networking Break
                  </p>
                  <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                    Connect with fellow Python developers, grab refreshments, and prepare for the final session.
                  </p>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-green-600 border border-green-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Break
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        3:15 PM - 3:30 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Cody Fincher - Main Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Advanced Alchemy: Your Companion to SQLAlchemy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Cody Fincher"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-cody-fincher.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Cody Fincher
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Staff Technical Solutions Consultant, Google
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Visiting from Dallas to share advanced SQLAlchemy techniques and patterns. Master database interactions in Python applications.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-sm md:text-base font-mono font-medium text-white mb-2 tracking-wide">
                        3:30 PM - 4:15 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Closing Lightning Talks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="font-sans text-white text-lg md:text-xl lg:text-2xl font-semibold mb-8 uppercase tracking-tight">
            Closing Lightning Talks
          </h3>
          <div className="flex flex-col">
            {/* Corrina Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Meet Charlotte: Your Sarcastic Sidekick Against Digital Threats
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Corrina Alcoser"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-corrina.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Corrina Alcoser
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Cybersecurity Specialist, AI Cowboys
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Introducing Charlotte, an AI-powered cybersecurity assistant with attitude, built using Python frameworks.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-blue-600 border border-blue-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        4:15 PM - 4:30 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gennaro Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Building Context-Aware AI with Graph + Vector Synergy
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Gennaro Maida"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-gennaro.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Gennaro Maida
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          MedTech Executive, Denovo Innovations
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Exploring Military Healthcare Policy Intelligence using advanced Python-based AI architectures.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-green-600 border border-green-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        4:30 PM - 4:45 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sean Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    A Mathematician&apos;s Perspective on Math and Python
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Sean Roberson"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-sean.jpg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Sean Roberson
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Operations Research Analyst, AETC
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Bridging mathematical theory and practical Python implementation from an academic viewpoint.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-red-600 border border-red-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        4:45 PM - 5:00 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Michael Lightning Talk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="font-mono focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-gray-100 hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 no-underline block border-t border-gray-700 border-b py-8 lg:py-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 md:gap-8 items-start">
                <div className="flex flex-col gap-4 md:gap-6">
                  <p className="font-sans text-white leading-tight text-xl md:text-2xl lg:text-3xl tracking-tight font-medium">
                    Python Shaping Work in Government and National Security
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="relative size-8 md:size-10 lg:size-12 shrink-0 bg-gray-700 rounded-full overflow-hidden">
                        <Image
                          alt="Michael Pendleton"
                          src="https://devsa-assets.s3.us-east-2.amazonaws.com/pysa/speakers-michael.jpeg"
                          fill
                          className="rounded-full object-cover w-full h-full grayscale"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm md:text-base lg:text-lg text-white tracking-tight font-mono uppercase font-medium">
                          Michael Pendleton
                        </div>
                        <div className="text-xs text-gray-400 font-mono uppercase">
                          Chief Executive Officer, AI Cowboys
                        </div>
                      </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-300 mt-3 leading-relaxed max-w-prose">
                      Revealing how Python drives critical operations in government and defense sectors.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-48 lg:w-52 shrink-0">
                  <div className="aspect-video relative w-full bg-cyan-600 border border-cyan-500 rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-xs font-mono font-medium text-white mb-1 tracking-wide uppercase">
                        Lightning Talk
                      </div>
                      <div className="text-sm md:text-base font-mono font-medium text-white tracking-wide">
                        5:00 PM - 5:15 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}