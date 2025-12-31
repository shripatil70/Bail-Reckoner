import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Basic",
    price: "$29",
    features: ["Up to 5 team members", "Basic analytics", "24/7 support", "1GB storage"],
    cta: "Start Basic",
  },
  {
    name: "Pro",
    price: "$79",
    features: ["Up to 20 team members", "Advanced analytics", "Priority support", "10GB storage"],
    cta: "Go Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited team members", "Custom analytics", "Dedicated support", "Unlimited storage"],
    cta: "Contact Sales",
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="bg-background p-8 rounded-lg shadow-md flex flex-col">
              <h3 className="text-2xl font-bold mb-4 text-primary">{plan.name}</h3>
              <p className="text-4xl font-bold mb-6 text-accent">{plan.price}</p>
              <ul className="mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center mb-2">
                    <Check className="h-5 w-5 text-secondary mr-2" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

