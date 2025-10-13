"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/30 rounded-full blur-2xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="max-w-4xl mx-auto overflow-hidden border dark:border-zinc-700 border-zinc-200">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative p-8 md:p-12 text-center">
              {/* Decorative Lines */}
              <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent h-[2px] w-3/4 mx-auto blur-sm" />
              <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-primary/70 to-transparent h-px w-3/4 mx-auto" />

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70"
              >
                Ready to Compete?
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground"
              >
                Don't miss the opportunity to showcase your skills at Caturnawa 2025. 
                Register now and join hundreds of talented participants!
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto group">
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
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">4</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Competitions</div>
                </div>
                <div className="text-center border-x dark:border-zinc-700 border-zinc-200">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">500+</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">20%</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Early Bird Discount</div>
                </div>
              </motion.div>

              {/* Decorative Bottom Lines */}
              <div className="absolute inset-x-20 bottom-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent h-[2px] w-3/4 mx-auto blur-sm" />
              <div className="absolute inset-x-20 bottom-0 bg-gradient-to-r from-transparent via-primary/70 to-transparent h-px w-3/4 mx-auto" />
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

