import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoDemo } from "@/components/ui/video-demo"
import {
  Upload,
  Palette,
  Sparkles,
  Clock,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Camera,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const services = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Expert Photo Restoration",
      description: "Breathe new life into damaged photographs with our advanced AI technology and expert touch",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Colorization of Black & White Photos",
      description: "Transform cherished black and white memories into vibrant, lifelike colored photographs",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Repairing Damage",
      description: "Carefully restore tears, scratches, fading, and water damage to preserve your precious moments",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Improving Quality and Sharpness",
      description: "Enhance resolution, reduce noise, and bring crystal-clear detail to your treasured photographs",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Upload Your Photo",
      description: "Securely upload your precious photograph through our encrypted platform",
      icon: <Upload className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "AI Enhancement",
      description: "Our advanced AI technology carefully analyzes and restores your image",
      icon: <Camera className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Download & Cherish",
      description: "Receive your beautifully restored photograph in high resolution",
      icon: <Heart className="h-6 w-6" />,
    },
  ]

  const testimonials = [
    {
      name: "Margaret Thompson",
      rating: 5,
      text: "They brought my grandmother's wedding photo back to life. The attention to detail was extraordinary.",
      image: "/testimonials/margaret-thompson.jpg",
    },
    {
      name: "David Chen",
      rating: 5,
      text: "The colorization of our family's vintage photos was absolutely stunning. Highly recommend!",
      image: "/testimonials/david-chen.jpg",
    },
    {
      name: "Sarah Williams",
      rating: 5,
      text: "Professional service with incredible results. My damaged photos look better than the originals.",
      image: "/testimonials/sarah-williams.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-warm-beige">
      {/* Header */}
      <header className="bg-warm-beige/95 backdrop-blur-sm sticky top-0 z-50 border-b border-deep-navy/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-deep-navy rounded-full flex items-center justify-center">
              <Camera className="h-5 w-5 text-warm-beige" />
            </div>
            <span className="text-2xl font-serif font-semibold text-deep-navy">Revive My Photo</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#services" className="text-deep-navy/70 hover:text-deep-navy transition-colors font-sans">
              Services
            </Link>
            <Link href="#gallery" className="text-deep-navy/70 hover:text-deep-navy transition-colors font-sans">
              Gallery
            </Link>
            <Link href="#pricing" className="text-deep-navy/70 hover:text-deep-navy transition-colors font-sans">
              Pricing
            </Link>
            <Button className="bg-rich-coral hover:bg-rich-coral/90 text-white font-sans" asChild>
              <Link href="/upload">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 film-grain">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-beige via-cream to-warm-beige"></div>
        <div className="container mx-auto text-center max-w-5xl relative z-10">
          <Badge className="mb-6 bg-deep-navy/10 text-deep-navy hover:bg-deep-navy/10 border-deep-navy/20 font-sans">
            AI-Powered Photo Restoration
          </Badge>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-deep-navy mb-8 leading-tight">
            Revive Your Photos
            <span className="block text-rich-coral">with Expert AI</span>
          </h1>
          <p className="text-xl text-deep-navy/70 mb-12 leading-relaxed max-w-3xl mx-auto font-sans">
            Transform your precious photographs with our advanced AI technology. Repair damage, add vibrant colors, and
            enhance quality to preserve your most treasured memories forever.
          </p>

          {/* Video Demo Component */}
          <VideoDemo />

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-rich-coral hover:bg-rich-coral/90 text-white text-lg px-10 py-4 rounded-full font-sans shadow-lg"
              asChild
            >
              <Link href="/upload">
                Upload Your Photo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-deep-navy border-deep-navy/30 hover:bg-deep-navy/5 text-lg px-10 py-4 rounded-full font-sans"
              asChild
            >
              <Link href="#gallery">View Examples</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-12 text-sm text-deep-navy/60 font-sans">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>24-48 Hour Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>100% Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-deep-navy mb-6">Our Restoration Services</h2>
            <p className="text-xl text-deep-navy/70 max-w-3xl mx-auto font-sans leading-relaxed">
              Each photograph tells a story. Our expert AI technology and careful attention to detail ensure your
              precious memories are restored with the respect and quality they deserve.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {services.map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-6">
                  <div className="mb-6 p-4 bg-rich-coral/10 rounded-full text-rich-coral w-fit">{service.icon}</div>
                  <CardTitle className="text-2xl font-serif text-deep-navy">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-deep-navy/70 leading-relaxed text-lg font-sans">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section id="gallery" className="py-24 px-6 bg-warm-beige">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-deep-navy mb-6">Before & After Showcase</h2>
            <p className="text-xl text-deep-navy/70 max-w-3xl mx-auto font-sans leading-relaxed">
              Witness the remarkable transformations. See how we bring your precious memories back to life.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/repair-damage-eyes.jpg"
                  alt="Damaged portrait restoration - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Damage Repair</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Severe scratches and tears completely restored with natural colorization
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/fix-cracks-scratches.jpg"
                  alt="Profile portrait colorization - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Colorization</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Black & white portrait transformed with lifelike colors and enhanced detail
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/military-album-restoration.jpg"
                  alt="Military portrait quality enhancement - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Quality Enhancement</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Faded military portrait enhanced with improved contrast and clarity
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/damaged-military-portrait.jpg"
                  alt="Extremely damaged military portrait restoration - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Extreme Damage</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Restored severely cracked military portrait with full colorization
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/recreate-missing-parts.jpg"
                  alt="Family photo with missing parts recreated - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Missing Parts</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Recreated torn sections and colorized vintage family portrait
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <div className="relative">
                <Image
                  src="/examples/sisters-colorization.jpg"
                  alt="Sisters portrait colorization - before and after"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-3 right-3 bg-rich-coral text-white shadow-lg">Full Restoration</Badge>
              </div>
              <CardContent className="p-6">
                <p className="text-deep-navy/70 font-sans leading-relaxed">
                  Complete restoration with crack removal and vibrant colorization
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-deep-navy mb-6">How It Works</h2>
            <p className="text-xl text-deep-navy/70 max-w-3xl mx-auto font-sans leading-relaxed">
              Our simple three-step process makes photo restoration effortless and secure
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-rich-coral rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-deep-navy rounded-full flex items-center justify-center text-white text-sm font-bold font-sans">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-semibold text-deep-navy mb-4">{step.title}</h3>
                <p className="text-deep-navy/70 font-sans leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-warm-beige">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-deep-navy mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-deep-navy/70 mb-4 font-sans leading-relaxed">
              We keep it straightforward. You pay per photo — no subscriptions, no hidden fees, just fast and reliable
              photo restoration when you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Standard Pricing - Demo Version */}
            <Card className="border-2 border-rich-coral/20 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-br from-rich-coral/5 to-rich-coral/10 text-center border-b border-rich-coral/10">
                <CardTitle className="text-3xl font-serif text-deep-navy">Launch Pricing</CardTitle>
                <div className="text-6xl font-serif font-bold text-rich-coral mt-6">
                  $0.04
                  <span className="text-lg font-sans font-normal text-deep-navy/60">/photo</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 mt-2">
                  Limited Time - Launch Special
                </Badge>
                <p className="text-deep-navy/70 font-sans mt-2">Professional AI restoration at launch pricing</p>
              </CardHeader>
              <CardContent className="p-10">
                <ul className="space-y-6 text-left">
                  {[
                    "All restoration services included",
                    "Advanced AI processing with Replicate",
                    "High-resolution output (300+ DPI)",
                    "Email delivery with download links",
                    "100% satisfaction guarantee",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <CheckCircle className="w-5 h-5 text-rich-coral flex-shrink-0" />
                      <span className="font-sans text-deep-navy/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Volume Discounts - Simplified for Demo */}
            <Card className="border-2 border-deep-navy/20 shadow-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-br from-deep-navy/5 to-deep-navy/10 text-center border-b border-deep-navy/10">
                <CardTitle className="text-3xl font-serif text-deep-navy">Coming Soon</CardTitle>
                <p className="text-deep-navy/70 font-sans mt-2">Full launch pricing</p>
              </CardHeader>
              <CardContent className="p-10">
                <div className="space-y-6 text-center">
                  <div className="py-6">
                    <h4 className="font-serif font-semibold text-deep-navy mb-4">After Demo Period:</h4>
                    <div className="space-y-3 text-deep-navy/70">
                      <p className="font-sans">
                        Single photos: <span className="font-semibold">$8 each</span>
                      </p>
                      <p className="font-sans">Volume discounts available</p>
                      <p className="font-sans">Professional quality guaranteed</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 font-sans text-sm">
                      <strong>Demo Special:</strong> Try our AI restoration for just $0.04 per photo during our launch
                      period!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quality Guarantee - Replace the add-ons section */}
          <Card className="bg-gradient-to-br from-rich-coral/5 to-rich-coral/10 border-rich-coral/20 shadow-lg mb-16">
            <CardContent className="p-10 text-center">
              <Sparkles className="h-16 w-16 text-rich-coral mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-deep-navy mb-4">Highest Quality Guaranteed</h3>
              <p className="text-lg text-deep-navy/80 font-sans leading-relaxed max-w-3xl mx-auto mb-6">
                Every photo is restored to the highest possible quality using cutting-edge AI technology. You'll receive
                print-ready, high-resolution images (300+ DPI) perfect for framing, sharing, or preserving for future
                generations.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-rich-coral mx-auto mb-3" />
                  <h4 className="font-serif font-semibold text-deep-navy mb-2">Maximum Resolution</h4>
                  <p className="text-deep-navy/70 font-sans text-sm">High-resolution output ready for any use</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-rich-coral mx-auto mb-3" />
                  <h4 className="font-serif font-semibold text-deep-navy mb-2">Professional Quality</h4>
                  <p className="text-deep-navy/70 font-sans text-sm">Museum-grade restoration standards</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-rich-coral mx-auto mb-3" />
                  <h4 className="font-serif font-semibold text-deep-navy mb-2">Print Ready</h4>
                  <p className="text-deep-navy/70 font-sans text-sm">Perfect for framing and printing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guarantee */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-10 text-center">
              <Shield className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-3xl font-serif font-bold text-deep-navy mb-4">Satisfaction Guaranteed</h3>
              <p className="text-lg text-deep-navy/80 font-sans leading-relaxed max-w-3xl mx-auto mb-8">
                All photos are processed using cutting-edge AI and reviewed for quality. If you're not happy, we'll fix
                it or refund you — no questions asked.
              </p>
              <Button
                className="bg-rich-coral hover:bg-rich-coral/90 text-white py-4 px-10 rounded-full font-sans text-lg shadow-lg"
                size="lg"
                asChild
              >
                <Link href="/upload">Start Your Restoration</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-cream">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-deep-navy mb-6">What Our Customers Say</h2>
            <p className="text-xl text-deep-navy/70 font-sans">Trusted by thousands of families worldwide</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-rich-coral fill-current" />
                    ))}
                  </div>
                  <p className="text-deep-navy/80 mb-6 italic font-sans leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-serif font-semibold text-deep-navy">— {testimonial.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-deep-navy via-deep-navy to-deep-navy/90 film-grain">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-serif font-bold text-warm-beige mb-6">Revive Your Photos Today</h2>
          <p className="text-xl text-warm-beige/80 mb-12 font-sans leading-relaxed max-w-2xl mx-auto">
            Don't let precious memories fade away. Upload your photos today and watch them come back to life as
            beautiful, vibrant keepsakes that will last for generations.
          </p>
          <Button
            size="lg"
            className="bg-rich-coral hover:bg-rich-coral/90 text-white text-xl px-12 py-5 rounded-full font-sans shadow-2xl"
            asChild
          >
            <Link href="/upload">
              Get Started Today
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-navy text-warm-beige py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-rich-coral rounded-full flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-serif font-semibold">Revive My Photo</span>
              </div>
              <p className="text-warm-beige/70 font-sans leading-relaxed">
                Professional AI-powered photo restoration services to revive your most precious memories.
              </p>
            </div>
            <div>
              <h3 className="font-serif font-semibold mb-6">Services</h3>
              <ul className="space-y-3 text-warm-beige/70 font-sans">
                <li>Photo Restoration</li>
                <li>Colorization</li>
                <li>Damage Repair</li>
                <li>Quality Enhancement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-warm-beige/70 font-sans">
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif font-semibold mb-6">Contact</h3>
              <ul className="space-y-3 text-warm-beige/70 font-sans">
                <li>support@revivemyphoto.ai</li>
                <li>1-800-REVIVE</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warm-beige/20 mt-12 pt-8 text-center text-warm-beige/60 font-sans">
            <p>&copy; 2024 Revive My Photo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
