import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Streamline Your Workflow</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Boost productivity and simplify your business processes with StreamLine's powerful SaaS platform.
        </p>
        <Button size="lg" variant="secondary">
          Start Your Free Trial
        </Button>
      </div>
    </section>
  )
}

