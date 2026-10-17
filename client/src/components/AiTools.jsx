import React, { useEffect, useRef } from 'react'
import { AiToolsData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const AiTools = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  
  // Animation refs
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const toolsGridRef = useRef(null)
  const toolCardsRef = useRef([])
  const backgroundRef = useRef(null)
  
  useEffect(() => {
    // Load GSAP
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
    script.onload = () => {
      const { gsap } = window
      
      // Load ScrollTrigger
      const scrollScript = document.createElement('script')
      scrollScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'
      scrollScript.onload = () => {
        gsap.registerPlugin(window.ScrollTrigger)
        
        // Set initial states - more subtle
        gsap.set([titleRef.current, subtitleRef.current], {
          opacity: 0,
          y: 30
        })
        
        gsap.set(toolCardsRef.current, {
          opacity: 0,
          y: 40,
          scale: 0.95
        })
        
        // Main entrance animation - smoother and faster
        const mainTL = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        })
        
        // Title animation - elegant entrance
        mainTL.to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        })
        
        // Subtitle follows quickly
        .to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out"
        }, "-=0.4")
        
        // Cards animate in sequence - more refined
        .to(toolCardsRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: {
            amount: 0.8,
            from: "start"
          }
        }, "-=0.2")
        
        // Enhanced but subtle card interactions
        toolCardsRef.current.forEach((card) => {
          if (card) {
            let hoverTL = gsap.timeline({ paused: true })
            
            // Create hover timeline once
            hoverTL
              .to(card, {
                y: -8,
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out"
              }, 0)
              .to(card.querySelector('.tool-icon'), {
                scale: 1.1,
                duration: 0.3,
                ease: "back.out(1.7)"
              }, 0)
              .to(card.querySelector('.card-glow'), {
                opacity: 0.08,
                duration: 0.3,
                ease: "power2.out"
              }, 0)
            
            // Mouse events
            card.addEventListener('mouseenter', () => {
              hoverTL.play()
            })
            
            card.addEventListener('mouseleave', () => {
              hoverTL.reverse()
            })
            
            // Subtle click feedback
            card.addEventListener('mousedown', () => {
              gsap.to(card, {
                scale: 0.98,
                duration: 0.1,
                ease: "power2.out"
              })
            })
            
            card.addEventListener('mouseup', () => {
              gsap.to(card, {
                scale: 1.02,
                duration: 0.2,
                ease: "back.out(2)"
              })
            })
          }
        })
        
        // Subtle parallax - much gentler
        gsap.to(toolCardsRef.current, {
          y: -20,
          scrollTrigger: {
            trigger: toolsGridRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2
          }
        })
        
        // Background elements gentle animation
        gsap.to(backgroundRef.current.children, {
          y: -30,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 3
          }
        })
      }
      
      document.head.appendChild(scrollScript)
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup
      const scripts = document.querySelectorAll('script[src*="gsap"]')
      scripts.forEach(script => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      })
    }
  }, [])

  return (
    <div id="AiTools"
      ref={containerRef} 
      className={`px-4 sm:px-20 xl:px-32 relative overflow-hidden py-16 ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
      }`}
    >
      {/* Background decorative elements - improved positioning */}
      <div ref={backgroundRef} className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5' 
            : 'bg-gradient-to-r from-blue-100/50 to-cyan-100/50'
        }`}></div>
        <div className={`absolute top-32 right-16 w-80 h-80 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-500/5 to-pink-500/5' 
            : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50'
        }`}></div>
        <div className={`absolute bottom-32 left-1/3 w-56 h-56 rounded-full blur-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-indigo-500/5 to-blue-500/5' 
            : 'bg-gradient-to-r from-indigo-100/50 to-blue-100/50'
        }`}></div>
      </div>
      
      {/* Content section */}
      <div className='text-center relative z-10 mb-16'>
        <h2 
          ref={titleRef} 
          className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' 
              ? 'text-white bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text' 
              : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-blue-800 to-zinc-900 bg-clip-text'
          }`}
        >
          AI-Powered Creation Suite
        </h2>
        <p 
          ref={subtitleRef} 
          className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
          }`}
        >
          Transform your ideas into reality with our comprehensive AI-powered toolkit designed for modern creators
        </p>
      </div>

      {/* Tools grid - 3 columns layout */}
      <div ref={toolsGridRef} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10'>
        {AiToolsData.map((tool, index) => (
          <div 
            key={index} 
            ref={el => toolCardsRef.current[index] = el}
            className={`group relative p-6 rounded-2xl backdrop-blur-sm border cursor-pointer transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-zinc-900/80 border-zinc-800/50 hover:border-zinc-700/50'
                : 'bg-white/90 border-zinc-200/80 hover:border-zinc-300/80'
            }`}
            onClick={() => navigate(tool.path)}
          >
            {/* Background glow effect */}
            <div className={`card-glow absolute inset-0 rounded-2xl opacity-0 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0'
                : 'bg-gradient-to-br from-blue-100/0 via-purple-100/0 to-pink-100/0'
            }`}></div>
            
            {/* Card content */}
            <div className='relative z-10'>
              {/* Icon container */}
              <div className='mb-6'>
                <tool.Icon 
                  className='tool-icon w-12 h-12 p-3 text-white rounded-xl shadow-lg transition-all duration-300' 
                  style={{
                    background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})`
                  }}
                />
              </div>
              
              {/* Content */}
              <h3 className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-white group-hover:text-blue-300'
                  : 'text-zinc-800 group-hover:text-blue-600'
              }`}>
                {tool.title}
              </h3>
              <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-gray-400 group-hover:text-gray-300'
                  : 'text-zinc-600 group-hover:text-zinc-800'
              }`}>
                {tool.description}
              </p>
            </div>
            
            {/* Subtle border highlight on hover */}
            <div className={`absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 ${
              theme === 'dark'
                ? 'group-hover:border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'
                : 'group-hover:border-gradient-to-r from-blue-300/30 via-purple-300/30 to-pink-300/30'
            }`}></div>
            
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-white/5 to-transparent'
                : 'bg-gradient-to-br from-zinc-100/50 to-transparent'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AiTools