import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Children, useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type PropsWithChildren } from 'react'

interface CarouselProps extends PropsWithChildren {
  label: string
  className?: string
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  showIndicators?: boolean
}

interface CarouselMetrics {
  step: number
  maxIndex: number
}

interface PointerDrag {
  pointerId: number
  startX: number
  startY: number
  deltaX: number
  startIndex: number
  clickTarget: HTMLElement | null
  active: boolean
}

export function Carousel({
  label,
  className = '',
  children,
  activeIndex,
  onActiveIndexChange,
  showIndicators = true,
}: CarouselProps) {
  const slides = Children.toArray(children)
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<PointerDrag | null>(null)
  const suppressClickTargetRef = useRef<HTMLElement | null>(null)
  const metricsRef = useRef<CarouselMetrics>({ step: 0, maxIndex: 0 })
  const [metrics, setMetrics] = useState<CarouselMetrics>(metricsRef.current)
  const [internalIndex, setInternalIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const index = activeIndex ?? internalIndex
  const visibleIndex = Math.min(index, metrics.maxIndex)

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const track = viewport?.firstElementChild as HTMLElement | null
    const firstSlide = track?.firstElementChild as HTMLElement | null
    if (!viewport || !track || !firstSlide) return

    const gap = Number.parseFloat(getComputedStyle(track).columnGap || '0')
    const step = firstSlide.getBoundingClientRect().width + gap
    const visibleCount = step > 0 ? Math.max(1, Math.floor((viewport.clientWidth + gap + 0.5) / step)) : 1
    const nextMetrics = { step, maxIndex: Math.max(0, slides.length - visibleCount) }
    metricsRef.current = nextMetrics
    setMetrics(nextMetrics)
  }, [slides.length])

  useLayoutEffect(() => {
    measure()
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [measure])

  const changeIndex = useCallback((nextIndex: number) => {
    const next = Math.max(0, Math.min(metricsRef.current.maxIndex, nextIndex))
    if (activeIndex === undefined) setInternalIndex(next)
    onActiveIndexChange?.(next)
  }, [activeIndex, onActiveIndexChange])

  useLayoutEffect(() => {
    if (index > metrics.maxIndex) changeIndex(metrics.maxIndex)
  }, [changeIndex, index, metrics.maxIndex])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    const target = event.target instanceof Element ? event.target.closest('a, button') as HTMLElement | null : null
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      startIndex: visibleIndex,
      clickTarget: target,
      active: false,
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY

    if (!drag.active) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        dragRef.current = null
        return
      }
      if (Math.abs(deltaX) < 8) return
      drag.active = true
      setIsDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    event.preventDefault()
    drag.deltaX = deltaX
    const atEdge = (drag.startIndex === 0 && deltaX > 0)
      || (drag.startIndex >= metricsRef.current.maxIndex && deltaX < 0)
    setDragOffset(atEdge ? deltaX * 0.22 : deltaX)
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (!drag.active) return

    suppressClickTargetRef.current = drag.clickTarget
    window.setTimeout(() => {
      if (suppressClickTargetRef.current === drag.clickTarget) suppressClickTargetRef.current = null
    }, 0)
    const threshold = Math.min(64, Math.max(34, metricsRef.current.step * 0.18))
    if (drag.deltaX < -threshold) changeIndex(drag.startIndex + 1)
    else if (drag.deltaX > threshold) changeIndex(drag.startIndex - 1)
    setDragOffset(0)
    setIsDragging(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('input, textarea, select')) return
    if (event.key === 'ArrowRight' && visibleIndex < metrics.maxIndex) {
      event.preventDefault()
      changeIndex(visibleIndex + 1)
    } else if (event.key === 'ArrowLeft' && visibleIndex > 0) {
      event.preventDefault()
      changeIndex(visibleIndex - 1)
    }
  }

  const translateX = -(visibleIndex * metrics.step) + dragOffset

  return (
    <div className={`carousel ${className}`}>
      <div
        ref={viewportRef}
        className={`carousel-viewport ${isDragging ? 'is-dragging' : ''}`}
        role="region"
        aria-label={label}
        aria-roledescription="Karussell"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onKeyDown={handleKeyDown}
        onClickCapture={(event) => {
          const suppressedTarget = suppressClickTargetRef.current
          if (suppressedTarget) {
            suppressClickTargetRef.current = null
            const clickedTarget = event.target instanceof Element
              ? event.target.closest('a, button')
              : null
            if (clickedTarget === suppressedTarget) {
              event.preventDefault()
              event.stopPropagation()
            }
          }
        }}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: isDragging ? 'none' : undefined,
          }}
        >
          {slides.map((slide, slideIndex) => (
            <div className="carousel-slide" data-carousel-slide key={slideIndex} role="group" aria-roledescription="Element" aria-label={`${slideIndex + 1} von ${slides.length}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      {metrics.maxIndex > 0 && (
        <div className="carousel-controls">
          <div className="carousel-dots" aria-label="Karussellposition">
            {showIndicators && Array.from({ length: metrics.maxIndex + 1 }, (_, dotIndex) => (
              <button
                key={dotIndex}
                className={`carousel-dot ${visibleIndex === dotIndex ? 'is-active' : ''}`}
                type="button"
                aria-label={`Position ${dotIndex + 1} von ${metrics.maxIndex + 1}`}
                aria-current={visibleIndex === dotIndex ? 'true' : undefined}
                onClick={() => changeIndex(dotIndex)}
              />
            ))}
          </div>
          <div className="carousel-arrows">
            <button type="button" className="carousel-arrow" aria-label="Vorherige Elemente" disabled={visibleIndex === 0} onClick={() => changeIndex(visibleIndex - 1)}><ArrowLeft size={17} /></button>
            <button type="button" className="carousel-arrow" aria-label="Nächste Elemente" disabled={visibleIndex >= metrics.maxIndex} onClick={() => changeIndex(visibleIndex + 1)}><ArrowRight size={17} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
