import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">StreamLine</h3>
            <p className="text-sm opacity-80">
              Simplify your workflow and boost productivity with our powerful SaaS platform.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm opacity-80 hover:opacity-100">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-sm opacity-80 hover:opacity-100">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm opacity-80 hover:opacity-100">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm opacity-80 hover:opacity-100">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm opacity-80 hover:opacity-100">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="opacity-80 hover:opacity-100">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} StreamLine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

