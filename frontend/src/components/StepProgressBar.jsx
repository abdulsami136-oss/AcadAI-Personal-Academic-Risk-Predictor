import { motion } from 'framer-motion'

const steps = ['Personal Info', 'Academic', 'Financial']

export default function StepProgressBar({ currentStep }) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between mb-3">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`text-xs sm:text-sm font-medium transition-colors ${
              i + 1 <= currentStep ? 'text-butter' : 'text-butter/40'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="relative h-2 bg-butter/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-butter/60 to-butter rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
      <p className="text-center text-butter/60 text-sm mt-2">
        Step {currentStep} of {steps.length}
      </p>
    </div>
  )
}
