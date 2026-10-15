import React, { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FAQ = () => {
  const { theme } = useTheme()
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const backgroundRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: "What types of content can I create with these tools?",
      answer:
        "Our platform uses advanced APIs like Google's Gemini and ClickDrop to offer content generation, image editing, PDF analysis, and text enhancement across both free and premium plans."
    },
    {
      question: "How accurate are the AI-generated results?",
      answer:
        "While our platform uses powerful AI models (Gemini and ClickDrop), outputs may not always be 100% accurate. We recommend reviewing all AI-generated content before using it in professional or important settings."
    },
    {
      question: "Do I need technical skills to use these tools?",
      answer:
        "Not at all! Our tools are designed with intuitive, user-friendly interfaces suitable for everyone, regardless of technical background."
    },
    {
      question: "How does the pricing work?",
      answer:
        `Free Tier (30 credits/month):
        - AI Content Generator
        - Title Suggestor
        - Text Humanizer
        - Resume Review
        - Calculate ATS Score

        Premium Plan:
        - Image Generator (via ClickDrop)
        - Remove Image Background
        - Remove Object from Image
        - ChatWithPDF (via Gemini)
        - Unlimited credits
        - Priority processing`
    },
    {
      question: "Is my data secure with your platform?",
      answer:
        "We implement strong security measures including encryption. However, some processing happens through third-party APIs like Gemini and ClickDrop, which follow their own security practices."
    },
    {
      question: "What happens if I use all my free credits?",
      answer:
        "Free users receive 30 credits each month. Once these are used up, you can either wait until the next month for renewal or upgrade to the premium plan for unlimited access."
    },
    {
      question: "Which third-party services do you integrate with?",
      answer:
        "Currently, we integrate with Google's Gemini API for text-based features and ClickDrop for image-related functionality. We plan to expand our integrations in the future."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mainTL = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      })
      
      mainTL.from([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.2,
        ease: "power2.out"
      })
    }, containerRef)

    return () => {
      ctx.revert()
    }
  }, [])

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

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
            ? 'bg-gradient-to-r from-purple-500/5 to-indigo-500/5'
            : 'bg-gradient-to-r from-purple-100/50 to-indigo-100/50'
        }`}></div>
        <div className={`absolute bottom-32 right-16 w-80 h-80 rounded-full blur-3xl ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-pink-500/5 to-rose-500/5'
            : 'bg-gradient-to-r from-pink-100/50 to-rose-100/50'
        }`}></div>
      </div>
      
      <div className='text-center relative z-10 mb-16'>
        <h2 
          ref={titleRef} 
          className={`text-4xl md:text-5xl font-bold mb-6 bg-clip-text ${
            theme === 'dark'
              ? 'text-white bg-gradient-to-r from-white via-purple-100 to-white'
              : 'text-zinc-900 bg-gradient-to-r from-zinc-900 via-purple-600 to-zinc-900'
          }`}
        >
          Frequently Asked Questions
        </h2>
        <p 
          ref={subtitleRef} 
          className={`text-lg max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
          }`}
        >
          Find answers to common questions about our AI tools and services
        </p>
      </div>

      <div className='max-w-4xl mx-auto relative z-10 space-y-4'>
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={`group rounded-xl backdrop-blur-sm overflow-hidden transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-zinc-900/80 border border-zinc-800/50'
                : 'bg-white/90 border border-zinc-200/80'
            }`}
          >
            <button
              className='w-full flex justify-between items-center p-6 text-left'
              onClick={() => toggleFAQ(index)}
            >
              <h3 className={`text-lg font-medium transition-colors duration-300 ${
                theme === 'dark'
                  ? 'text-white group-hover:text-purple-300'
                  : 'text-zinc-800 group-hover:text-purple-600'
              }`}>
                {faq.question}
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                theme === 'dark' ? 'text-gray-400' : 'text-zinc-500'
              } ${activeIndex === index ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`px-6 pb-6 pt-0 transition-all duration-300 overflow-hidden ${
                activeIndex === index ? 'max-h-96' : 'max-h-0'
              } ${
                theme === 'dark' ? 'text-gray-400' : 'text-zinc-600'
              }`}
              style={{ display: activeIndex === index ? 'block' : 'none' }}
            >
              {typeof faq.answer === 'string' ? (
                faq.answer.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))
              ) : (
                <p>{faq.answer}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQ