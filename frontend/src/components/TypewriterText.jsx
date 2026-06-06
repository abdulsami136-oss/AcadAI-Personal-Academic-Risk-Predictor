import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function TypewriterText({ texts = [], speed = 30, pauseBetween = 800 }) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')

  useEffect(() => {
    if (displayIndex >= texts.length) return

    const fullText = texts[displayIndex]
    if (charIndex < fullText.length) {
      const timer = setTimeout(() => {
        setCurrentText(fullText.slice(0, charIndex + 1))
        setCharIndex((c) => c + 1)
      }, speed)
      return () => clearTimeout(timer)
    }

    const pauseTimer = setTimeout(() => {
      setDisplayIndex((d) => d + 1)
      setCharIndex(0)
      setCurrentText('')
    }, pauseBetween)
    return () => clearTimeout(pauseTimer)
  }, [charIndex, displayIndex, texts, speed, pauseBetween])

  return (
    <div className="space-y-4">
      {texts.slice(0, displayIndex).map((text, i) => (
        <motion.div
          key={i}
          className="flex gap-3 items-start"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-butter/20 text-butter text-sm font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <p className="text-white/90 leading-relaxed">{text}</p>
        </motion.div>
      ))}
      {displayIndex < texts.length && currentText && (
        <motion.div
          className="flex gap-3 items-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-butter/20 text-butter text-sm font-bold flex items-center justify-center">
            {displayIndex + 1}
          </span>
          <p className="text-white/90 leading-relaxed">
            {currentText}
            <motion.span
              className="inline-block w-0.5 h-5 bg-butter ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </p>
        </motion.div>
      )}
    </div>
  )
}
