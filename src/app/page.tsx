'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex flex-col items-center justify-center px-4 py-8 animate-fadeIn">
      {/* Main Content */}
      <div className="text-center space-y-8 max-w-2xl">
        {/* Logo */}
        <div className="space-y-2 animate-slideDown">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Λ
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white">Afterlife</h1>
          <p className="text-xl text-purple-200 font-medium">
            Your Friend for Life and Beyond
          </p>
        </div>

        {/* Tagline */}
        <p className="text-lg text-purple-100 max-w-lg mx-auto leading-relaxed animate-fadeIn" style={{ animationDelay: '200ms' }}>
          Create your digital legacy, manage your will, and leave messages for your loved ones. Secure, private, and simple digital succession planning.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideUp" style={{ animationDelay: '400ms' }}>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 bg-gradient-to-r from-white to-purple-100 text-purple-900 font-bold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 min-w-40"
          >
            Get Started
          </Link>
          <a
            href="https://myafterlife.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300 min-w-40"
          >
            Learn More
          </a>
        </div>

        {/* Trust Badge */}
        <div className="pt-8 border-t border-white/20 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <p className="text-sm text-purple-200 mb-4">Trusted by thousands of users</p>
          <div className="flex justify-center gap-8 text-white/60 text-xs">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">10K+</span>
              <span>Users</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">100%</span>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">24/7</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
