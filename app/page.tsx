"use client"

import { Scale, Gavel, User2, CheckCircle, Shield, Clock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "AI-Powered Recommendations",
      description: "Get personalized bail eligibility recommendations using advanced AI models",
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Quick Processing",
      description: "Fast and efficient processing of bail applications with automated document preparation",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "Accurate Assessment",
      description: "Precise evaluation of bail eligibility based on case details and legal parameters",
    },
  ]

  const roles = [
    {
      title: "Undertrial Prisoner",
      description: "Access your case details and track your bail status.",
      icon: <User2 className="w-12 h-12 text-emerald-500" />,
      color: "from-emerald-500",
      href: "/prisoner",
      features: [
        // "Case status tracking",
       /* "Document submission",*/
        "Bail eligibility assessment",
        "AI-Powered Legal Explanations",
        /*"Automated eligibility check",*/
      ],
    },
    {
      title: "Legal Aid Provider",
      description: "Manage your clients and provide legal aid services.",
      icon: <Gavel className="w-12 h-12 text-blue-500" />,
      color: "from-blue-500",
      href: "/legal_aid",
      features: [ /*"Document generation"*/  " Bail-Draft generation", "Standardized Filing", /*Legal resource access*/],
    },
    {
      title: "Judicial Authority",
      description: "Oversee cases and manage judicial procedures.",
      icon: <Scale className="w-12 h-12 text-purple-500" />,
      color: "from-purple-500",
      href: "/authority",
      features: ["Case overview dashboard", "Decision support system", "Document verification", /*"Status updates"*/],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-30"
            animate={{
              x: ["0%", "100%", "0%"],
              y: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ["#10B981", "#3B82F6", "#8B5CF6"][Math.floor(Math.random() * 3)]
              }33 0%, transparent 70%)`,
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
            }}
          />
        ))}
      </div>
      

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">Bail Reckoner</div>
          <div className="hidden md:flex space-x-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#roles" className="text-gray-300 hover:text-white transition-colors">
              Roles
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
            About
            </Link>

          </div>
          <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
        <Button variant="outline" className="flex items-center text-white border-white/20 hover:bg-white/10">
          <PlayCircle className="w-5 h-5 mr-2" />
          How It Works
          </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Simplifying Bail Process with AI Technology
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Streamline bail eligibility assessment and document preparation with our AI-powered platform
            </p>
            <a href="#roles">
            <Button size="lg" className="mr-4">
            Get Started
            </Button>
              </a>
              <Link href="/learn-more">
                <Button
                            size="lg"
                                   variant="outline"
                                   className="text-white border-white/20 hover:bg-white/10"
                                      >
                                      Learn More
                                      </Button>
                                      </Link>

          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
            <p className="text-gray-300">Advanced tools and features to streamline the bail process</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
              >
                <div className="bg-white/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Role</h2>
            <p className="text-gray-300">Select your role to access relevant features and services</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={role.href}>
                  <div className="group relative bg-white/5 backdrop-blur-lg rounded-xl p-8 hover:bg-white/10 transition-all duration-300 border border-white/10 h-full">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${role.color} to-transparent`} />
                    <div className="relative z-10">
                      <div className="mb-4">{role.icon}</div>
                      <h3 className="text-2xl font-semibold text-white mb-3">{role.title}</h3>
                      <p className="text-gray-300 mb-6">{role.description}</p>
                      <ul className="space-y-2 mb-6">
                        {role.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-gray-300">
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <span className="inline-flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Streamline Your Bail Process?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our platform and experience the future of bail processing with AI-powered assistance
            </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 max-w-md mx-auto">
 {/* --- Primary Button --- */}
  {/* <Link href="#roles" className="w-full sm:flex-1">
    <Button 
      size="lg" 
      className="w-full h-14 bg-white text-slate-900 hover:bg-slate-200 border-none font-bold text-base"
    >
      Get Started Now
    </Button>
  </Link>
   */}
  {/* --- AI Assistant Button --- */}
 <Link href="/ai-assistant">
    <Button 
      variant="outline" 
      className="w-48 h-11 text-white border-white/20 hover:bg-white/10 flex items-center justify-center text-sm"
    >
      <motion.span 
        animate={{ opacity: [1, 0.5, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mr-2 h-2 w-2 rounded-full bg-emerald-400 shrink-0"
      />
      Try AI Assistant
    </Button>
  </Link>
</div>
          </motion.div>
        </div>
      </section>


      <section id="about" className="relative z-10 py-20 border-t border-white/10 bg-slate-900">
  <div className="container mx-auto px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 shadow-lg"
    >
      <h2 className="text-3xl font-bold text-white mb-4 text-center">About This Project</h2>
      <p className="text-gray-300 text-lg mb-4 text-center">
        This is our <span className="text-emerald-400 font-semibold">Major Project</span>, inspired by a real-world problem statement from the
        <span className="text-blue-400 font-semibold"> Smart India Hackathon (SIH) 2024 Problem Statements</span>. We selected Problem Statement ID <span className="text-amber-400 font-semibold">1702</span>, which focuses on improving the efficiency and transparency of the bail application process through digital transformation.
      </p>
      <p className="text-gray-400 text-base text-center">
        Our platform leverages artificial intelligence to assess bail eligibility, automate documentation, and enhance accessibility for undertrial prisoners, legal aid providers, and judicial authorities. The goal is to reduce delays, ensure fairness, and support the justice system with modern technology.
      </p>
    </motion.div>
  </div>
</section>


      {/* Footer */}
      <footer id="footer" className="relative z-10 border-t border-white/10 py-12">
      
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Bail Reckoner</h3>
              <p className="text-gray-300 text-sm">Simplifying bail processes with AI-powered solutions</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#roles" className="text-gray-300 hover:text-white transition-colors">
                    Roles
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <p className="text-gray-300 text-sm">
                Email: support@bailreckoner.com
                <br />
                Phone: (555) 123-4567A
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-300 text-sm">© {new Date().getFullYear()} Bail Reckoner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div> 
  )
}
