"use client"

import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TextPair {
  heading: string
  subtext: string
}

interface MorphingTextPairProps {
  textPairs: TextPair[]
  scrollRange?: number
  controlledScroll?: number
}

const useMorphingTextPair = (textPairs: TextPair[], scrollRange: number = 1000, controlledScroll?: number) => {
  const heading1Ref = useRef<HTMLDivElement>(null)
  const heading2Ref = useRef<HTMLDivElement>(null)
  const subtext1Ref = useRef<HTMLDivElement>(null)
  const subtext2Ref = useRef<HTMLDivElement>(null)

  const setStyles = useCallback(
    (textIndex: number, fraction: number) => {
      const [h1, h2, s1, s2] = [heading1Ref.current, heading2Ref.current, subtext1Ref.current, subtext2Ref.current]
      if (!h1 || !h2 || !s1 || !s2) return

      const opacity2 = Math.pow(fraction, 0.4)
      const blur2 = Math.min(8 / fraction - 8, 100)
      
      h2.style.filter = `blur(${blur2}px)`
      h2.style.opacity = `${opacity2}`
      s2.style.filter = `blur(${blur2}px)`
      s2.style.opacity = `${opacity2}`

      const invertedFraction = 1 - fraction
      const opacity1 = Math.pow(invertedFraction, 0.4)
      const blur1 = Math.min(8 / invertedFraction - 8, 100)
      
      h1.style.filter = `blur(${blur1}px)`
      h1.style.opacity = `${opacity1}`
      s1.style.filter = `blur(${blur1}px)`
      s1.style.opacity = `${opacity1}`

      const currentPair = textPairs[textIndex % textPairs.length]
      const nextPair = textPairs[(textIndex + 1) % textPairs.length]

      h1.textContent = currentPair.heading
      s1.textContent = currentPair.subtext
      h2.textContent = nextPair.heading
      s2.textContent = nextPair.subtext
    },
    [textPairs]
  )

  useEffect(() => {
    if (controlledScroll !== undefined) {
      const scrollPerText = scrollRange / textPairs.length
      const textIndex = Math.floor(controlledScroll / scrollPerText)
      const fraction = (controlledScroll % scrollPerText) / scrollPerText
      setStyles(textIndex, fraction)
    }
  }, [controlledScroll, textPairs.length, scrollRange, setStyles])

  return { heading1Ref, heading2Ref, subtext1Ref, subtext2Ref }
}

export const MorphingTextPair: React.FC<MorphingTextPairProps> = ({
  textPairs,
  scrollRange = 2000,
  controlledScroll,
}) => {
  const { heading1Ref, heading2Ref, subtext1Ref, subtext2Ref } = useMorphingTextPair(textPairs, scrollRange, controlledScroll)

  return (
    <div className="relative [filter:url(#threshold)_blur(0.6px)]">
      {/* First pair */}
      <div className="absolute inset-0">
        <div ref={heading1Ref} className="text-8xl font-bold text-white font-primary leading-[0.9] whitespace-pre-wrap mb-4" />
        <div ref={subtext1Ref} className="text-lg text-white font-secondary leading-normal whitespace-pre-wrap" />
      </div>
      
      {/* Second pair */}
      <div className="absolute inset-0">
        <div ref={heading2Ref} className="text-8xl font-bold text-white font-primary leading-[0.9] whitespace-pre-wrap mb-4" />
        <div ref={subtext2Ref} className="text-lg text-white font-secondary leading-normal whitespace-pre-wrap" />
      </div>

      <svg id="filters" className="fixed h-0 w-0" preserveAspectRatio="xMidYMid slice">
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
    </div>
  )
}
