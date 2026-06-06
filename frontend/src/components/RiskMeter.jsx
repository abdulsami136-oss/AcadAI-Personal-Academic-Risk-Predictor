import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

const RISK_COLORS = {
  LOW: '#4ade80',
  MEDIUM: '#fbbf24',
  HIGH: '#f87171',
}

export default function RiskMeter({ score = 0, label = 'LOW', duration = 2 }) {
  const animatedScore = useMotionValue(0)
  const displayScore = useTransform(animatedScore, (v) => Math.round(v))

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const color = RISK_COLORS[label] || RISK_COLORS.MEDIUM

  useEffect(() => {
    animate(animatedScore, score, { duration, ease: 'easeOut' })
  }, [score, duration, animatedScore])

  const strokeOffset = useTransform(
    animatedScore,
    (v) => circumference - (v / 100) * circumference * 0.75
  )

  return (
    <div className="relative flex flex-col items-center">
      <svg width="240" height="200" viewBox="0 0 240 200" className="drop-shadow-glow">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 30 160 A 90 90 0 1 1 210 160"
          fill="none"
          stroke="rgba(255,239,179,0.1)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d="M 30 160 A 90 90 0 1 1 210 160"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          style={{ strokeDashoffset: strokeOffset, filter: 'url(#glow)' }}
        />
      </svg>
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.span className="text-5xl font-black text-white tabular-nums">
          {displayScore}
        </motion.span>
        <span className="text-2xl font-bold text-butter/60">%</span>
        <p className="text-butter/50 text-sm mt-1">Dropout Risk</p>
      </div>
    </div>
  )
}
