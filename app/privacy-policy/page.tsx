import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-400 hover:underline">← Back to Home</Link>
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p>We collect personal information voluntarily provided by you, such as your name, legal case details, and contact information.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p>Your data is used to provide AI-powered legal assistance and to help calculate bail eligibility under BNS Section 479.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Data Security</h2>
          <p>We implement reasonable administrative and technical measures to protect your personal information from unauthorized access.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Your Rights</h2>
          <p>You have the right to access, rectify, or request erasure of your personal data held by our platform.</p>
        </section>
      </div>
    </div>
  );
}