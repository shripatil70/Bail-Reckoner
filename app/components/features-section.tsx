import { Zap, BarChart, Users, Lock } from "lucide-react"

const features = [
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Lightning Fast",
    description: "Our platform is optimized for speed, ensuring quick load times and responsive interactions.",
  },
  {
    icon: <BarChart className="h-10 w-10 text-secondary" />,
    title: "Advanced Analytics",
    description: "Gain valuable insights with our comprehensive analytics and reporting tools.",
  },
  {
    icon: <Users className="h-10 w-10 text-accent" />,
    title: "Team Collaboration",
    description: "Seamlessly work together with your team members in real-time.",
  },
  {
    icon: <Lock className="h-10 w-10 text-primary" />,
    title: "Enterprise-Grade Security",
    description: "Rest easy knowing your data is protected with our state-of-the-art security measures.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background p-6 rounded-lg shadow-md">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

