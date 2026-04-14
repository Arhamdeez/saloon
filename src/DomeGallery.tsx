import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { useGesture } from '@use-gesture/react'
import './DomeGallery.css'

export type DomeGalleryImage = string | { src: string; alt?: string }

const DEFAULT_IMAGES: { src: string; alt: string }[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art',
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture',
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork',
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art',
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern',
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface',
  },
  { src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large', alt: 'Social media image' },
]

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360
  return a - 180
}

const shortestYDelta = (fromY: number, toY: number) => {
  let d = toY - fromY
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

const getDataNumber = (
  el: HTMLElement,
  name: 'offsetX' | 'offsetY' | 'sizeX' | 'sizeY',
  fallback: number,
) => {
  const v = el.dataset[name]
  const n = v == null ? NaN : parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

type TileCoord = { x: number; y: number; sizeX: number; sizeY: number; src: string; alt: string }

function buildItems(pool: DomeGalleryImage[], seg: number): TileCoord[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2)
  const evenYs = [-4, -2, 0, 2, 4]
  const oddYs = [-3, -1, 1, 3, 5]

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }))
  })

  const totalSlots = coords.length
  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: '', alt: '' }))
  }
  if (pool.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`,
    )
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === 'string') {
      return { src: image, alt: '' }
    }
    return { src: image.src || '', alt: image.alt || '' }
  })

  const usedImages = Array.from(
    { length: totalSlots },
    (_, i) => normalizedImages[i % normalizedImages.length],
  )

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i]
          usedImages[i] = usedImages[j]
          usedImages[j] = tmp
          break
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }))
}

function computeItemBaseRotation(
  offsetX: number,
  offsetY: number,
  sizeX: number,
  sizeY: number,
  segments: number,
) {
  const unit = 360 / segments / 2
  const rotateY = unit * (offsetX + (sizeX - 1) / 2)
  const rotateX = unit * (offsetY - (sizeY - 1) / 2)
  return { rotateX, rotateY }
}

export type DomeGalleryProps = {
  images?: DomeGalleryImage[]
  fit?: number
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height'
  minRadius?: number
  maxRadius?: number
  padFactor?: number
  overlayBlurColor?: string
  maxVerticalRotationDeg?: number
  dragSensitivity?: number
  enlargeTransitionMs?: number
  segments?: number
  dragDampening?: number
  openedImageWidth?: string
  openedImageHeight?: string
  imageBorderRadius?: string
  openedImageBorderRadius?: string
  grayscale?: boolean
  showVignette?: boolean
  autoRotate?: boolean
  autoRotateSpeed?: number
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = 'rgba(227, 221, 213, 0.88)',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '250px',
  openedImageHeight = '350px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true,
  showVignette = true,
  autoRotate = true,
  autoRotateSpeed = 7,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const lightboxBackdropRef = useRef<HTMLDivElement | null>(null)
  const lightboxOverlayRef = useRef<HTMLDivElement | null>(null)
  const focusedElRef = useRef<HTMLElement | null>(null)
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(
    null,
  )

  const rotationRef = useRef({ x: 0, y: 0 })
  const startRotRef = useRef({ x: 0, y: 0 })
  const startPosRef = useRef<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const inertiaRAF = useRef<number | null>(null)
  const openingRef = useRef(false)
  const openStartedAtRef = useRef(0)
  const lastDragEndAt = useRef(0)

  const homeRotationRef = useRef({ x: 0, y: 0 })
  const returnHomeRafRef = useRef<number | null>(null)
  const pendingReturnHomeRef = useRef(false)
  const returningHomeRef = useRef(false)

  const scrollLockedRef = useRef(false)
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return
    scrollLockedRef.current = true
    document.body.classList.add('dg-scroll-lock')
  }, [])
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return
    scrollLockedRef.current = false
    document.body.classList.remove('dg-scroll-lock')
  }, [])

  const items = useMemo(() => buildItems(images, segments), [images, segments])

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`
    }
  }, [])

  const lockedRadiusRef = useRef<number | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height)
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h
      let basis: number
      switch (fitBasis) {
        case 'min':
          basis = minDim
          break
        case 'max':
          basis = maxDim
          break
        case 'width':
          basis = w
          break
        case 'height':
          basis = h
          break
        default:
          basis = aspect >= 1.3 ? w : minDim
      }
      let radius = basis * fit
      const heightGuard = h * 1.35
      radius = Math.min(radius, heightGuard)
      radius = clamp(radius, minRadius, maxRadius)
      lockedRadiusRef.current = Math.round(radius)

      const viewerPad = Math.max(8, Math.round(minDim * padFactor))
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`)
      root.style.setProperty('--viewer-pad', `${viewerPad}px`)
      root.style.setProperty('--overlay-blur-color', overlayBlurColor)
      root.style.setProperty('--tile-radius', imageBorderRadius)
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius)
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none')
      applyTransform(rotationRef.current.x, rotationRef.current.y)

      const portaled = lightboxOverlayRef.current
      if (portaled && document.body.contains(portaled)) {
        const vw = window.innerWidth
        const vh = window.innerHeight
        let lw = Math.min(vw * 0.92, 660)
        let lh = Math.min(vh * 0.88, 800)
        if (openedImageWidth && openedImageHeight) {
          const tempDiv = document.createElement('div')
          tempDiv.style.cssText = `position:fixed;left:-9999px;width:${openedImageWidth};height:${openedImageHeight};visibility:hidden;pointer-events:none`
          document.body.appendChild(tempDiv)
          const tempRect = tempDiv.getBoundingClientRect()
          document.body.removeChild(tempDiv)
          lw = tempRect.width
          lh = tempRect.height
        }
        lw = Math.min(lw, vw * 0.96)
        lh = Math.min(lh, vh * 0.92)
        const left = (vw - lw) / 2
        const top = (vh - lh) / 2
        portaled.style.left = `${left}px`
        portaled.style.top = `${top}px`
        portaled.style.width = `${lw}px`
        portaled.style.height = `${lh}px`
      }
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight,
    applyTransform,
  ])

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y)
  }, [applyTransform])

  useEffect(() => {
    if (!autoRotate) return
    let rafId = 0
    let last = performance.now()
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motionOk = !mq.matches
    const onMq = () => {
      motionOk = !mq.matches
    }
    mq.addEventListener('change', onMq)
    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.064)
      last = now
      if (!motionOk) return
      const busy =
        draggingRef.current ||
        inertiaRAF.current != null ||
        focusedElRef.current != null ||
        openingRef.current ||
        returningHomeRef.current
      if (busy) return
      const { x } = rotationRef.current
      const y = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed * dt)
      rotationRef.current = { x, y }
      applyTransform(x, y)
    }
    rafId = requestAnimationFrame(loop)
    return () => {
      mq.removeEventListener('change', onMq)
      cancelAnimationFrame(rafId)
    }
  }, [autoRotate, autoRotateSpeed, applyTransform])

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current)
      inertiaRAF.current = null
    }
  }, [])

  const cancelReturnHomeRaf = useCallback(() => {
    if (returnHomeRafRef.current != null) {
      cancelAnimationFrame(returnHomeRafRef.current)
      returnHomeRafRef.current = null
    }
  }, [])

  const startReturnHome = useCallback(() => {
    if (focusedElRef.current || openingRef.current) return
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return

    if (draggingRef.current) {
      pendingReturnHomeRef.current = true
      return
    }

    stopInertia()
    cancelReturnHomeRaf()

    const from = { ...rotationRef.current }
    const to = homeRotationRef.current
    if (
      Math.abs(from.x - to.x) < 0.25 &&
      Math.abs(shortestYDelta(from.y, to.y)) < 0.25
    ) {
      rotationRef.current = { ...to }
      applyTransform(to.x, to.y)
      return
    }

    returningHomeRef.current = true
    const durationMs = 680
    const t0 = performance.now()
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (now: number) => {
      if (draggingRef.current || focusedElRef.current || openingRef.current) {
        cancelReturnHomeRaf()
        returningHomeRef.current = false
        return
      }
      const u = Math.min(1, (now - t0) / durationMs)
      const e = easeOutCubic(u)
      const x = from.x + (to.x - from.x) * e
      const y = wrapAngleSigned(from.y + shortestYDelta(from.y, to.y) * e)
      rotationRef.current = { x, y }
      applyTransform(x, y)
      if (u < 1) {
        returnHomeRafRef.current = requestAnimationFrame(tick)
      } else {
        returnHomeRafRef.current = null
        rotationRef.current = { ...to }
        applyTransform(to.x, to.y)
        returningHomeRef.current = false
      }
    }
    returnHomeRafRef.current = requestAnimationFrame(tick)
  }, [applyTransform, cancelReturnHomeRaf, stopInertia])

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4
      let vX = clamp(vx, -MAX_V, MAX_V) * 80
      let vY = clamp(vy, -MAX_V, MAX_V) * 80
      let frames = 0
      const d = clamp(dragDampening ?? 0.6, 0, 1)
      const frictionMul = 0.94 + 0.055 * d
      const stopThreshold = 0.015 - 0.01 * d
      const maxFrames = Math.round(90 + 270 * d)
      const step = () => {
        vX *= frictionMul
        vY *= frictionMul
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null
          return
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null
          return
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg)
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200)
        rotationRef.current = { x: nextX, y: nextY }
        applyTransform(nextX, nextY)
        inertiaRAF.current = requestAnimationFrame(step)
      }
      stopInertia()
      inertiaRAF.current = requestAnimationFrame(step)
    },
    [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia],
  )

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return
        stopInertia()
        cancelReturnHomeRaf()
        returningHomeRef.current = false
        pendingReturnHomeRef.current = false
        if (!('clientX' in event)) return
        const evt = event as { clientX: number; clientY: number }
        draggingRef.current = true
        movedRef.current = false
        startRotRef.current = { ...rotationRef.current }
        startPosRef.current = { x: evt.clientX, y: evt.clientY }
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return
        if (!('clientX' in event)) return
        const evt = event as { clientX: number; clientY: number }
        const dxTotal = evt.clientX - startPosRef.current.x
        const dyTotal = evt.clientY - startPosRef.current.y
        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal
          if (dist2 > 16) movedRef.current = true
        }
        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        )
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity)
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY }
          applyTransform(nextX, nextY)
        }
        if (last) {
          draggingRef.current = false
          const [vMagX, vMagY] = velocity
          const [dirX, dirY] = direction
          let vx = vMagX * dirX
          let vy = vMagY * dirY
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement
            vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2)
            vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2)
          }
          if (pendingReturnHomeRef.current) {
            pendingReturnHomeRef.current = false
            stopInertia()
            startReturnHome()
          } else if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) {
            startInertia(vx, vy)
          }
          if (movedRef.current) lastDragEndAt.current = performance.now()
          movedRef.current = false
        }
      },
    },
    {
      target: mainRef,
      drag: { filterTaps: true, axis: 'lock' },
      eventOptions: { passive: true },
    },
  )

  const onGalleryPointerLeave = useCallback(() => {
    if (focusedElRef.current || openingRef.current) return
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return
    stopInertia()
    if (!draggingRef.current) {
      pendingReturnHomeRef.current = false
      startReturnHome()
    } else {
      pendingReturnHomeRef.current = true
    }
  }, [startReturnHome, stopInertia])

  const measureLightboxTargetRect = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    let w = Math.min(vw * 0.92, 660)
    let h = Math.min(vh * 0.88, 800)
    if (openedImageWidth && openedImageHeight) {
      const tempDiv = document.createElement('div')
      tempDiv.style.cssText = `position:fixed;left:-9999px;width:${openedImageWidth};height:${openedImageHeight};visibility:hidden;pointer-events:none`
      document.body.appendChild(tempDiv)
      const tempRect = tempDiv.getBoundingClientRect()
      document.body.removeChild(tempDiv)
      w = tempRect.width
      h = tempRect.height
    }
    w = Math.min(w, vw * 0.96)
    h = Math.min(h, vh * 0.92)
    const left = (vw - w) / 2
    const top = (vh - h) / 2
    return { left, top, width: w, height: h }
  }, [openedImageWidth, openedImageHeight])

  const closeEnlarged = useCallback(() => {
    if (performance.now() - openStartedAtRef.current < 250) return
    const el = focusedElRef.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const overlay = lightboxOverlayRef.current
    const refDiv = parent.querySelector('.item__image--reference')
    const originalPos = originalTilePositionRef.current
    const backdrop = lightboxBackdropRef.current

    if (!overlay) {
      backdrop?.remove()
      lightboxBackdropRef.current = null
      if (refDiv) refDiv.remove()
      parent.style.setProperty('--rot-y-delta', '0deg')
      parent.style.setProperty('--rot-x-delta', '0deg')
      el.style.visibility = ''
      el.style.zIndex = '0'
      focusedElRef.current = null
      rootRef.current?.removeAttribute('data-enlarging')
      openingRef.current = false
      unlockScroll()
      return
    }

    const imgNode = overlay.querySelector('img')
    const currentRect = overlay.getBoundingClientRect()
    overlay.remove()
    lightboxOverlayRef.current = null

    if (backdrop) {
      backdrop.classList.remove('dg-lightbox-backdrop--open')
    }

    if (!originalPos) {
      backdrop?.remove()
      lightboxBackdropRef.current = null
      if (refDiv) refDiv.remove()
      parent.style.setProperty('--rot-y-delta', '0deg')
      parent.style.setProperty('--rot-x-delta', '0deg')
      el.style.visibility = ''
      el.style.zIndex = '0'
      focusedElRef.current = null
      rootRef.current?.removeAttribute('data-enlarging')
      openingRef.current = false
      unlockScroll()
      return
    }

    const animatingOverlay = document.createElement('div')
    animatingOverlay.className = 'dg-lightbox-overlay'
    animatingOverlay.setAttribute('data-dg-lightbox', 'overlay')
    const br = openedImageBorderRadius || '28px'
    animatingOverlay.style.cssText = `position:fixed;left:${currentRect.left}px;top:${currentRect.top}px;width:${currentRect.width}px;height:${currentRect.height}px;z-index:9991;border-radius:${br};overflow:hidden;box-shadow:0 24px 72px rgba(0,0,0,.3);transition:left ${enlargeTransitionMs}ms ease-out,top ${enlargeTransitionMs}ms ease-out,width ${enlargeTransitionMs}ms ease-out,height ${enlargeTransitionMs}ms ease-out,opacity ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;opacity:1`
    if (imgNode) {
      const img = imgNode.cloneNode(true) as HTMLImageElement
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
      animatingOverlay.appendChild(img)
    }
    document.body.appendChild(animatingOverlay)
    void animatingOverlay.getBoundingClientRect()
    requestAnimationFrame(() => {
      animatingOverlay.style.left = `${originalPos.left}px`
      animatingOverlay.style.top = `${originalPos.top}px`
      animatingOverlay.style.width = `${originalPos.width}px`
      animatingOverlay.style.height = `${originalPos.height}px`
      animatingOverlay.style.opacity = '0'
    })

    let closeDone = false
    const cleanup = () => {
      if (closeDone) return
      closeDone = true
      animatingOverlay.remove()
      backdrop?.remove()
      lightboxBackdropRef.current = null
      originalTilePositionRef.current = null
      if (refDiv) refDiv.remove()
      parent.style.transition = 'none'
      el.style.transition = 'none'
      parent.style.setProperty('--rot-y-delta', '0deg')
      parent.style.setProperty('--rot-x-delta', '0deg')
      requestAnimationFrame(() => {
        el.style.visibility = ''
        el.style.opacity = '0'
        el.style.zIndex = '0'
        focusedElRef.current = null
        rootRef.current?.removeAttribute('data-enlarging')
        requestAnimationFrame(() => {
          parent.style.transition = ''
          el.style.transition = 'opacity 300ms ease-out'
          requestAnimationFrame(() => {
            el.style.opacity = '1'
            setTimeout(() => {
              el.style.transition = ''
              el.style.opacity = ''
              openingRef.current = false
              if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true') {
                document.body.classList.remove('dg-scroll-lock')
              }
            }, 300)
          })
        })
      })
    }
    animatingOverlay.addEventListener('transitionend', cleanup, { once: true })
    window.setTimeout(cleanup, enlargeTransitionMs + 150)
  }, [enlargeTransitionMs, openedImageBorderRadius, unlockScroll])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedElRef.current) closeEnlarged()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeEnlarged])

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return
      openingRef.current = true
      openStartedAtRef.current = performance.now()
      lockScroll()
      const parent = el.parentElement
      if (!parent) {
        openingRef.current = false
        unlockScroll()
        return
      }
      focusedElRef.current = el
      el.setAttribute('data-focused', 'true')
      const offsetX = getDataNumber(parent, 'offsetX', 0)
      const offsetY = getDataNumber(parent, 'offsetY', 0)
      const sizeX = getDataNumber(parent, 'sizeX', 2)
      const sizeY = getDataNumber(parent, 'sizeY', 2)
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments)
      const parentY = normalizeAngle(parentRot.rotateY)
      const globalY = normalizeAngle(rotationRef.current.y)
      let rotY = -(parentY + globalY) % 360
      if (rotY < -180) rotY += 360
      const rotX = -parentRot.rotateX - rotationRef.current.x
      parent.style.setProperty('--rot-y-delta', `${rotY}deg`)
      parent.style.setProperty('--rot-x-delta', `${rotX}deg`)
      const refDiv = document.createElement('div')
      refDiv.className = 'item__image item__image--reference'
      refDiv.style.opacity = '0'
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`
      parent.appendChild(refDiv)

      void refDiv.offsetHeight

      const tileR = refDiv.getBoundingClientRect()
      if (tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false
        focusedElRef.current = null
        parent.removeChild(refDiv)
        unlockScroll()
        return
      }

      const target = measureLightboxTargetRect()

      const backdrop = document.createElement('div')
      backdrop.className = 'dg-lightbox-backdrop'
      backdrop.setAttribute('data-dg-lightbox', 'backdrop')
      document.body.appendChild(backdrop)
      lightboxBackdropRef.current = backdrop
      backdrop.addEventListener('click', (ev) => {
        if (ev.target === backdrop) closeEnlarged()
      })
      void backdrop.offsetHeight
      requestAnimationFrame(() => backdrop.classList.add('dg-lightbox-backdrop--open'))

      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height }
      el.style.visibility = 'hidden'
      el.style.zIndex = '0'

      const overlay = document.createElement('div')
      overlay.className = 'dg-lightbox-overlay'
      overlay.setAttribute('data-dg-lightbox', 'overlay')
      overlay.style.setProperty('--enlarge-radius', openedImageBorderRadius)
      overlay.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none')
      overlay.style.left = `${tileR.left}px`
      overlay.style.top = `${tileR.top}px`
      overlay.style.width = `${tileR.width}px`
      overlay.style.height = `${tileR.height}px`
      overlay.style.opacity = '0'
      overlay.style.willChange = 'left, top, width, height, opacity'
      overlay.style.transition = `left ${enlargeTransitionMs}ms ease, top ${enlargeTransitionMs}ms ease, width ${enlargeTransitionMs}ms ease, height ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`

      const rawSrc = parent.dataset.src || el.querySelector('img')?.getAttribute('src') || ''
      const img = document.createElement('img')
      img.src = rawSrc
      img.alt = el.querySelector('img')?.getAttribute('alt') || ''
      overlay.appendChild(img)
      document.body.appendChild(overlay)
      lightboxOverlayRef.current = overlay

      setTimeout(() => {
        if (!overlay.parentElement) return
        overlay.style.opacity = '1'
        overlay.style.left = `${target.left}px`
        overlay.style.top = `${target.top}px`
        overlay.style.width = `${target.width}px`
        overlay.style.height = `${target.height}px`
        rootRef.current?.setAttribute('data-enlarging', 'true')
      }, 16)
    },
    [
      closeEnlarged,
      enlargeTransitionMs,
      grayscale,
      lockScroll,
      measureLightboxTargetRect,
      openedImageBorderRadius,
      segments,
      unlockScroll,
    ],
  )

  const onTileClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (draggingRef.current) return
      if (movedRef.current) return
      if (performance.now() - lastDragEndAt.current < 80) return
      if (openingRef.current) return
      openItemFromElement(e.currentTarget)
    },
    [openItemFromElement],
  )

  const onTilePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== 'touch') return
      if (draggingRef.current) return
      if (movedRef.current) return
      if (performance.now() - lastDragEndAt.current < 80) return
      if (openingRef.current) return
      openItemFromElement(e.currentTarget)
    },
    [openItemFromElement],
  )

  useEffect(() => {
    return () => {
      document.body.classList.remove('dg-scroll-lock')
      document.querySelectorAll('[data-dg-lightbox]').forEach((node) => node.remove())
      lightboxBackdropRef.current = null
      lightboxOverlayRef.current = null
      if (returnHomeRafRef.current != null) {
        cancelAnimationFrame(returnHomeRafRef.current)
        returnHomeRafRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={showVignette ? 'sphere-root' : 'sphere-root sphere-root--noVignette'}
      onPointerLeave={onGalleryPointerLeave}
      style={
        {
          ['--segments-x']: segments,
          ['--segments-y']: segments,
          ['--overlay-blur-color']: overlayBlurColor,
          ['--tile-radius']: imageBorderRadius,
          ['--enlarge-radius']: openedImageBorderRadius,
          ['--image-filter']: grayscale ? 'grayscale(1)' : 'none',
        } as CSSProperties
      }
    >
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={
                  {
                    ['--offset-x']: it.x,
                    ['--offset-y']: it.y,
                    ['--item-size-x']: it.sizeX,
                    ['--item-size-y']: it.sizeY,
                  } as CSSProperties
                }
              >
                <div
                  className="item__image"
                  role="button"
                  tabIndex={0}
                  aria-label={it.alt || 'Open image'}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                >
                  <img src={it.src} draggable={false} alt={it.alt} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  )
}
