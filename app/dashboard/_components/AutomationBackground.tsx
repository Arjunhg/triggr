'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingNode {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface ConnectionLine {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export function AutomationBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate floating nodes
  const nodes: FloatingNode[] = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + (i % 4) * 25 + Math.random() * 10,
    y: 15 + Math.floor(i / 4) * 40 + Math.random() * 20,
    size: 4 + Math.random() * 4,
    delay: i * 0.3,
    duration: 3 + Math.random() * 2,
  }));

  // Generate connection lines between nodes
  const connections: ConnectionLine[] = [
    { id: 0, x1: 15, y1: 20, x2: 35, y2: 25, delay: 0 },
    { id: 1, x1: 35, y1: 25, x2: 60, y2: 20, delay: 0.5 },
    { id: 2, x1: 60, y1: 20, x2: 85, y2: 30, delay: 1 },
    { id: 3, x1: 20, y1: 60, x2: 45, y2: 65, delay: 1.5 },
    { id: 4, x1: 45, y1: 65, x2: 70, y2: 55, delay: 2 },
    { id: 5, x1: 35, y1: 25, x2: 45, y2: 65, delay: 2.5 },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          {/* Gradient for lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated connection lines */}
        {connections.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: {
                duration: 2,
                delay: line.delay,
                ease: 'easeInOut',
              },
              opacity: {
                duration: 0.5,
                delay: line.delay,
              },
            }}
          />
        ))}

        {/* Data flow particles along lines */}
        {connections.map((line) => (
          <motion.circle
            key={`particle-${line.id}`}
            r="2"
            fill="var(--primary)"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{
              cx: [`${line.x1}%`, `${line.x2}%`],
              cy: [`${line.y1}%`, `${line.y2}%`],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: line.delay + 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'linear',
            }}
          />
        ))}
      </svg>

      {/* Floating nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full bg-primary/20 border border-primary/30"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: node.size,
            height: node.size,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Large ambient glow spots */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        style={{ left: '10%', top: '20%' }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-accent/5 blur-3xl"
        style={{ right: '15%', bottom: '30%' }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </div>
  );
}

// Smaller, simpler version for sidebars/cards
export function AutomationPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-dots opacity-20" />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/10 blur-2xl"
        style={{ right: '-10%', top: '20%' }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Status indicator with pulse effect
export function StatusPulse({ 
  status = 'active',
  size = 'sm' 
}: { 
  status?: 'active' | 'idle' | 'processing';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusColors = {
    active: 'bg-emerald-500',
    idle: 'bg-muted-foreground',
    processing: 'bg-primary',
  };

  return (
    <span className="relative flex">
      <motion.span
        className={`absolute inline-flex h-full w-full rounded-full ${statusColors[status]} opacity-75`}
        animate={{
          scale: status === 'processing' ? [1, 1.5, 1] : [1, 1.3, 1],
          opacity: [0.75, 0, 0.75],
        }}
        transition={{
          duration: status === 'processing' ? 1 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${statusColors[status]}`} />
    </span>
  );
}