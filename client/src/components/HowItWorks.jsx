import React, { useRef, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { steps } from '../assets/assets'
import { useTheme } from '../context/ThemeContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HowItWorks = () => {
  const { user } = useUser()
  const { theme } = useTheme()
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const stepsRef = useRef([])
  const backgroundRef = useRef(null)

  useEffect(() => {
    // Component mounted cleanly
  }, [])

  return (
    <div 
      ref={containerRef} 
      className={`px-4 sm:px-20 xl:px-32 relative overflow-hidden py-16 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}
    >
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-green-500/5 to-teal-500/5' 
            : 'bg-gradient-to-r from-green-100/50 to-teal-100/50'
        }`}></div>
        <div className={`absolute top-32 right-16 w-80 h-80 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-amber-500/5 to-orange-500/5' 
            : 'bg-gradient-to-r from-amber-100/50 to-orange-100/50'
        }`}></div>
      </div>
      
      <div className='text-center relative z-10 mb-16'>
        <h2 
          ref={titleRef} 
          className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' 
              ? 'text-white bg-gradient-to-r from-white via-green-100 to-white bg-clip-text' 
              : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-green-800 to-zinc-900 bg-clip-text'
          }`}
        >
          How It Works
        </h2>
        <p 
          ref={subtitleRef} 
          className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
          }`}
        >
          Get started in just three simple steps to unlock your creative potential
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10'>
        {steps.map((step, index) => (
          <div 
            key={index}
            ref={el => stepsRef.current[index] = el}
            className={`group relative p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-zinc-900/80 border-zinc-800/50 hover:border-green-400/30'
                : 'bg-white/90 border-zinc-200/80 hover:border-green-500/30'
            }`}
          >
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-green-500/0 to-teal-500/0'
                : 'bg-gradient-to-br from-green-100/0 to-teal-100/0'
            }`}></div>
            
            <div className='relative z-10'>
              <div className={`w-16 h-16 mb-6 flex items-center justify-center text-2xl font-bold rounded-full ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white'
                  : 'bg-gradient-to-br from-green-400 to-teal-400 text-white'
              }`}>
                {step.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-white group-hover:text-green-300'
                  : 'text-zinc-800 group-hover:text-green-600'
              }`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-gray-300'
                  : 'text-zinc-600 group-hover:text-zinc-800'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowItWorks