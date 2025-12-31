import Image from "next/image"

const testimonials = [
  {
    quote: "StreamLine has revolutionized our workflow. It's intuitive, powerful, and has saved us countless hours.",
    author: "Jane Doe",
    company: "Tech Innovators Inc.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "The analytics features in StreamLine have given us invaluable insights into our business processes.",
    author: "John Smith",
    company: "Data Driven Co.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
  {
    quote: "StreamLine's customer support is top-notch. They're always there when we need them.",
    author: "Emily Johnson",
    company: "Global Solutions Ltd.",
    avatar: "/placeholder.svg?height=80&width=80",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-muted p-6 rounded-lg shadow-md">
              <p className="text-foreground mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  width={40}
                  height={40}
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-primary">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

