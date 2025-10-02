"use client"

import { useEffect, useMemo, useState } from "react"
// Device frameset removed - using simple responsive layout instead
import { Monitor, Smartphone } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type DeviceKey = "macbook" | "iphone"
type DeviceName = "MacBook Pro" | "iPhone X"

type DeviceConfig = {
  label: string
  device: DeviceName
  icon: LucideIcon
  zoom: {
    base: number
    min: number
    max: number
  }
  color?: string
  viewportScale: {
    width: number
    height: number
  }
  viewportPadding: number
  contentViewport?: {
    width: number
    height: number
  }
}

const DEVICE_CONFIG: Record<DeviceKey, DeviceConfig> = {
  macbook: {
    label: "MacBook Pro",
    device: "MacBook Pro",
    icon: Monitor,
    zoom: {
      base: 0.85,
      min: 0.6,
      max: 1.6
    },
    viewportScale: {
      width: 0.78,
      height: 0.92
    },
    viewportPadding: 160,
    contentViewport: {
      width: 1280,
      height: 800
    }
  },
  iphone: {
    label: "iPhone X",
    device: "iPhone X",
    icon: Smartphone,
    zoom: {
      base: 1,
      min: 0.7,
      max: 2
    },
    color: "black",
    viewportScale: {
      width: 0.26,
      height: 1
    },
    viewportPadding: 220
  }
}

export default function DeviceShowcasePage() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceKey>("macbook")
  const config = DEVICE_CONFIG[selectedDevice]
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  const baseWidth = selectedDevice === "iphone" ? 375 : 960
  const baseHeight = selectedDevice === "iphone" ? 812 : 600
  const contentViewport = config.contentViewport ?? { width: baseWidth, height: baseHeight }
  const contentScale = config.contentViewport ? baseWidth / config.contentViewport.width : 1

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)

    return () => {
      window.removeEventListener("resize", updateViewport)
    }
  }, [])

  const dynamicZoom = useMemo(() => {
    if (!viewport.width || !viewport.height) {
      return config.zoom.base
    }

    const availableWidth = viewport.width * config.viewportScale.width
    const paddedViewportHeight = viewport.height - config.viewportPadding
    const availableHeight = Math.max(paddedViewportHeight, 200) * config.viewportScale.height

    const horizontalScale = availableWidth / baseWidth
    const verticalScale = availableHeight / baseHeight
    const proposedZoom = Math.min(horizontalScale, verticalScale)

    if (!Number.isFinite(proposedZoom) || proposedZoom <= 0) {
      return config.zoom.base
    }

    return Math.min(config.zoom.max, Math.max(config.zoom.min, proposedZoom))
  }, [
    baseWidth,
    baseHeight,
    config.viewportPadding,
    config.viewportScale.height,
    config.viewportScale.width,
    config.zoom.base,
    config.zoom.max,
    config.zoom.min,
    viewport
  ])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_65%)]"
        aria-hidden
      />

  <div className="relative z-10 flex h-full w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12 md:px-10 md:py-16">
        <header className="absolute left-6 top-6 hidden flex-col gap-1 text-white/70 sm:flex">
          <span className="text-xs uppercase tracking-[0.4em] text-white/40">AxoCred Demo</span>
          <h1 className="text-2xl font-semibold text-white">Experiencia inmersiva</h1>
        </header>

        <aside className="absolute right-6 top-6 z-20">
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-1 py-1 backdrop-blur">
            {(Object.entries(DEVICE_CONFIG) as Array<[DeviceKey, DeviceConfig]>).map(([key, option]) => {
              const Icon = option.icon
              const active = selectedDevice === key

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedDevice(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-white text-black shadow-lg" : "text-white/65 hover:text-white"
                  )}
                  aria-pressed={active}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        <div
          className={cn(
            "relative flex w-full max-w-[1600px] justify-center",
            "device-shell",
            selectedDevice === "macbook" ? "device-shell--desktop" : "device-shell--phone"
          )}
        >
          <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow-2xl">
            <div
              className="origin-top-left"
              style={{
                width: contentViewport.width,
                height: contentViewport.height,
                transform: `scale(${contentScale})`
              }}
            >
              <iframe
                key={selectedDevice}
                title={`${config.label} preview`}
                src="/demo"
                style={{ width: "100%", height: "100%" }}
                className="border-0 bg-white"
                allow="microphone; clipboard-read; clipboard-write; autoplay"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
