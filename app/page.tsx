"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { Upload, FileAudio, Play, Pause, RotateCcw, Loader2, Zap, Brain, Waves, Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WaveformVisualizer } from "@/components/waveform-visualizer"
import { EmotionDisplay } from "@/components/emotion-display"

interface EmotionResult {
  emotion: string
  confidence: number
  processing_time: number
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function EchoMind() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.type.includes("wav") && !file.name.toLowerCase().endsWith(".wav")) {
      return "Invalid format. Please use a .wav audio file"
    }
    if (file.size > 25 * 1024 * 1024) {
      return "File too large. Maximum size is 25MB"
    }
    return null
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setError(null)
    setResult(null)

    const url = URL.createObjectURL(selectedFile)
    setAudioUrl(url)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const analyzeEmotion = async () => {
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio_file", file)

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Neural analysis failed. Please ensure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const recordedFile = new File([audioBlob], "recording.wav", { type: "audio/wav" })
        handleFileSelect(recordedFile)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
    } catch (err) {
      setError("Microphone access denied or not available.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const resetInterface = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setIsPlaying(false)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>

      <motion.div
        className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center space-y-6 mb-12 w-full" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-500/20 border border-blue-500/30 backdrop-blur-sm" whileHover={{ scale: 1.05, rotate: 5 }}>
              <Brain className="h-8 w-8 text-blue-400" />
            </motion.div>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}>
              <Zap className="h-6 w-6 text-emerald-400" />
            </motion.div>
            <motion.div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm" whileHover={{ scale: 1.05, rotate: -5 }}>
              <Waves className="h-8 w-8 text-emerald-400" />
            </motion.div>
          </div>
          <h1 className="text-5xl md:text-6xl font-orbitron font-bold bg-gradient-to-r from-blue-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            EchoMind
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Advanced neural speech analysis for real-time emotion recognition
          </p>
          <motion.div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-emerald-500 mx-auto rounded-full" initial={{ width: 0 }} animate={{ width: 128 }} transition={{ duration: 1, delay: 0.5 }} />
        </motion.div>

        {/* Dashboard Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input & Waveform */}
          <motion.div className="lg:col-span-5 space-y-6" variants={cardVariants} initial="hidden" animate="visible">
            <Card className="glassmorphic-card border-slate-700/50 backdrop-blur-xl bg-slate-900/40 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
              <div className="p-8 relative z-10">
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                      <div
                        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${isDragging ? "border-sky-500 bg-sky-500/10 scale-[1.02]" : "border-slate-600 hover:border-slate-500"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <motion.div className="space-y-6" animate={isDragging ? { scale: 1.05 } : { scale: 1 }}>
                          <div className="flex justify-center">
                            <div className={`p-6 rounded-full bg-gradient-to-br transition-all duration-300 ${isDragging ? "from-sky-500/30 to-blue-500/30 border-2 border-sky-500/50" : "from-slate-700/50 to-slate-600/50 border-2 border-slate-600/50"}`}>
                              <Upload className={`h-10 w-10 transition-colors ${isDragging ? "text-sky-400" : "text-slate-400"}`} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-white">Upload Audio</h3>
                            <p className="text-slate-400 text-sm">Drag & drop or click to browse</p>
                          </div>
                          <Button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 w-full py-6 rounded-xl shadow-lg">
                            Select File
                          </Button>
                        </motion.div>
                        <input ref={fileInputRef} type="file" accept=".wav,audio/wav" onChange={handleFileInputChange} className="hidden" />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="h-px bg-slate-700 flex-1"></div>
                        <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">OR</span>
                        <div className="h-px bg-slate-700 flex-1"></div>
                      </div>

                      <div className="flex justify-center">
                        {!isRecording ? (
                          <Button onClick={startRecording} className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-red-500/20 py-6 rounded-xl text-lg group">
                            <Mic className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                            Record with Microphone
                          </Button>
                        ) : (
                          <Button onClick={stopRecording} className="w-full bg-slate-800 border-2 border-red-500 text-red-400 hover:bg-red-500/10 py-6 rounded-xl text-lg animate-pulse">
                            <Square className="h-5 w-5 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="file-info" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <div className="flex items-center space-x-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/30">
                          <FileAudio className="h-6 w-6 text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-md truncate">{file.name}</h4>
                          <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button onClick={resetInterface} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl">
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                      </div>

                      {audioUrl && (
                        <div className="space-y-4">
                          <WaveformVisualizer audioUrl={audioUrl} isPlaying={isPlaying} onPlayPause={toggleAudioPlayback} />
                          <div className="flex justify-center mt-4">
                            <Button onClick={toggleAudioPlayback} variant="outline" className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700 rounded-xl w-full">
                              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                              {isPlaying ? "Pause Preview" : "Play Preview"}
                            </Button>
                            <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Right Column: Analysis Action & Results */}
          <motion.div className="lg:col-span-7 flex flex-col justify-center h-full min-h-[400px] relative" variants={cardVariants} initial="hidden" animate="visible">
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-0 w-full mb-4">
                  <Card className="border-red-500/50 bg-red-500/10 backdrop-blur-sm p-4 text-center">
                    <p className="text-red-400 font-medium">{error}</p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && file && (
              <motion.div className="flex justify-center items-center h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Button
                  onClick={analyzeEmotion}
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/25 transition-all duration-300 px-12 py-8 text-2xl font-semibold rounded-3xl w-full max-w-md ${isLoading ? "animate-pulse shadow-xl shadow-emerald-500/40" : "hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02]"}`}
                >
                  {isLoading ? (
                    <motion.div className="flex items-center" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                      <Loader2 className="h-8 w-8 mr-4 animate-spin" />
                      Processing...
                    </motion.div>
                  ) : (
                    <>
                      <Brain className="h-8 w-8 mr-4" />
                      Analyze Neural Patterns
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Results Component */}
            <AnimatePresence>
              {result && (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full">
                  <EmotionDisplay result={result} onReset={resetInterface} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {!file && !result && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-50">
                <Brain className="h-16 w-16" />
                <p className="text-lg">Awaiting audio input...</p>
              </div>
            )}
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}
