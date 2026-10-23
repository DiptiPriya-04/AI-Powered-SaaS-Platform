import React, { useState } from 'react';
import { X, Check, Zap, Crown, Sparkles, Shield, ArrowRight, KeyRound, CheckCircle2, Loader2, Sparkle } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const UpgradeModal = () => {
  const { showUpgradeModal, closeUpgradeModal, upgradeToPlan, loading, isPremium, user } = usePlan();
  const { theme } = useTheme();
  const location = useLocation();

  // Modal flow state: 'select' | 'activating' | 'done'
  const [stage, setStage] = useState('select');
  const [activationMethod, setActivationMethod] = useState('instant'); // 'instant' | 'code'
  const [codeOrOtp, setCodeOrOtp] = useState('');
  const [activatingStep, setActivatingStep] = useState(0);

  if (!showUpgradeModal) return null;

  // Detect which tool page the user is currently on to tailor the unlock message
  const getToolContext = () => {
    const path = location.pathname;
    if (path.includes('generate-images')) {
      return {
        title: "AI Image Generator",
        verb: "Start Generating Images",
        icon: "🎨",
        desc: "Synthesize photorealistic 4K visual art in 8 curated styles"
      };
    }
    if (path.includes('remove-background')) {
      return {
        title: "AI Background Removal",
        verb: "Start Removing Backgrounds",
        icon: "🪄",
        desc: "Instant high-accuracy subject segmentation and clean PNG transparency"
      };
    }
    if (path.includes('remove-object')) {
      return {
        title: "AI Object Eraser & Inpainting",
        verb: "Start Erasing Objects",
        icon: "✂️",
        desc: "Brush over unwanted elements with smart neural texture reconstruction"
      };
    }
    if (path.includes('chat-with-pdf')) {
      return {
        title: "Chat With PDF Intelligence",
        verb: "Start Chatting with PDFs",
        icon: "📄",
        desc: "Upload documents and converse with full context memory"
      };
    }
    return {
      title: "CreationSuite Pro Studio",
      verb: "Start Using Pro Tools",
      icon: "👑",
      desc: "Unlimited visual generation, document intelligence, and content tools"
    };
  };

  const tool = getToolContext();

  const handleClose = () => {
    setStage('select');
    setCodeOrOtp('');
    closeUpgradeModal();
  };

  // Perform activation flow
  const handleActivate = async () => {
    if (activationMethod === 'code') {
      const trimmed = codeOrOtp.trim();
      if (!trimmed) {
        toast.error("Please enter an activation code or OTP");
        return;
      }
    }

    setStage('activating');
    setActivatingStep(0);

    // Simulate multi-step verification sequence
    setTimeout(() => setActivatingStep(1), 500);
    setTimeout(() => setActivatingStep(2), 1100);

    const success = await upgradeToPlan('premium', false);

    if (success) {
      setTimeout(() => {
        setStage('done');
      }, 1500);
    } else {
      setStage('select');
    }
  };

  const handleFinishAndUse = () => {
    handleClose();
    toast.success(`🎉 ${tool.title} is now unlocked! You can use it right now.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all duration-300 overflow-hidden ${
          theme === 'dark' 
            ? 'bg-zinc-900 border-zinc-800 text-white' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 cursor-pointer ${
            theme === 'dark' 
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' 
              : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =========================================================================
            STAGE 1: SELECTION & ACTIVATION OPTIONS ("activate jaisa option dalo")
           ========================================================================= */}
        {stage === 'select' && (
          <div className="relative z-10 animate-fade-in">
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md">
                <Crown className="w-3.5 h-3.5 text-amber-200" />
                Pro Activation Hub
              </span>
              <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Access
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">
              Activate{' '}
              <span className="bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
                CreationSuite Pro
              </span>
            </h2>
            <p className={`text-xs sm:text-sm mb-5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Unlock unlimited AI creations, full GPU pipeline, and remove all trial limits instantly.
            </p>

            {/* Target Tool Card */}
            <div className={`p-3.5 rounded-xl border mb-5 flex items-center gap-3 ${
              theme === 'dark' 
                ? 'bg-zinc-800/60 border-zinc-700/80' 
                : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Unlocking Feature:</p>
                </div>
                <h4 className="font-semibold text-sm truncate">{tool.title}</h4>
                <p className={`text-[11px] truncate ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {tool.desc}
                </p>
              </div>
            </div>

            {/* Activation Method Tabs */}
            <div className="mb-4">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                Choose Activation Method:
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivationMethod('instant')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activationMethod === 'instant'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  1-Click Activate
                </button>
                <button
                  type="button"
                  onClick={() => setActivationMethod('code')}
                  className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activationMethod === 'code'
                      ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Enter OTP / Code
                </button>
              </div>
            </div>

            {/* Tab 1: Instant Activation Info */}
            {activationMethod === 'instant' && (
              <div className={`p-4 rounded-xl border mb-5 transition-all ${
                theme === 'dark' 
                  ? 'bg-indigo-950/20 border-indigo-500/30' 
                  : 'bg-indigo-50/60 border-indigo-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      Pro Unlimited License
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    100% Free Demo Access
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-extrabold">$19</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    /month (Waived for Review & Demo)
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2 text-zinc-300 dark:text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Unlimited 4K Image Generations & Object Inpainting
                  </li>
                  <li className="flex items-center gap-2 text-zinc-300 dark:text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    High-accuracy Background Removal & Transparency
                  </li>
                  <li className="flex items-center gap-2 text-zinc-300 dark:text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Full Document PDF Chat with Infinite Memory
                  </li>
                </ul>
              </div>
            )}

            {/* Tab 2: OTP / Code Input ("activate jias otiop dalo") */}
            {activationMethod === 'code' && (
              <div className={`p-4 rounded-xl border mb-5 transition-all ${
                theme === 'dark' 
                  ? 'bg-amber-950/20 border-amber-500/30' 
                  : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Enter OTP or Activation Key
                  </span>
                  <span className="text-[11px] text-zinc-500">Instant Demo</span>
                </div>

                <div className="relative mb-2">
                  <input
                    type="text"
                    value={codeOrOtp}
                    onChange={(e) => setCodeOrOtp(e.target.value)}
                    placeholder="e.g., PRO2026 or 6-digit OTP (123456)"
                    className={`w-full py-2.5 px-3 rounded-lg border text-sm font-mono tracking-wider outline-none transition ${
                      theme === 'dark' 
                        ? 'bg-zinc-900 border-zinc-700 text-white focus:border-amber-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-amber-500'
                    }`}
                  />
                </div>

                <p className={`text-[11px] mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Quick autofill test codes (click any to apply):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['PRO2026', '123456', 'CREATOR_VIP'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCodeOrOtp(preset)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition border cursor-pointer ${
                        codeOrOtp === preset
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
                      }`}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA Button */}
            <div className="space-y-2.5">
              <button
                onClick={handleActivate}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Pro Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {activationMethod === 'instant' ? "Activate Pro Plan Now" : "Verify & Activate Pro"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Instant activation • All 10+ AI tools unlocked with zero wait time
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: ACTIVATING ANIMATION & VERIFICATION
           ========================================================================= */}
        {stage === 'activating' && (
          <div className="relative z-10 py-10 flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">Activating Your Pro License...</h3>
            <div className="space-y-1.5 text-xs text-zinc-400 max-w-xs">
              <p className={activatingStep >= 0 ? "text-indigo-400 font-semibold" : ""}>
                {activatingStep >= 0 ? "✓ Verifying account credentials..." : "• Verifying..."}
              </p>
              <p className={activatingStep >= 1 ? "text-indigo-400 font-semibold" : ""}>
                {activatingStep >= 1 ? "✓ Provisioning unlimited GPU quota..." : "• Provisioning GPU quota..."}
              </p>
              <p className={activatingStep >= 2 ? "text-indigo-400 font-semibold" : ""}>
                {activatingStep >= 2 ? "✓ Unlocking visual & PDF AI neural models..." : "• Unlocking models..."}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 3: DONE! ("pher jake done hua pher usko use krne do wo feature ai ka")
           ========================================================================= */}
        {stage === 'done' && (
          <div className="relative z-10 py-4 text-center animate-fade-in">
            {/* Glowing Success Icon */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-200" />
              PRO PLAN ACTIVE
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Done! Activation Successful 🎉
            </h2>
            <p className={`text-xs sm:text-sm max-w-sm mx-auto mb-6 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
            }`}>
              Congratulations! Your account is now upgraded to <strong className="text-amber-400">CreationSuite Pro</strong>. All feature locks have been lifted.
            </p>

            {/* Unlocked Capabilities Summary */}
            <div className={`p-4 rounded-xl border mb-6 text-left space-y-2 text-xs ${
              theme === 'dark' 
                ? 'bg-zinc-800/60 border-zinc-700/80' 
                : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Unlocked: {tool.title} (Full Unlimited Access)</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlocked: AI Background Removal & Object Inpainting</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlocked: Conversational PDF Chat Intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Removed 30-creation quota limit across all tools</span>
              </div>
            </div>

            {/* Main CTA: "Start Using [Feature] Now" */}
            <button
              type="button"
              onClick={handleFinishAndUse}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
            >
              <span>{tool.verb} Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
