import React from 'react';
import { X, Check, Zap, Crown, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';

const UpgradeModal = () => {
  const { showUpgradeModal, closeUpgradeModal, upgradeToPlan, loading, plan } = usePlan();
  const { theme } = useTheme();

  if (!showUpgradeModal) return null;

  const features = [
    "Unlimited AI Creations across all tools",
    "High-speed 4K AI Image Generator",
    "Smart AI Background & Object Removal",
    "Multi-turn conversational Chat With PDF",
    "Comprehensive ATS Resume evaluation & scoring",
    "Text Humanizer & Viral Blog Title Suggester",
    "Priority GPU generation speed & zero wait time"
  ];

  const handleUpgrade = async () => {
    await upgradeToPlan('premium');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-800 text-white' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' 
              : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md">
            <Crown className="w-3.5 h-3.5" />
            Upgrade to Pro
          </span>
          <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Instant Activation
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Unlock Unlimited Power with{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            CreationSuite Pro
          </span>
        </h2>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Remove all generation caps, access high-resolution visual tools, and turbocharge your creative output with zero limitations.
        </p>

        {/* Price Card */}
        <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between ${
          theme === 'dark' 
            ? 'bg-zinc-800/60 border-zinc-700/80' 
            : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-500">
              Pro Creator Tier
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-extrabold">$19</span>
              <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                /month (Unlimited)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-semibold border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Full Access
          </div>
        </div>

        {/* Features list */}
        <div className="mb-6 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            What you get:
          </p>
          <ul className="space-y-2">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                <div className="mt-0.5 p-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            disabled={loading || plan === 'premium'}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : plan === 'premium' ? (
              <>
                <Crown className="w-4 h-4 text-amber-300" />
                Already Active on Premium
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Activate Premium Access Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            Instant upgrade • Cancel or switch plans anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
