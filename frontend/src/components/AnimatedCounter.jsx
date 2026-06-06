import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function AnimatedCounter({ value, suffix = '', prefix = '', duration = 2, decimals = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (decimals > 0) return v.toFixed(decimals)
    return Math.round(v).toLocaleString()
  })

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration, ease: 'easeOut' })
    }
  }, [isInView, value, duration, count])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
