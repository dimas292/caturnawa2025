// src/types/system-status.ts

export type BannerVariant = "info" | "warning" | "error" | "success"

export type SystemStatusType = 
  | "registration-open"
  | "registration-closing-soon"
  | "registration-closed"
  | "maintenance"
  | "custom-announcement"

export interface SystemStatus {
  type: SystemStatusType
  variant: BannerVariant
  message: string
  dismissible: boolean
  icon?: string
  actionLabel?: string
  actionUrl?: string
}

export interface BannerConfig {
  id: string
  status: SystemStatus
  expiresAt?: Date
}

