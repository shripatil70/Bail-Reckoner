import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="text-emerald-400 hover:underline">← Back to Home</Link>
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Use of AI Features</h2>
          <p>The AI-powered tools are provided for general awareness. You must carefully review all AI-generated output before use, as it may contain errors.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. No Legal Advice</h2>
          <p>This platform does not provide formal legal advice. AI outputs are for informational purposes and do not replace professional human oversight.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Data Usage</h2>
          <p>Data submitted through AI features shall be used only for authorized purposes as described in our Privacy Policy.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Liability</h2>
          <p>We are not liable for any inaccuracies in AI outputs. Users retain full accountability for any legal arguments or citations used from this tool.</p>
        </section>
      </div>
    </div>
  );
}