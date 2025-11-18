"use client"

import { useCallback, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const useMorphingText = (texts: string[], scrollRange: number = 1000, controlledScroll?: number) => {
  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)

  const setStyles = useCallback(
    (textIndex: number, fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current]
      if (!current1 || !current2) return

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      const invertedFraction = 1 - fraction
      current1.style.filter = `blur(${Math.min(
        8 / invertedFraction - 8,
        100
      )}px)`
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`

      current1.textContent = texts[textIndex % texts.length]
      current2.textContent = texts[(textIndex + 1) % texts.length]
    },
    [texts]
  )

  useEffect(() => {
    if (controlledScroll !== undefined) {
      const scrollPerText = scrollRange / texts.length
      const textIndex = Math.floor(controlledScroll / scrollPerText)
      const fraction = (controlledScroll % scrollPerText) / scrollPerText
      setStyles(textIndex, fraction)
    }
  }, [controlledScroll, texts.length, scrollRange, setStyles])

  useEffect(() => {
    if (controlledScroll !== undefined) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const scrollPerText = scrollRange / texts.length

      const textIndex = Math.floor(scrollY / scrollPerText)
      const fraction = (scrollY % scrollPerText) / scrollPerText

      setStyles(textIndex, fraction)
    }

    // Initial render
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [texts.length, scrollRange, setStyles, controlledScroll])

  return { text1Ref, text2Ref }
}

interface MorphingTextProps {
  className?: string
  texts: string[]
  scrollRange?: number
  controlledScroll?: number
}

const Texts: React.FC<Pick<MorphingTextProps, "texts" | "scrollRange" | "controlledScroll">> = ({ texts, scrollRange, controlledScroll }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts, scrollRange, controlledScroll)
  return (
    <>
      <span
        className="absolute inset-0 inline-block w-full whitespace-pre-wrap"
        ref={text1Ref}
      />
      <span
        className="absolute inset-0 inline-block w-full whitespace-pre-wrap"
        ref={text2Ref}
      />
    </>
  )
}

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
)

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  scrollRange = 1000,
  controlledScroll,
}) => (
  <div
    className={cn(
      "relative w-full [filter:url(#threshold)_blur(0.6px)]",
      className
    )}
  >
    <Texts texts={texts} scrollRange={scrollRange} controlledScroll={controlledScroll} />
    <SvgFilters />
  </div>
)
