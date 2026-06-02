"use client"

import { motion } from "framer-motion"
import { CheckCircle, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmotionResult {
  emotion: string
  confidence: number
  processing_time: number
}

interface EmotionDisplayProps {
  result: EmotionResult
  onReset: () => void
}

const emotionConfig = {
  happy: {
    color: "from-yellow-400 to-amber-400",
    textColor: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
    emoji: "😊",
    description: "Positive and joyful emotional state detected",
  },
  sad: {
    color: "from-blue-400 to-indigo-400",
    textColor: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    emoji: "😢",
    description: "Melancholic emotional pattern identified",
  },
  angry: {
    color: "from-red-400 to-rose-400",
    textColor: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    emoji: "😠",
    description: "Intense negative emotional state detected",
  },
  fearful: {
    color: "from-purple-400 to-violet-400",
    textColor: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/20",
    emoji: "😨",
    description: "Anxious emotional pattern recognized",
  },
  disgust: {
    color: "from-emerald-400 to-green-400",
    textColor: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    emoji: "🤢",
    description: "Aversive emotional response detected",
  },
  surprised: {
    color: "from-orange-400 to-amber-400",
    textColor: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    emoji: "😲",
    description: "Unexpected emotional reaction identified",
  },
  calm: {
    color: "from-teal-400 to-cyan-400",
    textColor: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "shadow-teal-500/20",
    emoji: "😌",
    description: "Calm and relaxed emotional state detected",
  },
  neutral: {
    color: "from-gray-400 to-slate-400",
    textColor: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    emoji: "😐",
    description: "Balanced emotional state detected",
  },
}

export function EmotionDisplay({ result, onReset }: EmotionDisplayProps) {
  const config = emotionConfig[result.emotion as keyof typeof emotionConfig] || emotionConfig.neutral

  const radius = 35
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * result.confidence)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={`glassmorphic-card h-full border-2 backdrop-blur-xl bg-slate-900/60 shadow-2xl ${config.border} ${config.glow} flex flex-col justify-between overflow-hidden relative`}>
        <div className={`absolute top-0 right-0 w-64 h-64 ${config.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50`}></div>
        
        <div className="p-8 space-y-8 relative z-10">
          <motion.div className="flex items-center space-x-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Neural Analysis Complete</span>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </motion.div>
          </motion.div>

          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div 
              className={`p-6 rounded-full border-2 backdrop-blur-sm ${config.bg} ${config.border} shadow-xl`}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            >
              <motion.div className="text-7xl" animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}>
                {config.emoji}
              </motion.div>
            </motion.div>

            <div className="space-y-2">
              <p className="text-slate-400 text-sm tracking-widest uppercase font-semibold">Primary Emotion</p>
              <motion.h2 className={`text-5xl font-orbitron font-bold capitalize bg-gradient-to-r ${config.color} bg-clip-text text-transparent`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                {result.emotion}
              </motion.h2>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
            
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="transform -rotate-90 w-28 h-28">
                <circle cx="56" cy="56" r="35" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                <motion.circle
                  cx="56" cy="56" r="35" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className={`${config.textColor}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-mono font-bold text-xl text-white">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="space-y-2 text-left flex-1">
              <h4 className="text-white font-semibold text-lg">Confidence Score</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{config.description}</p>
            </div>

          </div>
        </div>

        <div className="p-8 pt-0 relative z-10 flex flex-col space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 px-2">
            <p>Neural Network: CRNN</p>
            {typeof result.processing_time === "number" && (
              <p>Time: {result.processing_time.toFixed(2)}s</p>
            )}
          </div>
          <Button onClick={onReset} className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 shadow-lg py-6 rounded-xl text-lg">
            <RotateCcw className="h-5 w-5 mr-2" />
            Analyze Another File
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
