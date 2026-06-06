import { motion } from 'framer-motion'
import { AlertCircle, GraduationCap, Loader2, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminLogin } from '../api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminLogin(email, password)
      localStorage.setItem('acadai_token', data.access_token)
      navigate('/admin/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md glass-card p-8"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <GraduationCap className="w-12 h-12 text-butter mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-butter">Admin Login</h1>
          <p className="text-white/60 text-sm mt-1">Access the AcadAI dashboard</p>
        </div>

        {error && (
          <motion.div
            className="flex items-center gap-2 bg-riskHigh/20 border border-riskHigh/40 text-riskHigh rounded-xl px-4 py-3 mb-6 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-butter/80 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-butter/40" />
              <input
                type="email"
                className="input-field pl-11"
                placeholder="admin@acadai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-butter/80 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-butter/40" />
              <input
                type="password"
                className="input-field pl-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <motion.button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</> : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-butter/50 text-sm mt-6">
          <Link to="/" className="hover:text-butter transition-colors">← Back to Home</Link>
        </p>
      </motion.div>
    </div>
  )
}
