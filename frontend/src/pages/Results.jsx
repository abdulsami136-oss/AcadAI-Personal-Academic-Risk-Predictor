import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { CheckCircle2, Download, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import jsPDF from 'jspdf'
import GlassCard from '../components/GlassCard'
import Navbar from '../components/Navbar'
import RiskMeter from '../components/RiskMeter'
import TypewriterText from '../components/TypewriterText'

const RISK_COLORS = { LOW: '#4ade80', MEDIUM: '#fbbf24', HIGH: '#f87171' }

const nextSteps = [
  'Review your AI-generated advice carefully',
  'Set weekly academic goals based on your weak areas',
  'Meet with your academic advisor this week',
  'Track your attendance and assignment completion daily',
  'Re-assess your risk after one month of improvements',
]

export default function Results() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const reportRef = useRef(null)
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('acadai_result')
    if (!stored) {
      navigate('/form')
      return
    }
    setResult(JSON.parse(stored))
    setTimeout(() => setChartReady(true), 500)
  }, [navigate])

  useEffect(() => {
    if (result?.risk_label === 'LOW') {
      const end = Date.now() + 3000
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#4ade80', '#ffefb3', '#ffffff'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#4ade80', '#ffefb3', '#ffffff'],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [result])

  const downloadPDF = () => {
    if (!result) return
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('AcadAI — Risk Assessment Report', 20, 25)
    doc.setFontSize(12)
    doc.text(`Student: ${result.student?.name || 'N/A'}`, 20, 40)
    doc.text(`Risk Score: ${result.risk_score}%`, 20, 50)
    doc.text(`Risk Level: ${result.risk_label}`, 20, 60)
    doc.text('Contributing Factors:', 20, 75)
    result.factors?.forEach((f, i) => {
      doc.text(`  ${i + 1}. ${f.factor} (${f.direction} risk) — Impact: ${f.impact}`, 20, 85 + i * 10)
    })
    doc.text('AI Advice:', 20, 130)
    result.advice?.forEach((a, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${a}`, 170)
      doc.text(lines, 20, 140 + i * 20)
    })
    doc.save('acadai-risk-report.pdf')
  }

  if (!result) return null

  const chartData = (result.factors || []).map((f) => ({
    name: f.factor.length > 18 ? f.factor.slice(0, 18) + '…' : f.factor,
    impact: chartReady ? f.impact : 0,
    direction: f.direction,
  }))

  const color = RISK_COLORS[result.risk_label] || RISK_COLORS.MEDIUM

  return (
    <div className="min-h-screen pb-20" ref={reportRef}>
      <Navbar showLinks={false} />
      <div className="max-w-4xl mx-auto px-6 pt-28">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-butter mb-2">Your Risk Assessment</h1>
          <p className="text-white/60">Hello, {result.student?.name}! Here are your personalized results.</p>
        </motion.div>

        {/* Risk Meter */}
        <motion.div
          className="glass-card p-8 flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RiskMeter score={result.risk_score} label={result.risk_label} />
          <motion.div
            className="mt-4 px-8 py-3 rounded-full text-lg font-black tracking-widest"
            style={{
              color,
              backgroundColor: `${color}20`,
              border: `2px solid ${color}`,
              boxShadow: `0 0 30px ${color}40`,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {result.risk_label} RISK
          </motion.div>
        </motion.div>

        {/* Factors Chart */}
        <GlassCard className="mb-8" delay={0.3}>
          <h2 className="text-xl font-bold text-butter mb-6">Top Contributing Factors</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" stroke="rgba(255,239,179,0.4)" />
              <YAxis type="category" dataKey="name" width={140} stroke="rgba(255,239,179,0.4)" tick={{ fill: '#ffefb3', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#013e37', border: '1px solid rgba(255,239,179,0.2)', borderRadius: 8 }}
                labelStyle={{ color: '#ffefb3' }}
              />
              <Bar dataKey="impact" radius={[0, 8, 8, 0]} animationDuration={1500}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.direction === 'increases' ? '#f87171' : '#4ade80'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* AI Advice */}
        <GlassCard className="mb-8" delay={0.4}>
          <h2 className="text-xl font-bold text-butter mb-6">AI Academic Advice</h2>
          <TypewriterText texts={result.advice || []} speed={25} pauseBetween={1200} />
        </GlassCard>

        {/* Next Steps */}
        <GlassCard className="mb-8" delay={0.5}>
          <h2 className="text-xl font-bold text-butter mb-6">What To Do Next</h2>
          <ul className="space-y-4">
            {nextSteps.map((item, i) => (
              <motion.li
                key={item}
                className="flex items-center gap-3 text-white/80"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                <CheckCircle2 className="w-5 h-5 text-riskLow flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button className="btn-primary flex items-center justify-center gap-2" onClick={() => navigate('/form')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RefreshCw className="w-5 h-5" /> Check Again
          </motion.button>
          <motion.button className="btn-outline flex items-center justify-center gap-2" onClick={downloadPDF} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Download className="w-5 h-5" /> Download PDF
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
