import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'
import FAQ from '../components/FAQ'
import HowItWorks from '../components/HowItWorks'
import ProgressiveBlur from '../components/magicui/progressive-blur'


const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Navbar/>
      <main className="relative flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 overflow-hidden">
        <div className="space-y-16 md:space-y-20">
          <Hero id="Hero"/>
          <AiTools id="AiTools"/>
          <HowItWorks id="How It Works"/>
          <Testimonial id="Testimonial" />
          <Plan id="Plan"/>
          <FAQ id="FAQ"/>
        </div>
        
        {/* Add ProgressiveBlur*/}
        <ProgressiveBlur 
          height="100px" 
          position="bottom" 
          className="fixed bottom-0 left-0 right-0 pointer-events-none"
        />
      </main>
      <Footer/>
    </div>
  )
}

export default Home