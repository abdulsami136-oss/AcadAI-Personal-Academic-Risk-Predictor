import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictRisk } from '../api'
import Navbar from '../components/Navbar'
import StepProgressBar from '../components/StepProgressBar'

const initialForm = {
  name: '',
  gender: '',
  semester: 1,
  age: 20,
  cgpa: 2.5,
  attendance: 75,
  assignment_rate: 80,
  study_hours: 3,
  financial_status: '',
  part_time_job: '',
  tuition_status: '',
  scholarship: '',
}

const slideVariants = {
  enter: { x: 80, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
}

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-butter/80 text-sm font-medium mb-3">{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <motion.button
            key={opt}
            type="button"
            className={`toggle-btn ${value === opt ? 'active' : ''}`}
            onClick={() => onChange(opt)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function SliderField({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="text-butter/80 text-sm font-medium">{label}</label>
        <motion.span
          key={value}
          className="text-butter font-bold text-lg"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {value}{unit}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-thumb"
      />
    </div>
  )
}

export default function StudentForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!form.name.trim()) return 'Please enter your name.'
      if (!form.gender) return 'Please select your gender.'
      if (form.age < 16 || form.age > 60) return 'Age must be between 16 and 60.'
    }
    if (step === 3) {
      if (!form.financial_status) return 'Please select your financial status.'
      if (!form.part_time_job) return 'Please indicate part-time job status.'
      if (!form.tuition_status) return 'Please select tuition fee status.'
      if (!form.scholarship) return 'Please indicate scholarship status.'
    }
    return null
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const result = await predictRisk(form)
      sessionStorage.setItem('acadai_result', JSON.stringify({ ...result, student: form }))
      navigate('/results')
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar showLinks={false} />
      <div className="max-w-2xl mx-auto px-6 pt-28">
        <motion.h1
          className="text-3xl font-bold text-butter text-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Student Assessment
        </motion.h1>
        <p className="text-white/60 text-center mb-8">Tell us about yourself to get your risk prediction</p>

        <StepProgressBar currentStep={step} />

        <div className="glass-card p-6 sm:p-8 min-h-[420px] relative overflow-hidden">
          {error && (
            <motion.div
              className="flex items-center gap-2 bg-riskHigh/20 border border-riskHigh/40 text-riskHigh rounded-xl px-4 py-3 mb-6 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-butter mb-6">Personal Information</h2>
                <div className="mb-6">
                  <label className="block text-butter/80 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
                <ToggleGroup label="Gender" options={['Male', 'Female']} value={form.gender} onChange={(v) => update('gender', v)} />
                <div className="mb-6">
                  <label className="block text-butter/80 text-sm font-medium mb-2">Semester (1–8)</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`toggle-btn w-10 h-10 flex items-center justify-center ${form.semester === s ? 'active' : ''}`}
                        onClick={() => update('semester', s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-butter/80 text-sm font-medium mb-2">Age</label>
                  <input
                    type="number"
                    className="input-field"
                    min={16}
                    max={60}
                    value={form.age}
                    onChange={(e) => update('age', parseInt(e.target.value) || 20)}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-butter mb-6">Academic Performance</h2>
                <SliderField label="CGPA" value={form.cgpa} onChange={(v) => update('cgpa', v)} min={0} max={4} step={0.1} />
                <SliderField label="Attendance" value={form.attendance} onChange={(v) => update('attendance', v)} min={0} max={100} unit="%" />
                <SliderField label="Assignment Completion" value={form.assignment_rate} onChange={(v) => update('assignment_rate', v)} min={0} max={100} unit="%" />
                <SliderField label="Study Hours Per Day" value={form.study_hours} onChange={(v) => update('study_hours', v)} min={0} max={12} step={0.5} unit=" hrs" />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-butter mb-6">Financial & Personal</h2>
                <ToggleGroup label="Financial Status" options={['Stable', 'Moderate', 'Struggling']} value={form.financial_status} onChange={(v) => update('financial_status', v)} />
                <ToggleGroup label="Part-time Job" options={['Yes', 'No']} value={form.part_time_job} onChange={(v) => update('part_time_job', v)} />
                <ToggleGroup label="Tuition Fee Status" options={['Paid', 'Pending', 'Overdue']} value={form.tuition_status} onChange={(v) => update('tuition_status', v)} />
                <ToggleGroup label="Scholarship" options={['Yes', 'No']} value={form.scholarship} onChange={(v) => update('scholarship', v)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-butter/10">
            {step > 1 ? (
              <motion.button type="button" className="btn-outline flex items-center gap-2" onClick={() => setStep((s) => s - 1)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            ) : <div />}
            {step < 3 ? (
              <motion.button type="button" className="btn-primary flex items-center gap-2" onClick={handleNext} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Next <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                className="btn-primary flex items-center gap-2 min-w-[180px] justify-center"
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Predict My Risk'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
