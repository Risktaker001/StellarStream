'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Nebula Background */}
      <div className="absolute inset-0 -z-10">
        <div className="nebula-blob nebula-cyan" />
        <div className="nebula-blob nebula-violet" />
      </div>

      {/* CRT Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="crt-scanlines" />
      </div>

      <div className="glass-card p-12 max-w-2xl mx-4 text-center relative">
        {/* Glitch Animation Container */}
        <div className="relative mb-8">
          <motion.h1 
            className="text-8xl md:text-9xl font-heading font-black glitch-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            404
          </motion.h1>
          
          {/* Glitch Layers */}
          <div className="glitch-layer glitch-layer-1" aria-hidden="true">404</div>
          <div className="glitch-layer glitch-layer-2" aria-hidden="true">404</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold liquid-chrome">
            System Glitch Detected
          </h2>
          
          <p className="text-lg text-white/80 max-w-md mx-auto">
            The requested interface module could not be located in the Stellar network. 
            The system has encountered an unexpected pathway disruption.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/">
              <motion.button
                className="glass-card px-8 py-4 neon-glow hover:neon-glow-hover transition-all duration-300 flex items-center gap-3 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={20} />
                Re-initialize Interface
              </motion.button>
            </Link>
            
            <motion.button
              onClick={() => window.location.reload()}
              className="glass-card px-8 py-4 border-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} />
              Retry Connection
            </motion.button>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-secondary rounded-full animate-pulse delay-1000" />
      </div>
    </div>
  );
}