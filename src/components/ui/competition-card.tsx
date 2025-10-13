"use client"

import { motion } from "framer-motion"
import { Check, X, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-primary text-sm text-primary-foreground">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full dark:bg-zinc-800 bg-zinc-200 text-sm dark:text-zinc-400 text-zinc-600">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm dark:text-zinc-300 text-zinc-600">{text}</span>
    </div>
  )
}

interface CompetitionCardProps {
  name: string
  title: string
  price: string
  originalPrice?: string
  icon?: LucideIcon
  description: string
  benefits: Array<{ text: string; checked: boolean }>
  badge?: string
  featured?: boolean
  className?: string
}

export const CompetitionCard = ({
  name,
  title,
  price,
  originalPrice,
  icon: Icon,
  description,
  benefits,
  badge,
  featured = false,
  className,
}: CompetitionCardProps) => {
  return (
    <motion.div
      initial={{ filter: "blur(2px)", opacity: 0 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border",
          "dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-950/50 dark:to-zinc-900/80",
          "border-zinc-200 bg-gradient-to-br from-zinc-50/50 to-zinc-100/80",
          "p-6 transition-all hover:shadow-lg hover:-translate-y-1",
          featured && "ring-2 ring-primary/50",
          className,
        )}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col items-center border-b pb-6 dark:border-zinc-700 border-zinc-200">
          {/* Icon */}
          {Icon && (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}

          {/* Name */}
          <span className="mb-2 inline-block text-lg font-bold dark:text-zinc-50 text-zinc-900">
            {name}
          </span>

          {/* Title */}
          <span className="text-sm text-center dark:text-zinc-400 text-zinc-600 mb-4">
            {title}
          </span>

          {/* Price */}
          <div className="flex flex-col items-center gap-1">
            {originalPrice && (
              <span className="text-sm line-through dark:text-zinc-500 text-zinc-400">
                {originalPrice}
              </span>
            )}
            <span className="inline-block text-3xl font-bold">
              {price}
            </span>
          </div>

          {/* Description */}
          <span className="mt-3 dark:bg-gradient-to-br dark:from-zinc-200 dark:to-zinc-500 bg-gradient-to-br from-zinc-700 to-zinc-900 bg-clip-text text-center text-sm text-transparent">
            {description}
          </span>
        </div>

        {/* Benefits */}
        <div className="space-y-3 py-6">
          {benefits.map((benefit, index) => (
            <Benefit key={index} {...benefit} />
          ))}
        </div>

        {/* CTA Button */}
        <Link href="/auth/signup" className="block">
          <Button
            className="w-full"
            variant={featured ? "default" : "outline"}
          >
            Register Now
          </Button>
        </Link>
      </Card>
    </motion.div>
  )
}

