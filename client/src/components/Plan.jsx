import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { usePlan } from '../context/PlanContext'

const plans = [
  {
    id: 'free',
    name: 'Starter',
    tagline: 'Ideal for trying out our full suite of AI tools',
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    badge: null,
    features: [
      '5 free AI creation credits',
      'AI Article & Blog generator',
      'Standard AI Image generator',
      'Basic ATS Resume Score check',
      'Community showcase access',
      'Standard processing speed'
    ],
    cta: 'Get Started Free',
    buttonVariant: 'outline'
  },
  {
    id: 'pro',
    name: 'Pro Creator',
    tagline: 'For creators, developers, and power users needing scale',
    monthlyPrice: 19,
    annualPrice: 15,
    popular: true,
    badge: 'Most Popular',
    features: [
      'Unlimited AI creations & articles',
      'High-res 4K AI Image generation',
      'Advanced ATS Resume breakdown & suggestions',
      'Chat with PDF with full memory',
      'AI Background & Object Removal',
      'Humanize AI text generator',
      'Priority GPU generation speed',
      'Early access to new AI models'
    ],
    cta: 'Upgrade to Pro',
    buttonVariant: 'primary'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For agencies and teams needing custom workflows and volume',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: false,
    badge: 'Best Value',
    features: [
      'Everything in Pro Creator',
      'Multi-seat team collaboration',
      'Dedicated high-speed API endpoints',
      'Custom prompts & branding',
      'Export detailed ATS audit reports',
      'Priority 24/7 dedicated support',
      '99.9% uptime SLA'
    ],
    cta: 'Get Enterprise',
    buttonVariant: 'outline'
  }
]

const Plan = ({ id = "Plan" }) => {
  const { theme } = useTheme()
  const [isAnnual, setIsAnnual] = useState(true)
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const { plan: currentPlan, isPremium, upgradeToPlan, loading } = usePlan()

  const handleAction = async (planId) => {
    if (!isSignedIn) {
      openSignIn()
      return
    }

    if (planId === 'free') {
      if (currentPlan === 'free') {
        navigate('/ai')
        return
      }
      const ok = await upgradeToPlan('free')
      if (ok) navigate('/ai')
      return
    }

    if (planId === 'pro' || planId === 'enterprise') {
      if (isPremium) {
        navigate('/ai')
        return
      }
      const ok = await upgradeToPlan('premium')
      if (ok) navigate('/ai')
    }
  }

  return (
    <section 
      id={id} 
      className={`py-20 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
      }`}
    >
      {/* Subtle background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] opacity-25 ${
          theme === 'dark' ? 'bg-indigo-600' : 'bg-blue-300'
        }`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Creative Plan
            </span>
          </h2>
          <p className={`mt-4 text-base sm:text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            Start for free and scale as your content workflows grow. Transparent pricing with zero hidden fees.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? (theme === 'dark' ? 'text-white' : 'text-zinc-900') : 'text-zinc-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle billing cycle"
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAnnual ? 'bg-indigo-600' : (theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-300')
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium inline-flex items-center gap-1.5 ${isAnnual ? (theme === 'dark' ? 'text-white' : 'text-zinc-900') : 'text-zinc-500'}`}>
              Annual
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            const isPopular = plan.popular

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 ${
                  isPopular
                    ? (theme === 'dark'
                        ? 'bg-zinc-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/15 scale-[1.02]'
                        : 'bg-white border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-[1.02]')
                    : (theme === 'dark'
                        ? 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border border-zinc-200 hover:border-zinc-300 shadow-md')
                }`}
              >
                {/* Popular / Best Value Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                      <Zap className="w-3 h-3 fill-current" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className={`text-xs mt-1.5 min-h-[32px] ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    ${price}
                  </span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {plan.monthlyPrice === 0 ? '/forever' : isAnnual ? '/month, billed yearly' : '/month'}
                  </span>
                </div>

                {/* CTA Button */}
                {(() => {
                  const isCurrent = (plan.id === 'free' && !isPremium) || ((plan.id === 'pro' || plan.id === 'enterprise') && isPremium);
                  let buttonText = plan.cta;
                  if (isCurrent) {
                    buttonText = "Current Plan";
                  } else if (plan.id === 'free' && isPremium) {
                    buttonText = "Switch to Starter Free";
                  } else if (isPremium) {
                    buttonText = "Included in Pro";
                  }

                  return (
                    <button
                      type="button"
                      disabled={loading || (isCurrent && isSignedIn)}
                      onClick={() => handleAction(plan.id)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mb-6 ${
                        isCurrent
                          ? (theme === 'dark' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-default' : 'bg-zinc-100 text-zinc-500 border border-zinc-300 cursor-default')
                          : isPopular
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50'
                            : theme === 'dark'
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300'
                      }`}
                    >
                      {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : isCurrent ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          {buttonText}
                        </>
                      ) : (
                        <>
                          {buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  );
                })()}

                {/* Feature List */}
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex-grow">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <div className={`mt-0.5 p-0.5 rounded-full ${
                          isPopular 
                            ? 'bg-indigo-500/10 text-indigo-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Security & Guarantee Note */}
        <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Cancel or switch plans anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Plan