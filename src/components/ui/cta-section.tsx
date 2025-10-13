"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { SparklesCore } from "@/components/ui/sparkles"

export const CTASection = () => {
  return (
    <section className="relative w-full bg-[#202225] dark:bg-[#202225] flex flex-col items-center justify-center overflow-hidden py-20">
      {/* Sparkles Background */}
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id="tsparticlescta"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#5865f2"
          speed={1}
        />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-20">
        {/* Gradient Lines */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="relative h-10">
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-[#5865f2] to-transparent h-[2px] w-3/4 mx-auto blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-[#5865f2] to-transparent h-px w-3/4 mx-auto" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-[#7289da] to-transparent h-[5px] w-1/4 mx-auto blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-[#7289da] to-transparent h-px w-1/4 mx-auto" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center gap-6 relative z-20 max-w-4xl mx-auto">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400"
          >
            Ready to Compete?
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-300 text-center text-base md:text-lg max-w-2xl"
          >
            Don't miss the opportunity to showcase your skills at Caturnawa 2025. 
            Register now and join hundreds of talented participants!
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto group bg-[#5865f2] hover:bg-[#4752c4] text-white"
              >
                Register Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/guide">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto group border-neutral-700 text-white hover:bg-neutral-800"
              >
                Registration Guide
                <BookOpen className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-8 max-w-2xl w-full"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#5865f2] mb-2">4</div>
              <div className="text-sm md:text-base text-neutral-400">Competitions</div>
            </div>
            <div className="text-center border-x border-neutral-700">
              <div className="text-3xl md:text-4xl font-bold text-[#5865f2] mb-2">500+</div>
              <div className="text-sm md:text-base text-neutral-400">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#5865f2] mb-2">20%</div>
              <div className="text-sm md:text-base text-neutral-400">Early Bird Discount</div>
            </div>
          </motion.div>
        </div>

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-[#202225] [mask-image:radial-gradient(650px_350px_at_center,transparent_20%,white)]"></div>
      </div>
    </section>
  )
}
