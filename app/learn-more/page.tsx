"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle, AlertCircle, ChevronLeft } from "lucide-react"

export default function LearnMore() {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30">
      <motion.main 
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="max-w-xl mx-auto px-6 py-12"
      >
        {/* Back Button */}
        <motion.div variants={itemVars}>
          <Link href="/">
            <Button variant="ghost" className="mb-10 text-slate-400 hover:text-emerald-400 p-0">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Highlighted Main Heading */}
        <motion.h1 variants={itemVars} className="text-4xl font-extrabold text-white mb-6 leading-tight">
          Know Your <span className="text-emerald-400 underline decoration-emerald-500/30 underline-offset-8">Bail Rights</span>
        </motion.h1>

        <motion.p variants={itemVars} className="text-lg text-slate-400 mb-12">
          Simplifying the law for everyone. Our tool helps you understand if you or your loved ones can be released.
        </motion.p>

        {/* Progress Steps */}
        <div className="space-y-4 mb-12">
          {[
            { t: "Step 1: Enter Details", d: "Add case sections and arrest date.", color: "border-emerald-500/20" },
            { t: "Step 2: AI Check", d: "We apply the latest BNS/IPC rules instantly.", color: "border-blue-500/20" },
            { t: "Step 3: Result", d: "Download your pre-filled bail application.", color: "border-purple-500/20" },
          ].map((step, i) => (
            <motion.div 
              key={i}
              variants={itemVars}
              whileHover={{ x: 5 }}
              className={`p-5 rounded-2xl bg-white/[0.03] border ${step.color} backdrop-blur-md`}
            >
              <h3 className="font-bold text-white mb-1">{step.t}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.d}</p>
            </motion.div>
          ))}
        </div>

        {/* The "Layman" Rule Box */}
        <motion.div 
          variants={itemVars}
          className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-3 text-emerald-400">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-sm">The Simple Rule</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            In most cases, if an undertrial has spent <span className="text-white font-bold">half the maximum sentence</span> in jail, they are eligible for bail. We do the math so you don't have to.
          </p>
        </motion.div>
      </motion.main>
    </div>
  )
}