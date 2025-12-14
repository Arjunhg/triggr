"use client"

import Link from 'next/link'
import { useUser, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/variants'
import { Button } from '@/components/ui/button'
import { 
  Workflow, 
  Zap, 
  Play, 
  ArrowRight,
  Sparkles,
  GitBranch,
  Bot
} from 'lucide-react'
import Image from 'next/image'
import { AutomationBackground } from './dashboard/_components/AutomationBackground'

export default function HomePage() {
  const { isSignedIn } = useUser()
  
  const features = [
    {
      icon: Workflow,
      title: 'Visual Workflow Editor',
      description: 'Drag, connect, and configure nodes to design agent behavior visually.'
    },
    {
      icon: Zap,
      title: 'API Integrations',
      description: 'Call external APIs, store results, and orchestrate multi-step tasks.'
    },
    {
      icon: Play,
      title: 'Preview & Test',
      description: 'Run interactive previews to validate agent flows and iterate faster.'
    }
  ]

  const steps = [
    { step: 1, text: 'Design your agent using the visual editor.' },
    { step: 2, text: 'Configure API calls, conditions, and actions with node settings.' },
    { step: 3, text: 'Preview, test, and deploy your agent to start automating tasks.' }
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated Background */}
      <AutomationBackground className="-z-10 opacity-70" />

      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
              <Image src="/logo.png" alt="Triggr" width={52} height={52} className="relative z-10" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Triggr</span>
          </Link>
          
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
              <Link href="/dashboard">
                <Button className="gap-2 cursor-pointer">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button className='cursor-pointer' variant="ghost">Log in</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="gap-2 cursor-pointer">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              AI-Powered Workflow Automation
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Build Intelligent
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Agents Visually
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Create, test, and deploy custom AI agents with an intuitive visual builder.
            Connect APIs, design workflows, and iterate quickly — no boilerplate required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="cursor-pointer gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  <GitBranch className="w-5 h-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button size="lg" className="cursor-pointer gap-2 px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                    <Sparkles className="w-5 h-5" />
                    Start Building Free
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="lg" variant="outline" className="cursor-pointergap-2 px-8">
                    Log in
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything You Need</h2>
              <p className="text-muted-foreground">Powerful tools to build and deploy AI agents</p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="node-card p-6 group"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 inline-flex p-3 rounded-lg bg-primary/10">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent mb-4">
                <Bot className="w-4 h-4" />
                Simple Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
            </motion.div>

            <div className="space-y-4">
              {steps.map((item) => (
                <motion.div
                  key={item.step}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {item.step}
                  </span>
                  <p className="text-foreground/80 group-hover:text-foreground transition-colors">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/50">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container mx-auto px-6"
        >
          <motion.div 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-center node-card p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Automate?</h2>
              <p className="text-muted-foreground mb-6">
                Start building your first AI agent in minutes.
              </p>
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 cursor-pointer">
                  <Sparkles className="w-5 h-5" />
                  {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Triggr" width={54} height={54} />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Triggr. All rights reserved.
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Built with ❤️ for automation
          </div>
        </div>
      </footer>
      </div>
    </main>
  )
}
