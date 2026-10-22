import { Image, Sparkles, Download, Crown } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Realistic style', '3D style', 'Portrait style']
    
  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [downloading, setDownloading] = useState(false)
  const { theme } = useTheme();
  const { getToken } = useAuth()
  const { openUpgradeModal, refreshPlan, isPremium } = usePlan();

  const onSubmitHandler = async (e)=>{
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a description for the image");
      return;
    }

    try {
      setLoading(true)

      const styleEnhancers = {
        'Realistic': 'photorealistic, ultra high resolution 8k photography, cinematic lighting, sharp focus, hyper-detailed, masterpiece',
        'Ghibli style': 'Studio Ghibli art style, anime aesthetic, painted scenery, soft lighting, vibrant colors, Hayao Miyazaki aesthetic, beautiful atmosphere',
        'Anime style': 'high quality anime illustration, Makoto Shinkai style, vibrant colors, detailed line art, dynamic lighting, masterpiece',
        'Cartoon style': 'modern cartoon 2D character art, Pixar style vector illustration, bold clean outlines, vibrant colors',
        'Fantasy style': 'epic fantasy digital painting, magical atmosphere, glowing mystical lighting, ArtStation trending, intricate details',
        'Realistic style': 'hyper-realistic portrait photography, shallow depth of field, 8k resolution, photorealism',
        '3D style': 'Pixar 3D animated character render, octane 3D render, smooth subsurface scattering, Unreal Engine 5 aesthetic',
        'Portrait style': 'professional studio portrait, 85mm lens, soft lighting, sharp focus on subject, aesthetic photography'
      };

      const cleanInput = input.trim();
      const styleDesc = styleEnhancers[selectedStyle] || selectedStyle;
      const enrichedPrompt = `${cleanInput}, ${styleDesc}`;

      const { data } = await axios.post(
        '/api/ai/generate-image', 
        { prompt: enrichedPrompt, rawPrompt: cleanInput, style: selectedStyle, publish }, 
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content)
        toast.success("Image generated successfully!")
        refreshPlan?.().catch(() => {})
      }else{
        toast.error(data.message)
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("upgrade") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!content) return;
    
    try {
      setDownloading(true);
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  }

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
            theme === 'dark' ? 'text-[#4A7AFF]' : 'text-blue-600'
          }`}/>
          <h1 className='text-xl font-semibold'>Image Configuration</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Image Description</label>
            <textarea 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              rows={4}
              className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 border-zinc-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`} 
              placeholder='Describe what you want to see in the image...' 
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Image Style</label>
            <div className='flex flex-wrap gap-2'>
              {imageStyle.map((item, index)=>(
                <button
                  type="button"
                  onClick={()=> setSelectedStyle(item)} 
                  className={`px-4 py-2 text-sm rounded-full transition-all border ${
                    selectedStyle === item 
                      ? theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                      : theme === 'dark'
                        ? 'bg-zinc-800 text-gray-300 border-zinc-700 hover:border-zinc-500'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`} 
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={publish} 
                onChange={(e)=>setPublish(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-700 peer-checked:bg-blue-500 after:bg-white'
                  : 'bg-gray-300 peer-checked:bg-blue-500 after:bg-white'
              }`}></div>
            </label>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Make this image public</span>
          </div>

          <button 
            disabled={loading} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg ${
              theme === 'dark' 
                ? 'hover:shadow-blue-500/20' 
                : 'hover:shadow-blue-400/30'
            } ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Image className='w-5 h-5'/>
            }
            Generate Image
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
            <Image className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#4A7AFF]' : 'text-blue-600'
            }`} />
            <h1 className='text-xl font-semibold'>Generated Image</h1>
          </div>
          {content && (
            <button 
              onClick={downloadImage}
              disabled={downloading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                theme === 'dark' 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Download image"
            >
              {downloading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <>
                  <Download className='w-4 h-4' />
                  Download
                </>
              )}
            </button>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Image className='w-10 h-10 opacity-50' />
              <p>Enter a description and click "Generate Image" to get started</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center overflow-hidden'>
            <img 
              src={content} 
              alt="generated content" 
              className={`w-full h-full object-contain max-h-[70vh] rounded-lg ${
                theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
              } border`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages
