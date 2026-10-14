import { useAuth } from '@clerk/clerk-react';
import { Hash, Sparkles, Copy, RotateCw, Crown } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = ['General', 'Technology', 'Business', 'Health', 'Lifestyle', 'Education', 'Travel', 'Food']
  const inspirationTopics = ['Artificial Intelligence', 'SaaS Growth', 'Web Development', 'Remote Productivity', 'Cloud Architecture']
  
  const [selectedCategory, setSelectedCategory] = useState('General')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const { theme } = useTheme();
  const { getToken } = useAuth()
  const { openUpgradeModal, refreshPlan, isPremium } = usePlan();

  const onSubmitHandler = async (e)=>{
    if (e) e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a keyword or topic");
      return;
    }

    try {
      setLoading(true)
      const prompt = `Generate 10 catchy, viral blog titles for the keyword ${input.trim()} in the category ${selectedCategory}.`

      const { data } = await axios.post(
        '/api/ai/generate-blog-title', 
        { prompt, keyword: input.trim(), category: selectedCategory }, 
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )

      if (data.success) {
        setContent(data.content)
        toast.success("10 Fresh Titles Generated!")
        refreshPlan?.().catch(() => {})
      } else {
        toast.error(data.message || "Failed to generate titles")
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success('Titles copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy titles');
      });
  };

  return (
    <div className={`h-full overflow-y-auto p-6 flex flex-col md:flex-row gap-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Input Section */}
      <form onSubmit={onSubmitHandler} className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center gap-3 mb-6'>
          <Sparkles className={`w-6 h-6 ${
            theme === 'dark' ? 'text-[#8E37EB]' : 'text-purple-600'
          }`}/>
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Keyword or Topic</label>
            <input 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              type="text" 
              className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 border-zinc-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`} 
              placeholder='e.g. Artificial Intelligence, SaaS Growth, Next.js...' 
              required
            />
            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className={`text-[11px] ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Suggestions:
              </span>
              {inspirationTopics.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setInput(topic)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                    input === topic
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : theme === 'dark'
                        ? 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Category</label>
            <div className='flex flex-wrap gap-2'>
              {blogCategories.map((item)=>(
                <button
                  type="button"
                  onClick={()=> setSelectedCategory(item)} 
                  className={`px-4 py-2 text-sm rounded-full transition-all border ${
                    selectedCategory === item 
                      ? theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' 
                        : 'bg-purple-100 text-purple-700 border-purple-300'
                      : theme === 'dark'
                        ? 'bg-zinc-800 text-gray-300 border-zinc-700 hover:border-zinc-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`} 
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={loading} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-3 text-sm font-semibold rounded-lg transition-all hover:shadow-lg cursor-pointer ${
              theme === 'dark' 
                ? 'hover:shadow-purple-500/20' 
                : 'hover:shadow-purple-400/30'
            } ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Crafting fresh titles...
                </>
              ) : (
                <>
                  <Hash className='w-5 h-5'/>
                  Generate 10 Viral Titles
                </>
              )
            }
          </button>
        </div>
      </form>

      {/* Output Section */}
      <div className={`w-full md:w-1/2 p-6 rounded-xl border shadow-lg flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)] ${
        theme === 'dark' 
          ? 'bg-zinc-900 border-zinc-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Hash className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#8E37EB]' : 'text-purple-600'
            }`} />
            <div>
              <h1 className='text-xl font-semibold'>Generated Titles</h1>
              {content && (
                <span className="text-xs text-purple-500 font-medium">
                  {selectedCategory} • 10 Angles
                </span>
              )}
            </div>
          </div>
          {content && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onSubmitHandler}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 border border-purple-500/30' 
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title="Generate another fresh batch"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Copy titles"
              >
                <Copy className='w-3.5 h-3.5' />
                Copy
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Hash className='w-10 h-10 opacity-50' />
              <p>Enter a topic and click "Generate title" to get started</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto pr-2'>
            <div className={`reset-tw prose max-w-none ${
              theme === 'dark' ? 'prose-invert' : ''
            }`}>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogTitles
