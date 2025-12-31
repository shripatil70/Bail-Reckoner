import React from "react";
// Assuming Inter is imported and applied globally in your root layout, 
// but we import it here to ensure the className is available if needed.
import { Inter } from "next/font/google"; 
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] }); 

const LegalAidHeader = () => (
    <header className="bg-secondary/50 border-b border-border shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                Legal Provider Tools
            </h1>
            <nav className="text-sm space-x-4 text-muted-foreground">
                <Link 
    href="/" 
    className="text-white hover:opacity-80 transition-all font-semibold"
  >
    Bail Reckoner Home
  </Link>
                {/* <a href="/reports" className="hover:text-primary transition-colors">
                    Reports
                </a>
                <a href="/" className="text-red-400 hover:text-red-300 transition-colors">
                    Logout / Public Site
                </a> */}
            </nav>
        </div>
    </header>
);


export default function LegalAidLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Apply the global font class here to ensure font consistency is inherited
    return (
        <div className={`min-h-screen flex flex-col ${inter.className}`}>
            <LegalAidHeader />
            <main className="flex-grow">
                {children}
            </main>
            
        </div>
    );
}