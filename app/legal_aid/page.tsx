"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { User, Briefcase, FileText, Wand2, Loader2, Zap, Download, Scale } from "lucide-react";
import Link from "next/link";

// --- Custom Component Definitions ---
interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
}
const Button: React.FC<ButtonProps> = ({ children, onClick, type = "button", disabled = false, className = "" }) => (
    <button 
        type={type} 
        onClick={onClick} 
        disabled={disabled} 
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
    >
        {children}
    </button>
);

const Input = (props: any) => <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />;
const Label = (props: any) => <label {...props} className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" />;
const Textarea = (props: any) => <textarea {...props} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none" />;
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <div className={`rounded-xl border bg-card text-card-foreground shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <div className={`flex flex-col space-y-1.5 p-6 border-b border-border ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <h2 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <div className={`p-6 ${className}`}>{children}</div>;

// --- ANIMATED BACKGROUND COMPONENT ---
const AnimatedBackground = () => (
    <>
        <style jsx global>{`
            :root {
                --color-primary-dark: rgba(var(--primary-rgb), 0.05);
                --color-primary-light: rgba(var(--primary-rgb), 0.1);
                --color-background: #000000;
                --color-secondary: rgba(var(--secondary-rgb), 0.05);
                --primary-rgb: 59, 130, 246;
                --secondary-rgb: 107, 114, 128;
            }
            @keyframes gradient-shift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .animated-bg {
                background: linear-gradient(
                    -45deg, 
                    var(--color-primary-dark), 
                    var(--color-background), 
                    var(--color-primary-light), 
                    var(--color-secondary)
                );
                background-size: 400% 400%;
                animation: gradient-shift 20s ease infinite;
                opacity: 0.1;
            }
        `}</style>
        <div className="animated-bg fixed inset-0 w-full h-full z-0 pointer-events-none" />
    </>
);

// --- MAIN COMPONENT ---
export default function LegalAidProviderPage() {
    // --- STATE MANAGEMENT ---
    const [draftStatus, setDraftStatus] = useState<string>('');
    const [generatedDraft, setGeneratedDraft] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    
    // Form Inputs 
    const [lawyerName, setLawyerName] = useState("Adv. [Lawyer Name]");
    const [clientNameInput, setClientNameInput] = useState("");
    const [caseDetailsInput, setCaseDetailsInput] = useState("");
    
    // --- DOCUMENT GENERATION HANDLER ---
    const handleGenerateDocument = async () => {
        if (!lawyerName || lawyerName.trim() === '' || lawyerName === 'Adv. [Lawyer Name]') {
            setDraftStatus('❌ Please enter your Lawyer Name.');
            return;
        }
        if (!clientNameInput.trim() || !caseDetailsInput.trim()) {
             setDraftStatus('❌ Client Name and Offense Details cannot be empty.');
            return;
        }

        setIsGenerating(true);
        setDraftStatus(`Generating draft for ${clientNameInput} using Gemini LLM...`);
        setGeneratedDraft('');
        
        const generationPayload = {
            client_name: clientNameInput,
            lawyer_name: lawyerName,
            offense_details: caseDetailsInput, 
            doc_type: 'Bail Application Draft' 
        };
        
        try {
            // FIX: Using absolute URL to target Flask backend on port 5000
            const response = await axios.post(`http://localhost:5000/generate_document`, generationPayload);
            const draft = response.data.generated_document;
            
            if (!draft) {
                throw new Error("LLM returned an empty or invalid document.");
            }

            setGeneratedDraft(draft);
            setDraftStatus(`✅ Draft generated successfully!`);
            
        } catch (error) {
            const message = axios.isAxiosError(error) 
                ? error.response?.data?.details || error.response?.data?.error || error.message
                : 'An unknown error occurred.';
            setDraftStatus(`❌ Error generating document: ${message}`);
            setGeneratedDraft('Error generating draft. See status above.');
            
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- DOWNLOAD DRAFT ---
    const handleDownload = () => {
        if (!generatedDraft) return;

        const filename = `${clientNameInput.replace(/ /g, '_')}_Bail_Draft.txt`;
        const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`relative min-h-screen bg-background text-foreground font-sans`}> 
            <AnimatedBackground />

            {/* Hero Section */}
            <section className="relative z-10 py-8 md:py-10 bg-secondary/20 border-b border-border">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-5xl font-bold text-primary mb-1 leading-tight">
                            Accelerate Justice with AI Case Management
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Instantly review client eligibility and generate professional legal drafts.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- UPDATED LEGAL AID FEATURES SECTION --- */}
{/* --- COMPACT FEATURE SECTION WITH LIGHTING & LARGE FONTS --- */}
<div className="flex flex-wrap justify-center gap-10 mb-16 relative z-10">
  {[
    {
      title: "Automated Judicial Synthesis",
      desc: "Instantly compile complex case facts into standardized legal formats.",
      icon: <FileText className="w-6 h-6" />,
      glow: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:border-blue-500/50"
    },
    {
      title: "Smart Statutory Mapping",
      desc: "Direct alignment of case details with BNS Section 479 eligibility requirements.",
      icon: <Scale className="w-6 h-6" />,
      glow: "hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:border-emerald-500/50"
    }
  ].map((feature, idx) => (
    <div 
      key={idx} 
      className={`flex flex-col items-center text-center p-8 rounded-2xl bg-[#1e293b]/60 border border-white/10 w-full max-w-[280px] min-h-[260px] transition-all duration-500 group cursor-default ${feature.glow}`}
    >
      {/* Lighting Effect Icon Box */}
      <div className="mb-6 p-4 rounded-xl bg-white/5 text-blue-400 group-hover:bg-blue-500/10 group-hover:text-white transition-all duration-300 shadow-inner">
        {feature.icon}
      </div>
      
      {/* Larger Heading Font matching your request */}
      <h3 className="text-xl font-bold text-white mb-4 px-2 leading-tight tracking-tight group-hover:text-blue-300 transition-colors">
        {feature.title}
      </h3>
      
      <p className="text-sm text-gray-400 leading-relaxed px-2 font-medium">
        {feature.desc}
      </p>
    </div>
  ))}
</div>
            {/* DASHBOARD CONTENT (Sidebar removed, centered layout) */}
            <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-250px)] relative z-10">
                <div className="max-w-4xl mx-auto h-full">
                    {/* MAIN PANEL: DOCUMENT GENERATOR */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 size={20} className="text-primary" /> Document Generation
                            </CardTitle>
                            <p className="text-muted-foreground pt-2">Generate a legal draft using manual input.</p>
                        </CardHeader>
                        <CardContent>
                            {/* INPUT FORM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <Label htmlFor="lawyerName" className="flex items-center gap-2"><Briefcase size={16}/>Lawyer Name</Label>
                                    <Input id="lawyerName" placeholder="Your Name" value={lawyerName} onChange={(e: any) => setLawyerName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clientNameInput" className="flex items-center gap-2"><User size={16}/>Client Name</Label>
                                    <Input id="clientNameInput" placeholder="Client Name" value={clientNameInput} onChange={(e: any) => setClientNameInput(e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="caseDetailsInput" className="flex items-center gap-2"><FileText size={16}/>Offense / Details</Label>
                                    <Input id="caseDetailsInput" placeholder="Section 302 IPC, NDPS" value={caseDetailsInput} onChange={(e: any) => setCaseDetailsInput(e.target.value)} />
                                </div>
                            </div>

                            {/* GENERATE BUTTON */}
                            <Button
                                onClick={handleGenerateDocument}
                                disabled={isGenerating || !lawyerName.trim() || lawyerName === 'Adv. [Lawyer Name]' || !clientNameInput.trim() || !caseDetailsInput.trim()}
                                className="w-full text-lg font-semibold bg-emerald-600 text-primary-foreground hover:bg-primary/90 h-12 shadow-md mb-4"
                            >
                                {isGenerating ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <Zap className="mr-2 h-5 w-5" />
                                )}
                                Generate Bail Application Draft
                            </Button>

                            {draftStatus && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`text-sm font-medium p-3 rounded-md mb-4 ${draftStatus.startsWith('✅') ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}
                                >
                                    {draftStatus}
                                </motion.p>
                            )}

                            {/* GENERATED DRAFT OUTPUT */}
                            <AnimatePresence mode="wait">
                                {generatedDraft && (
                                    <motion.div
                                        key="draft"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden mt-6"
                                    >
                                        <h3 className="text-xl font-semibold mb-3 text-emerald-400 flex items-center justify-between">
                                            <span className="flex items-center gap-2"><FileText size={20} /> Generated Document</span>
                                           <Button onClick={handleDownload} className="w-48 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-12 shadow-md mb-4">
                                                <Download className="w-4 h-4 mr-1" /> Download .txt
                                                        </Button>
                                        </h3>
                                        <Textarea
                                            readOnly
                                            value={generatedDraft}
                                            rows={15}
                                            className="whitespace-pre-wrap bg-secondary border-secondary/50 text-foreground font-mono text-xs"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </div>
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
  
    );
}