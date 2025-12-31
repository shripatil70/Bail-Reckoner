"use client"
import { motion } from "framer-motion"

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen filter blur-[120px] opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: '600px',
            height: '600px',
            background: i === 0 ? '#10B981' : i === 1 ? '#3B82F6' : '#8B5CF6',
            left: `${i * 30}%`,
            top: `${i * 20}%`,
          }}
        />
      ))}
    </div>
  )
}