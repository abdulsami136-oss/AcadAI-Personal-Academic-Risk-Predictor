import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar({ showLinks = true }) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <GraduationCap className="w-8 h-8 text-butter group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold text-butter">AcadAI</span>
        </Link>
        {showLinks && (
          <div className="flex items-center gap-4">
            <Link to="/form" className="text-butter/80 hover:text-butter text-sm font-medium transition-colors hidden sm:block">
              Check Risk
            </Link>
            <Link to="/admin" className="btn-outline text-sm py-2 px-4">
              Admin
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  )
}
