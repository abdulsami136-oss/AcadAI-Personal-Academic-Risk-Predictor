import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Brain, ClipboardList, Globe, Shield, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter'
import GlassCard from '../components/GlassCard'
import Navbar from '../components/Navbar'
import ParticleBackground from '../components/ParticleBackground'

const steps = [
  { icon: ClipboardList, title: 'Fill Your Details', desc: 'Complete a beautiful 3-step form with your academic and personal information.' },
  { icon: Brain, title: 'AI Analyzes Risk', desc: 'Our Random Forest ML model evaluates 12 key factors to calculate your dropout risk.' },
  { icon: Sparkles, title: 'Get Personalized Advice', desc: 'Receive 5 tailored AI-powered suggestions from DeepSeek to help you succeed.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <ParticleBackground />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-butter/80 text-sm mb-6">
              Powered by Machine Learning & DeepSeek AI
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-butter leading-tight mb-6">
              Know Your Academic Risk Before It&apos;s Too Late
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              AcadAI uses machine learning to predict your dropout risk and gives you personalized AI advice to succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/form" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                Check My Risk Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/admin" className="btn-outline inline-flex items-center justify-center gap-2 text-lg">
                Admin Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { value: 300, suffix: 'M+', label: 'Students At Risk Globally', prefix: '' },
            { value: 94, suffix: '%', label: 'Prediction Accuracy', prefix: '' },
            { value: 5, suffix: '', label: 'Personalized AI Tips', prefix: '' },
          ].map((stat, i) => (
            <GlassCard key={stat.label} delay={i * 0.15} className="text-center py-8">
              <p className="text-4xl sm:text-5xl font-black text-butter mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-white/70 font-medium">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-butter text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <GlassCard key={step.title} delay={i * 0.15} className="text-center group hover:shadow-glow transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-butter/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-butter" />
              </div>
              <h3 className="text-xl font-bold text-butter mb-2">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SDG & Vision */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center py-10">
            <div className="flex justify-center mb-4">
              <Globe className="w-12 h-12 text-butter" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-butter mb-4">
              Aligned with SDG 4 — Quality Education
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed">
              AcadAI supports United Nations Sustainable Development Goal 4 by leveraging technology
              to improve educational outcomes and reduce dropout rates worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Vision 2030: Digital Education', 'Vision 2035: Inclusive Higher Ed', 'SDG 4 Badge'].map((badge) => (
                <span key={badge} className="px-4 py-2 rounded-full bg-butter/10 border border-butter/20 text-butter text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {badge}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center glass-card py-12 px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <BarChart3 className="w-12 h-12 text-butter mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-butter mb-4">Ready to Take Control?</h2>
          <p className="text-white/70 mb-8">Your academic future starts with one click.</p>
          <Link to="/form" className="btn-primary inline-flex items-center gap-2">
            Start Your Assessment <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-butter/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-butter/60 text-sm">
          <p className="font-semibold text-butter">AcadAI — Personal Academic Risk Predictor</p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-butter transition-colors">
            GitHub
          </a>
          <p>Built with ❤️ for SDG 4</p>
        </div>
      </footer>
    </div>
  )
}
