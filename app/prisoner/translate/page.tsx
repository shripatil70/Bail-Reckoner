"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Languages } from "lucide-react";
import { translations } from "@/lib/translations";

export default function TranslatePage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/prisoner" className="flex items-center text-emerald-400 mb-8 hover:underline">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Form
        </Link>

        <div className="flex justify-between items-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-bold">Legal Terms Decoder</h1>
          <button 
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Languages className="w-5 h-5" />
            {lang === "en" ? "Translate to हिंदी" : "English में बदलें"}
          </button>
        </div>

        <div className="space-y-4">
          {[
            { term: t.flightRisk, desc: t.flightRiskDesc },
            { term: t.suretyBond, desc: t.suretyBondDesc },
            { term: t.halfTerm, desc: t.halfTermDesc }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h3 className="text-emerald-400 font-bold mb-2">{item.term}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}