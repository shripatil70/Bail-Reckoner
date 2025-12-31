"use client" // CRITICAL: Enables client-side features like useState and event handlers
import Link from "next/link"
import React, { useState } from 'react';
import { FileText, Shield, CheckCircle, User, Loader, AlertTriangle, Lightbulb, Languages } from "lucide-react";
import { motion } from "framer-motion";
import axios, { AxiosError } from 'axios'; // Modified import to be explicit about AxiosError
import { translations } from "../../lib/translations"; // Up one to app/, up one to root/
import { LanguageToggle } from "../components/LanguageToggle"; // Up one to app/
// --- TYPE DEFINITIONS ---
// Define the properties for the custom Button component to fix type errors
interface ButtonProps {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    className?: string;
}

// Custom Button component implementation
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

// Define the exact structure of the response expected from the Flask API
interface MLResult {
    bail_eligibility: number;
    probability_no_bail: number;
    probability_bail: number;
    message: string;
    verdict_style: 'success' | 'danger' | 'error' | 'default';
    reason?: string; // Added reason as it's returned by the LLM in app.py
}

// Define the type for the event used in input handlers
type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;


// --- STATIC DATA ---
const statuteOptions = ["NDPS", "SCST Act", "PMLA", "CrPC", "IPC"];

const crimeCategoryOptions = [
    "Crimes Against Children",
    "Offences Against the State",
    "Crimes Against Foreigners",
    "Crimes Against SCs and STs",
    "Cyber Crime",
    "Economic Offence",
    "Crimes Against Women",
];

// --- MAIN COMPONENT ---
export default function UndertrialPrisoner() {
    // --- 1. STATE MANAGEMENT ---
    const [loading, setLoading] = useState<boolean>(false);
    const [mlResult, setMlResult] = useState<MLResult | null>(null);

    // State keys are synchronized with the LLM prompt's expected data keys in app.py
    const [formData, setFormData] = useState({
        // METADATA (Not used by LLM but useful for case tracking)
        case_id_user: 'MyTestCase-A1',
        prisonerName: 'Vikas', 

        // CRITICAL LLM INPUTS (Used directly in LLM prompt)
        age: 30, 
        priorConvictions: 0, 

        // Categorical Features
        statute: statuteOptions[0],
        offenseCategory: crimeCategoryOptions[0], 
        penalty: 'Moderate', 

        // Boolean Risk & Term Features (Used directly in LLM prompt)
        riskOfEscape: false, 
        riskOfInfluence: false, 
        servedHalfTerm: false, 
        
        // Input field for custody time (used for a hidden field payload)
        imprisonment_served_years: 0, // CRITICAL: Kept this key to fix type errors in JSX/TS

        // Boolean Flags 
        surety_bond_required: false,
        personal_bond_required: false,
        fines_applicable: false,
    });

    // Unified change handler for all inputs
    const handleChange = (e: InputChangeEvent) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        let newValue: string | number | boolean;
        if (type === 'checkbox') {
            newValue = checked;
        } else if (type === 'number') {
            // Treat empty string input as 0 for number fields
            newValue = value === '' ? 0 : Number(value);
        } else {
            newValue = value;
        }

        setFormData(prevData => ({ ...prevData, [name]: newValue }));
    };

    // --- 2. API SUBMISSION HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMlResult(null);

        // Calculate days served for legacy field consistency
        const daysServed = Math.floor(formData.imprisonment_served_years * 365.25);

        // Payload structure EXACTLY matches the keys expected by the Flask LLM function's dictionary input.
        const payload = {
            prisonerName: formData.prisonerName,
            age: formData.age,
            priorConvictions: formData.priorConvictions,

            statute: formData.statute,
            offenseCategory: formData.offenseCategory,
            penalty: formData.penalty,

            riskOfEscape: formData.riskOfEscape,
            riskOfInfluence: formData.riskOfInfluence,
            servedHalfTerm: formData.servedHalfTerm,

            // Legacy keys sent as 0/false placeholders to satisfy original feature list design
            surety_bond_required: formData.surety_bond_required,
            personal_bond_required: formData.personal_bond_required,
            fines_applicable: formData.fines_applicable,

            // Hidden placeholders/calculated values
            imprisonment_duration_served: daysServed, // Passed as a computed field
            risk_score: 0,
            penalty_severity: 0,
            bail_bond_amount: 0,
            surety_bond_amount: 0,
        };

        try {
            // NOTE: '/api/predict' assumes a proxy setup pointing to your Flask server (e.g., http://172.0.0.1:5000)
            const response = await axios.post('/api/predict', payload);
            setMlResult({ ...response.data, verdict_style: response.data.bail_eligibility === 1 ? 'success' : 'danger' });

        } catch (error) {
            // Explicitly casting error to AxiosError, which requires both 'axios' and 'AxiosError' to be imported
            const axiosError = error as AxiosError; 

            console.error("API Call Failed:", axiosError.response?.data || axiosError.message);

            // Constructing a temporary MLResult object for error display
            setMlResult({
                bail_eligibility: -1,
                message: `Prediction Error: ${(axiosError.response?.data as { error?: string })?.error || axiosError.message}`,
                probability_no_bail: 0,
                probability_bail: 0,
                verdict_style: "error"
            });
        } finally {
            setLoading(false);
        }
    };


    const features = [
        {
            icon: <Shield className="w-6 h-6 text-indigo-400" />,
            title: "Case Number Tracking",
            description: "Track the real-time status of your bail application and case updates.",
        },
        {
            icon: <User className="w-6 h-6 text-indigo-400" />,
            title: "Name of Undertrial Prisoner",
            description: "Input the Name of Undertrial Prisoner.",
        },
        {
            icon: <CheckCircle className="w-6 h-6 text-indigo-400" />,
            title: "Automated Eligibility Check",
            description: "AI-powered bail eligibility assessment based on your case details.",
        },
        {
            icon: <FileText className="w-6 h-6 text-indigo-400" />,
            title: "Legal Assistance Portal",
            description: "Connect with legal aid providers for assistance in your case.",
        },
    ];


    // --- Helper function for dynamic result styling ---
    const getResultStyles = () => {
        if (!mlResult) return "bg-blue-600/20 border-blue-500 text-blue-300";
        switch (mlResult.verdict_style) {
            case 'success':
                return "bg-green-600/20 border-green-500 text-green-300";
            case 'danger':
                return "bg-red-600/20 border-red-500 text-red-300";
            case 'error':
                return "bg-yellow-600/20 border-yellow-500 text-yellow-300";
            default:
                return "bg-blue-600/20 border-blue-500 text-blue-300";
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden font-sans">
            {/* Animated background dots */}
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
                            repeat: Infinity,
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

          

            {/* Header and Hero Sections */}
            <header className="relative z-10 border-b border-white/10">
                <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">Bail Reckoner</div>
                    <div className="hidden md:flex space-x-6">
                        <a href="/" className="text-gray-300 hover:text-white transition-colors">
                            Home
                        </a>
                        <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#form" className="text-gray-300 hover:text-white transition-colors">
                            Reckoner
                        </a>
                    </div>
                  <Link href="/prisoner/translate">
  <Button className="text-white border-white/20 hover:bg-white/10 border bg-transparent flex items-center gap-2 transition-all">
    <Languages className="w-4 h-4 text-emerald-400" />
    Language / हिंदी
  </Button>
</Link>
                </nav>
            </header>

            <section className="relative z-10 py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Empowering Undertrial Prisoners with Legal Assistance
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Track your case, manage documents, and check bail eligibility using our AI-powered platform.
                        </p>
                        <a href="#form">
                          <Button className="mr-4 bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all border-none shadow-md">
                            Start Eligibility Check
                            </Button>
                        </a>
                        <Button className="text-white border-white/20 hover:bg-white/10 border bg-transparent">
                            Learn More
                        </Button>
                    </motion.div>
                </div>
            </section>

            <section id="features" className="relative z-10 py-20 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
                        <p className="text-gray-300">Essential tools to support undertrial prisoners during the bail process.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-indigo-400/50 transition-colors"
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

            {/* Undertrial Prisoner Form Card (ML RECKONER) - FINAL STRUCTURE */}
            <section id="form" className="relative z-10 py-10 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-bold text-white mb-6 text-center">
                                AI Bail Eligibility Reckoner
                            </h1>
                            <form className="space-y-6" onSubmit={handleSubmit}>

                                <div className="text-lg font-semibold text-white/80 mb-4 border-b border-white/10 pb-2">Case & Personal Details</div>

                                {/* --- ROW 1: Case ID, Name, Age --- */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Case ID (Metadata) */}
                                    <div>
                                        <label htmlFor="case_id_user" className="block text-white text-sm font-bold mb-2">Case ID</label>
                                        <input
                                            type="text"
                                            id="case_id_user"
                                            name="case_id_user"
                                            value={formData.case_id_user}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white placeholder-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-white/10 border-white/20"
                                            placeholder="e.g., FIR-2024-498A"
                                        />
                                    </div>
                                    {/* Name of Undertrial (Metadata) */}
                                    <div>
                                        <label htmlFor="prisonerName" className="block text-white text-sm font-bold mb-2">Prisoner Name</label>
                                        <input
                                            type="text"
                                            id="prisonerName"
                                            name="prisonerName"
                                            value={formData.prisonerName}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white placeholder-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-white/10 border-white/20"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {/* Age (LLM Input) */}
                                    <div>
                                        <label htmlFor="age" className="block text-white text-sm font-bold mb-2">Age</label>
                                        <input
                                            type="number"
                                            id="age"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white placeholder-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-white/10 border-white/20"
                                            placeholder="e.g., 30"
                                            min="18"
                                            step="1"
                                        />
                                    </div>
                                </div>

                                {/* --- ROW 2: Statute, Category, Prior Convictions --- */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Statute (LLM Input) */}
                                    <div>
                                        <label htmlFor="statute" className="block text-white text-sm font-bold mb-2">Statute/Code</label>
                                        <select
                                            id="statute"
                                            name="statute"
                                            value={formData.statute}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-white/10 border-white/20 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {statuteOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
                                        </select>
                                    </div>
                                    {/* Offense Category (LLM Input) */}
                                    <div>
                                        <label htmlFor="offenseCategory" className="block text-white text-sm font-bold mb-2">Offense Category</label>
                                        <select
                                            id="offenseCategory"
                                            name="offenseCategory"
                                            value={formData.offenseCategory}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-white/10 border-white/20 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {crimeCategoryOptions.map(opt => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
                                        </select>
                                    </div>
                                    {/* Prior Convictions (LLM Input) */}
                                    <div>
                                        <label htmlFor="priorConvictions" className="block text-white text-sm font-bold mb-2">Prior Convictions</label>
                                        <input
                                            type="number"
                                            id="priorConvictions"
                                            name="priorConvictions"
                                            value={formData.priorConvictions}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white placeholder-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-white/10 border-white/20"
                                            placeholder="e.g., 0"
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                </div>

                                {/* --- ROW 3: Penalty and Custody Time --- */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Penalty Type (LLM Input) */}
                                    <div>
                                        <label htmlFor="penalty" className="block text-white text-sm font-bold mb-2">Penalty Class</label>
                                        <select
                                            id="penalty"
                                            name="penalty"
                                            value={formData.penalty}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-white/10 border-white/20 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="Minor" className="text-slate-900">Minor</option>
                                            <option value="Moderate" className="text-slate-900">Moderate</option>
                                            <option value="Severe" className="text-slate-900">Severe</option>
                                        </select>
                                    </div>
                                    {/* Imprisonment Served (YEARS) */}
                                    <div>
                                        <label htmlFor="imprisonment_served_years" className="block text-white text-sm font-bold mb-2">Custody Served (Years)</label>
                                        <input
                                            type="number"
                                            id="imprisonment_served_years"
                                            name="imprisonment_served_years"
                                            value={formData.imprisonment_served_years}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-white placeholder-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-white/10 border-white/20"
                                            placeholder="e.g., 0.5 (for 6 months)"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    {/* Empty for spacing */}
                                    <div className="hidden md:block"></div>
                                </div>

                                {/* --- PROCEDURAL FLAGS (LLM INPUTS - Booleans) --- */}
                                <div className="bg-white/10 rounded-lg p-4 space-y-3 border border-white/10">
                                    <h3 className="text-white text-md font-semibold flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                                        Check Below Boxes(Risk & Procedural Factors) 
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { id: "riskOfEscape", label: "High Risk of Flight/Escape" },
                                            { id: "riskOfInfluence", label: "Risk of Witness Influence" },
                                            { id: "servedHalfTerm", label: "Statutory Half-Term Served" },
                                            { id: "surety_bond_required", label: "Surety Bond Applicable" },
                                            { id: "personal_bond_required", label: "Personal Bond Applicable" },
                                            { id: "fines_applicable", label: "Fines Applicable" },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-white text-sm md:col-span-1">
                                                <label htmlFor={item.id}>{item.label}</label>
                                                <input
                                                    type="checkbox"
                                                    id={item.id}
                                                    name={item.id}
                                                    checked={formData[item.id as keyof typeof formData] as boolean}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 rounded text-indigo-600 bg-white border-gray-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* --- HIDDEN FIELDS (CRITICAL FOR BACKEND ALIGNMENT) --- */}
                                <div className="hidden">
                                    <input type="hidden" name="imprisonment_duration_served" value={Math.floor(formData.imprisonment_served_years * 365.25)} />
                                    <input type="hidden" name="risk_score" value={0} />
                                    <input type="hidden" name="penalty_severity" value={0} />
                                    <input type="hidden" name="bail_bond_amount" value={0} />
                                    <input type="hidden" name="surety_bond_amount" value={0} />
                                </div>


                                {/* --- SUBMIT BUTTON --- */}
                               
                                <Button 
                                type="submit" 
                                 className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 flex items-center justify-center text-lg transition-all text-white shadow-lg shadow-emerald-900/20" 
                                 disabled={loading}
                                        >
                                            {loading ? (
                                                  <Loader className="w-5 h-5 animate-spin mr-2" />
                                                    ) : (
                                                      <CheckCircle className="w-5 h-5 mr-2" />
                                                  )}
                                                  {loading ? 'Calculating Bail Verdict...' : 'Check Bail Eligibility'}
                                </Button>
                            </form>
                            
                            {/* --- ML RESULT DISPLAY (Moved outside form) --- */}
                            {mlResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mt-6 p-6 rounded-xl border-2 space-y-3 ${getResultStyles()}`}
                                >
                                    <h3 className="text-xl font-bold flex items-center">
                                        <Lightbulb className="w-5 h-5 mr-2" />
                                        AI PREDICTION VERDICT
                                    </h3>
                                    {/* Displays server message (which includes styling like **Eligible**) */}
                                    <p className="text-2xl font-extrabold" dangerouslySetInnerHTML={{ __html: mlResult.message }} />

                                    {/* Reasoning (new field from LLM) */}
                                    {mlResult.reason && mlResult.verdict_style !== 'error' && (
                                        <div className="pt-2 border-t border-current/30 text-sm">
                                            <p className="font-semibold mb-1">Reasoning:</p>
                                            <p className="font-normal italic text-gray-400">{mlResult.reason}</p>
                                        </div>
                                    )}

                                    {/* Confidence Display */}
                                    {mlResult.verdict_style !== 'error' && (
                                        <>
                                            <p className="text-sm font-semibold pt-2">
                                                Confidence:
                                                <span className="ml-2 font-mono">
                                                    {mlResult.bail_eligibility === 1 ? mlResult.probability_bail : mlResult.probability_no_bail}%
                                                </span>
                                            </p>
                                            <div className="w-full h-2 bg-gray-700 rounded-full">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-500 ${mlResult.bail_eligibility === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                                                    style={{ width: `${mlResult.bail_eligibility === 1 ? mlResult.probability_bail : mlResult.probability_no_bail}%` }}
                                                />
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA and Footer sections follow... */}
           <section className="relative z-10 py-20 border-t border-white/10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Take Control of Your Legal Rights</h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Gain access to legal aid and bail tracking with our powerful platform.
                        </p>
                        {/* <Button className="mr-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                            Get Started Now
                        </Button> */}
                        <Link href="/legal_aid">
                        <Button className="text-white border-white/20 hover:bg-white/10 border bg-transparent">
                            Contact Legal Aid
                        </Button>
                        </Link>
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
