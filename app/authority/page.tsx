'use client'; 

import React, { useState, useEffect } from 'react';
import { Paperclip, Loader, CheckCircle, Download, Shield, User, Lightbulb, AlertTriangle, FileText, Send } from 'lucide-react'; 
import { motion } from "framer-motion";

// --- TYPE DEFINITIONS ---
interface CaseData {
    id: string;
    prisonerName: string;
    offenseCategory: string;
    prediction_details: {
        probability_bail: number;
        probability_no_bail: number;
        reason: string;
        bail_eligibility: number;
    };
    judicial_status?: string;
}

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
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${className}`}
    >
        {children}
    </button>
);

export default function AuthorityJudgePage() {
    // --- STATE MANAGEMENT ---
    const [cases, setCases] = useState<CaseData[]>([]);
    const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'judge' | 'ai'; text: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [decisionLoading, setDecisionLoading] = useState<'Accepted' | 'Rejected' | null>(null);

    // --- 1. FETCH CASES FROM BACKEND ---
    useEffect(() => {
        const loadCases = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/cases');
                const data = await response.json();
                if (data.cases && data.cases.length > 0) {
                    setCases(data.cases);
                    setSelectedCase(data.cases[0]); 
                }
            } catch (error) {
                console.error("Failed to fetch cases:", error);
            } finally {
                setIsFetching(false);
            }
        };
        loadCases();
    }, []);

    // --- 2. HANDLERS ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCase) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/summarize-pdf', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.summary) {
                setSelectedCase({
                    ...selectedCase,
                    prediction_details: { ...selectedCase.prediction_details, reason: data.summary }
                });
                alert("PDF analysis complete. Summary updated in the chat window.");
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!chatInput || !selectedCase) return;
        
        const newMessages = [...messages, { role: 'judge' as const, text: chatInput }];
        setMessages(newMessages);
        const currentInput = chatInput;
        setChatInput('');

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: currentInput, context: selectedCase }),
            });
            const data = await response.json();
            setMessages([...newMessages, { role: 'ai' as const, text: data.response }]);
        } catch (error) {
            console.error("Chat failed:", error);
        }
    };

    const handleDecision = async (decision: 'Accepted' | 'Rejected') => {
        if (!selectedCase) return;
        setDecisionLoading(decision);
        try {
            const response = await fetch(`http://localhost:5000/api/cases/${selectedCase.id}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: decision }),
            });

            if (response.ok) {
                setSelectedCase({ ...selectedCase, judicial_status: decision });
                setCases(prev => prev.map(c => 
                    c.id === selectedCase.id ? { ...c, judicial_status: decision } : c
                ));
                alert(`Decision Recorded: ${decision}.`);
            }
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setDecisionLoading(null);
        }
    };
    const handleReset = async () => {
    if (!selectedCase) return;
    setLoading(true);
    try {
        const response = await fetch(`http://localhost:5000/api/cases/${selectedCase.id}/reset`, {
            method: 'POST'
        });
        if (response.ok) {
            setSelectedCase({ ...selectedCase, judicial_status: "" });
            setCases(prev => prev.map(c => 
                c.id === selectedCase.id ? { ...c, judicial_status: "" } : c
            ));
            alert("Decision cleared. Buttons are now active.");
        }
    } finally {
        setLoading(false);
    }
};


    const features = [
        { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: "AI-Backed Analysis", description: "View unbiased predictions and risk scores for informed judicial decisions." },
        { icon: <FileText className="w-6 h-6 text-emerald-400" />, title: "Case Document Chatbot", description: "Instantly query and summarize uploaded case documents using the integrated LLM." },
        { icon: <CheckCircle className="w-6 h-6 text-emerald-400" />, title: "Final Decision Record", description: "Securely record the final judgment, instantly notifying Legal Aid and Prisoners." },
        { icon: <User className="w-6 h-6 text-emerald-400" />, title: "Centralized Authority", description: "Maintain a clear, auditable log of all judicial actions and decisions." },
    ];

    if (isFetching) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader className="animate-spin mr-2" /> Loading Judicial Data...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden font-sans text-white">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute opacity-30"
                        animate={{ x: ["0%", "100%", "0%"], y: ["0%", "100%", "0%"] }}
                        transition={{ duration: Math.random() * 10 + 20, repeat: Infinity, ease: "linear" }}
                        style={{
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                            background: `radial-gradient(circle, ${["#10B981", "#3B82F6", "#8B5CF6"][Math.floor(Math.random() * 3)]}33 0%, transparent 70%)`,
                            width: `${Math.random() * 400 + 200}px`, height: `${Math.random() * 400 + 200}px`,
                        }}
                    />
                ))}
            </div>

            {/* --- HEADER --- */}
            <header className="relative z-10 border-b border-white/10">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold">Bail Reckoner (Authority)</div>
                    <div className="hidden md:flex space-x-6 text-gray-300">
                        <a href="/" className="hover:text-emerald-400 transition-colors">Home</a>
                        <a href="#section" className="hover:text-emerald-400 transition-colors">Judge Section</a>
                        <a href="#judicial-features" className="hover:text-emerald-400 transition-colors">Features</a>
                    </div>
                   {/* <Button className="border-white/20 hover:bg-white/10 border bg-transparent text-sm">Logout</Button>*/}
                </nav>
            </header>

            {/* --- HERO SECTION --- */}
            <section className="relative z-10 pt-12 pb-6">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        Enforce Justice with Auditable Authority
                    </motion.h1>
                    <p className="text-xl text-gray-300">Leverage AI insights to finalize decisions and streamline judicial case flow.</p>
                </div>
            </section>
{/* --- JUDICIAL FEATURES GRID --- */}
<section id="judicial-features" className="relative z-10 py-10">
    <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Judicial Platform Features</h2>
            <p className="text-gray-300 text-lg">Essential tools for authority users to manage case flow and decisions.</p>
        </div>
        
        {/* Compact Cards to match Prisoner/Legal Aid style */}
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {[
                { 
                    icon: <Shield className="w-6 h-6 text-emerald-400" />, 
                    title: "AI-Backed Analysis", 
                    description: "View unbiased predictions and risk scores for informed judicial decisions." 
                },
                { 
                    icon: <FileText className="w-6 h-6 text-emerald-400" />, 
                    title: "Case Document Chatbot", 
                    description: "Instantly query and summarize uploaded case documents using the integrated LLM." 
                },
                { 
                    icon: <CheckCircle className="w-6 h-6 text-emerald-400" />, 
                    title: "Final Decision Record", 
                    description: "Securely record the final judgment, instantly notifying Legal Aid and Prisoners." 
                },
                { 
                    icon: <User className="w-6 h-6 text-emerald-400" />, 
                    title: "Centralized Authority", 
                    description: "Maintain a clear, auditable log of all judicial actions and decisions." 
                },
            ].map((feature, index) => (
                <motion.div 
                    key={feature.title} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }} 
                    className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#1e293b]/60 border border-white/10 w-full max-w-[260px] min-h-[280px] transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 group"
                >
                    <div className="mb-6 p-4 rounded-xl bg-white/5 text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 leading-tight tracking-tight">
                        {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                        {feature.description}
                    </p>
                </motion.div>
            ))}
        </div>
    </div>
</section>
            {/* --- MAIN DASHBOARD --- */}
            <section id="section" className="relative z-10 py-8">
                <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
                    
                    {/* SCROLLABLE SIDEBAR */}
                    <aside className="w-full md:w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-[750px]">
                        <h2 className="text-lg font-bold mb-4 text-emerald-400 sticky top-0 bg-transparent pb-2 border-b border-white/10">
                            Prisoner List
                        </h2>
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {cases.map((c) => (
                                <div 
                                    key={c.id}
                                    onClick={() => {setSelectedCase(c); setMessages([]);}}
                                    className={`p-3 rounded-lg cursor-pointer transition border ${
                                        selectedCase?.id === c.id ? 'bg-emerald-600/20 border-emerald-500' : 'hover:bg-white/5 border-transparent'
                                    }`}
                                >
                                    <p className="font-medium text-sm">{c.prisonerName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Status: {c.judicial_status || 'Pending'}</p>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* DASHBOARD CONTENT */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-3xl font-bold mb-8">Judge-Section Dashboard</h2>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* LEFT: CHATBOT */}
                            <div className="flex-1 bg-white/5 rounded-lg p-6 border border-white/10 flex flex-col">
                                <h2 className="text-xl font-semibold text-emerald-400 mb-4 text-center">Chatbot for Decision-Making</h2>
                                <div className="bg-slate-700 p-4 rounded-lg flex flex-col space-y-3 h-[450px]">
                                    <div className="flex justify-end gap-2">
                                        <label className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:bg-emerald-700 cursor-pointer flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Attach Case PDF
                                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                                        </label>
                                    </div>
                                    
                                    <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                        {messages.length === 0 ? (
                                            <div className="bg-slate-800 p-3 rounded-lg max-w-[85%] shadow-sm text-sm text-gray-300">
                                                <strong>Prisoner:</strong> {selectedCase?.prisonerName} <br/>
                                                <strong>Charges:</strong> {selectedCase?.offenseCategory} <br/><br/>
                                                {selectedCase?.prediction_details?.reason || "No summary available."}
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => (
                                                <div key={idx} className={`p-3 rounded-lg text-sm max-w-[85%] ${msg.role === 'judge' ? 'bg-emerald-600/20 self-end ml-auto' : 'bg-slate-800 self-start text-gray-300'}`}>
                                                    {msg.text}
                                                </div>
                                            ))
                                        )}
                                        {loading && <div className="text-xs text-emerald-400 animate-pulse text-center">AI is thinking...</div>}
                                    </div>

                                    <div className="flex items-center mt-auto border border-white/20 rounded-lg bg-slate-800 p-1">
                                        <label className="p-2 cursor-pointer hover:bg-white/10 rounded-lg">
                                            <Paperclip className="w-5 h-5 text-gray-400" />
                                            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ask AI about this case..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            className="flex-grow p-2 text-sm bg-transparent outline-none placeholder-gray-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        />
                                        <button onClick={handleSend} className="bg-emerald-600 p-2 rounded-lg hover:bg-emerald-700 transition">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: AI GAUGE & DECISIONS */}
                            <div className="lg:w-1/3 flex flex-col space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center">
                                    <h2 className="text-xl font-semibold mb-6 text-white">AI Assessment</h2>
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#334155" strokeWidth="8" />
                                            <circle 
                                                cx="50" cy="50" r="40" fill="transparent" 
                                                stroke={selectedCase?.prediction_details?.bail_eligibility === 1 ? "#10b981" : "#ef4444"} 
                                                strokeWidth="8" 
                                                strokeDasharray={`${(selectedCase?.prediction_details?.probability_bail || 0) * 2.51} 251`}
                                                transform="rotate(-90 50 50)"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-white text-center">
                                            <span className="text-emerald-400 text-3xl">{selectedCase?.prediction_details?.probability_bail}%</span>
                                            <span className="text-gray-400 text-[10px] uppercase tracking-tighter">Eligible</span>
                                        </div>
                                    </div>
                                </div>
                                        <div className={`border rounded-lg p-5 text-center transition-colors ${selectedCase?.judicial_status ? 'bg-yellow-600/20 border-yellow-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Final Verdict</h3>
    <p className="text-2xl font-black text-emerald-400 uppercase tracking-widest">{selectedCase?.judicial_status || 'PENDING'}</p>
</div>

{/* ADD THE RESET BUTTON HERE */}
<button 
    onClick={handleReset}
    className="w-full mt-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white border border-white/10 rounded-lg transition-colors bg-white/5 uppercase tracking-[2px]"
>
    {loading ? "Resetting..." : "Reset Decision (Dev Mode)"}
</button>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                    <h2 className="text-xl font-semibold mb-2 text-center">Final Decision</h2>
                                    <button 
                                        onClick={() => handleDecision('Accepted')} 
                                        disabled={!!selectedCase?.judicial_status || !!decisionLoading}
                                        className="w-full py-3 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 transition flex items-center justify-center"
                                    >
                                        {decisionLoading === 'Accepted' ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />} Accept Bail
                                    </button>
                                    <button 
                                        onClick={() => handleDecision('Rejected')} 
                                        disabled={!!selectedCase?.judicial_status || !!decisionLoading}
                                        className="w-full py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 disabled:bg-gray-700 transition flex items-center justify-center"
                                    >
                                        {decisionLoading === 'Rejected' ? <Loader className="w-5 h-5 animate-spin mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />} Reject Bail
                                    </button>
                                </div>

                                <div className={`border rounded-lg p-5 text-center transition-colors ${selectedCase?.judicial_status ? 'bg-yellow-600/20 border-yellow-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Final Verdict</h3>
                                    <p className="text-3xl font-black text-emerald-400 uppercase tracking-widest">{selectedCase?.judicial_status || 'PENDING'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FEATURES GRID ---
            <section id="features" className="relative z-10 py-20 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Judicial Platform Features</h2>
                        <p className="text-gray-300">Essential tools for authority users to manage case flow and decisions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-emerald-400/50 transition-colors">
                                <div className="bg-white/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* --- ABOUT SECTION --- */}
            <section id="about" className="relative z-10 py-20 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
                        <h2 className="text-4xl font-bold text-white mb-6 text-center">About This Project</h2>
                        <div className="space-y-6">
                            <p className="text-gray-300 text-xl leading-relaxed text-center">
                                This is our <span className="text-emerald-400 font-semibold text-2xl">Major Project</span>, inspired by a real-world problem statement from the
                                <span className="text-blue-400 font-semibold block mt-2 text-2xl italic"> Smart India Hackathon (SIH) 2024</span> 
                                We selected Problem Statement ID <span className="text-amber-400 font-semibold px-2 py-1 bg-amber-400/10 rounded">1702</span>, which focuses on improving the efficiency and transparency of the bail application process.
                            </p>
                            <div className="h-px bg-white/10 w-1/2 mx-auto" /> 
                            <p className="text-gray-400 text-lg leading-relaxed text-center italic">
                                Our platform leverages artificial intelligence to assess bail eligibility, automate documentation, and enhance accessibility for undertrial prisoners, legal aid providers, and judicial authorities.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER --- */}
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
                                    <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#roles" className="text-gray-300 hover:text-white transition-colors">
                                        Roles
                                    </a>
                                </li>
                                <li>
                                    <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                                        About
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="/privacy-policy"  className="text-gray-300 hover:text-white transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                                        Terms of Service
                                    </a>
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