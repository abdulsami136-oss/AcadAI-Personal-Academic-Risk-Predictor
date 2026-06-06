import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Download,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { exportCSV, getOverview, getStudents } from '../api'
import AnimatedCounter from '../components/AnimatedCounter'

const RISK_COLORS = { LOW: '#4ade80', MEDIUM: '#fbbf24', HIGH: '#f87171' }
const FILTERS = ['All', 'Low', 'Medium', 'High']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('acadai_token')

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/admin'); return }
    try {
      const riskFilter = filter === 'All' ? null : filter.toUpperCase()
      const [ov, st] = await Promise.all([
        getOverview(token),
        getStudents(token, 1, riskFilter),
      ])
      setOverview(ov)
      setStudents(st.items)
    } catch {
      localStorage.removeItem('acadai_token')
      navigate('/admin')
    } finally {
      setLoading(false)
    }
  }, [token, filter, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = () => {
    localStorage.removeItem('acadai_token')
    navigate('/admin')
  }

  const handleExport = async () => {
    try { await exportCSV(token) } catch { /* ignore */ }
  }

  if (loading || !overview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-butter/30 border-t-butter rounded-full animate-spin" />
      </div>
    )
  }

  const pieData = [
    { name: 'Low', value: overview.low_risk, color: RISK_COLORS.LOW },
    { name: 'Medium', value: overview.medium_risk, color: RISK_COLORS.MEDIUM },
    { name: 'High', value: overview.high_risk, color: RISK_COLORS.HIGH },
  ].filter((d) => d.value > 0)

  const cgpaBuckets = { '0-1': 0, '1-2': 0, '2-3': 0, '3-4': 0 }
  students.forEach((s) => {
    if (s.cgpa < 1) cgpaBuckets['0-1']++
    else if (s.cgpa < 2) cgpaBuckets['1-2']++
    else if (s.cgpa < 3) cgpaBuckets['2-3']++
    else cgpaBuckets['3-4']++
  })
  const cgpaData = Object.entries(cgpaBuckets).map(([range, count]) => ({ range, count }))

  const cards = [
    { label: 'Total Submissions', value: overview.total_submissions, icon: Users, color: 'text-butter' },
    { label: 'High Risk Students', value: overview.high_risk, icon: AlertTriangle, color: 'text-riskHigh' },
    { label: 'Average CGPA', value: overview.average_cgpa, icon: TrendingUp, color: 'text-riskLow', decimals: 2 },
    { label: 'Average Attendance', value: overview.average_attendance, icon: LayoutDashboard, color: 'text-riskMedium', suffix: '%', decimals: 1 },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        className="w-64 glass-card m-4 p-6 flex flex-col hidden lg:flex"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-2 mb-10">
          <GraduationCap className="w-8 h-8 text-butter" />
          <span className="text-xl font-bold text-butter">AcadAI</span>
        </div>
        <nav className="flex-1 space-y-2">
          <span className="flex items-center gap-3 px-4 py-3 rounded-xl bg-butter/10 text-butter font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </span>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-butter/60 hover:text-butter hover:bg-butter/5 transition-colors">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-butter">Admin Dashboard</h1>
          <div className="flex gap-3 lg:hidden">
            <button onClick={handleExport} className="btn-outline text-sm py-2 px-3"><Download className="w-4 h-4" /></button>
            <button onClick={handleLogout} className="btn-outline text-sm py-2 px-3"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-2xl font-black text-white">
                <AnimatedCounter value={card.value} suffix={card.suffix || ''} decimals={card.decimals || 0} />
              </p>
              <p className="text-butter/60 text-sm mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-butter mb-4">Risk Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" animationDuration={1200}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#013e37', border: '1px solid rgba(255,239,179,0.2)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-white/40 text-center py-16">No data yet</p>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((d) => (
                <span key={d.name} className="flex items-center gap-1.5 text-sm text-white/70">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-butter mb-4">CGPA Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cgpaData}>
                <XAxis dataKey="range" stroke="rgba(255,239,179,0.4)" tick={{ fill: '#ffefb3' }} />
                <YAxis stroke="rgba(255,239,179,0.4)" tick={{ fill: '#ffefb3' }} />
                <Tooltip contentStyle={{ background: '#013e37', border: '1px solid rgba(255,239,179,0.2)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#ffefb3" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-butter">All Submissions</h3>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setLoading(true) }}
                  className={`toggle-btn text-sm py-1.5 px-3 ${filter === f ? 'active' : ''}`}
                >
                  {f}
                </button>
              ))}
              <button onClick={handleExport} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5 hidden lg:flex">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-butter/10 text-butter/60">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">CGPA</th>
                  <th className="text-left py-3 px-2">Attendance</th>
                  <th className="text-left py-3 px-2">Risk Score</th>
                  <th className="text-left py-3 px-2">Risk Label</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-white/40">No submissions yet</td></tr>
                ) : (
                  students.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      className="border-b border-butter/5 hover:bg-butter/5 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="py-3 px-2 text-white">{s.name}</td>
                      <td className="py-3 px-2 text-white/80">{s.cgpa}</td>
                      <td className="py-3 px-2 text-white/80">{s.attendance}%</td>
                      <td className="py-3 px-2 text-white font-medium">{s.risk_score}%</td>
                      <td className="py-3 px-2">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ color: RISK_COLORS[s.risk_label], backgroundColor: `${RISK_COLORS[s.risk_label]}20` }}
                        >
                          {s.risk_label}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white/60">{new Date(s.created_at).toLocaleDateString()}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
