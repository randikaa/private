"use client"

import { MorphingText } from "./morphing-text"

interface TextPair {
  heading: string
  subtext: string
}

interface MorphingTextGroupProps {
  textPairs: TextPair[]
  scrollRange?: number
  controlledScroll?: number
}

export const MorphingTextGroup: React.FC<MorphingTextGroupProps> = ({
  textPairs,
  scrollRange = 2000,
  controlledScroll,
}) => {
  const headings = textPairs.map(pair => pair.heading)
  const subtexts = textPairs.map(pair => pair.subtext)

  return (
    <div>
      <div className="relative h-[200px]">
        <MorphingText
          texts={headings}
          className="text-8xl font-bold text-white font-primary text-left leading-[0.9]"
          scrollRange={scrollRange}
          controlledScroll={controlledScroll}
        />
      </div>
      <div className="relative h-[60px] mt-4">
        <MorphingText
          texts={subtexts}
          className="text-lg text-white font-secondary text-left leading-normal"
          scrollRange={scrollRange}
          controlledScroll={controlledScroll}
        />
      </div>
    </div>
  )
}
