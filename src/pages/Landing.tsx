import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrendingUp, Shield, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-2xl font-bold text-gradient">Bit-Lover</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-20 w-48 h-48 rounded-full bg-accent/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full bg-secondary/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              Your Crypto, Simplified — Welcome to{" "}
              <span className="text-gradient">Bit-Lover</span>{" "}
              <Heart className="inline-block h-12 w-12 text-primary fill-primary animate-pulse" />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground mb-12"
          >
            Track. Trade. Glow. Manage your portfolio with clarity and color.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 glow hover:scale-105 transition-transform duration-300">
                Enter Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Mock Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-20"
          >
            <Card className="glass p-8 max-w-3xl mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                    <p className="text-4xl font-bold text-gradient">$211,871.83</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p className="text-2xl font-semibold text-success">+1.95%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="glass p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">BTC</p>
                    <p className="font-semibold">$67,350</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">ETH</p>
                    <p className="font-semibold">$3,270</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">SOL</p>
                    <p className="font-semibold">$149.20</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            Why Choose Bit-Lover?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Track Your Portfolio",
                description: "Monitor all your crypto assets in one beautiful dashboard with real-time insights.",
                color: "text-primary"
              },
              {
                icon: Shield,
                title: "Live Market Insights",
                description: "Stay ahead with comprehensive market data and intelligent analytics.",
                color: "text-accent"
              },
              {
                icon: Zap,
                title: "Trade Instantly",
                description: "Execute trades with lightning speed and elegant simplicity.",
                color: "text-secondary"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="glass p-8 h-full hover:glow transition-all duration-300 hover:scale-105">
                  <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">About Bit-Lover</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Bit-Lover is built for those who love design as much as they love crypto. 
              Experience elegant simplicity and glowing clarity in every interaction.
            </p>
            <div className="flex items-center justify-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ong"
                alt="Founder"
                className="h-16 w-16 rounded-full border-2 border-primary"
              />
              <div className="text-left">
                <p className="font-semibold">Ong Nitikajonvorakun</p>
                <p className="text-sm text-muted-foreground">Founder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t glass">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span className="font-semibold">© 2025 Bit-Lover</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Crafted with ❤️ by Ong Nitikajonvorakun
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
