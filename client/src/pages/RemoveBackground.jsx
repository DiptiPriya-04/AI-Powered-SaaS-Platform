import { Eraser, Sparkles, Download, X, Eye, EyeOff } from 'lucide-react';
import React, { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { removeBackground } from '@imgly/background-removal';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [content, setContent] = useState('')
  const [blobResult, setBlobResult] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const fileInputRef = useRef(null)
  const { theme } = useTheme();
  const { getToken } = useAuth()
  const { openUpgradeModal, refreshPlan } = usePlan();

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setInput(file)
    setContent('')
    setBlobResult(null)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const clearSelection = () => {
    setInput(null)
    setPreview('')
    setContent('')
    setBlobResult(null)
    setStatusMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) return;
    
    try {
      setLoading(true);
      setStatusMessage("AI model initializing...");

      // 1. Process with high-accuracy client-side AI model
      let transparentBlob = null;
      try {
        setStatusMessage("Segmenting foreground & removing background...");
        transparentBlob = await removeBackground(input, {
          progress: (key, current, total) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              setStatusMessage(`AI removing background (${pct}%)...`);
            }
          }
        });
      } catch (clientErr) {
        console.warn("Client AI model notice:", clientErr);
      }

      if (transparentBlob) {
        const objectUrl = URL.createObjectURL(transparentBlob);
        setContent(objectUrl);
        setBlobResult(transparentBlob);
        toast.success("Background removed successfully!");
      }

      // 2. Sync creation with backend to update quota & database
      setStatusMessage("Saving creation to account...");
      const formData = new FormData();
      if (transparentBlob) {
        formData.append('image', transparentBlob, 'background-removed.png');
      } else {
        formData.append('image', input);
      }

      const { data } = await axios.post(
        '/api/ai/remove-image-background',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        if (!transparentBlob && data.content) {
          setContent(data.content);
          toast.success("Background removed successfully!");
        }
        refreshPlan?.().catch(() => {});
      } else {
        if (!transparentBlob) {
          toast.error(data.message || "Failed to remove background");
        }
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("upgrade") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      console.error("Remove background error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to remove background");
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  const downloadImage = async () => {
    if (!content && !blobResult) return;
    
    try {
      setDownloading(true);
      let downloadUrl = content;
      
      if (blobResult) {
        downloadUrl = window.URL.createObjectURL(blobResult);
      } else if (content.startsWith('http')) {
        const response = await fetch(content);
        const blob = await response.blob();
        downloadUrl = window.URL.createObjectURL(blob);
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `background-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      toast.success("Transparent PNG downloaded!");
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
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
            theme === 'dark' ? 'text-[#FF4938]' : 'text-red-600'
          }`}/>
          <h1 className='text-xl font-semibold'>Background Removal</h1>
        </div>
        
        <div className='space-y-6'>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Upload Image</label>
            
            {preview ? (
              <div className={`relative w-full rounded-lg overflow-hidden border ${
                theme === 'dark' ? 'border-zinc-600' : 'border-gray-300'
              }`}>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className={`w-full h-64 object-contain ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className={`absolute top-2 right-2 p-1 rounded-full hover:bg-opacity-80 transition-all ${
                    theme === 'dark' 
                      ? 'bg-zinc-800/80 hover:bg-zinc-700' 
                      : 'bg-gray-200/80 hover:bg-gray-300'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  theme === 'dark' 
                    ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700/50' 
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className={`w-8 h-8 mb-4 ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                    }`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className={`mb-2 text-sm ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                    }`}>PNG, JPG, JPEG (MAX. 10MB)</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    type="file" 
                    accept='image/*' 
                    className="hidden" 
                    required
                  />
                </label>
              </div>
            )}
          </div>

          <button 
            disabled={loading || !input} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg ${
              theme === 'dark' 
                ? 'hover:shadow-orange-500/20' 
                : 'hover:shadow-orange-400/30'
            } ${
              loading || !input ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Eraser className='w-5 h-5'/>
            }
            Remove Background
          </button>

          {loading && statusMessage && (
            <div className="flex items-center gap-2 justify-center text-xs text-orange-400 animate-pulse pt-1">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
              <span>{statusMessage}</span>
            </div>
          )}
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
            <Eraser className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#FF4938]' : 'text-red-600'
            }`} />
            <div>
              <h1 className='text-xl font-semibold'>Processed Image</h1>
              {content && (
                <p className="text-xs text-green-500 font-medium">✓ Background Isolated & Removed</p>
              )}
            </div>
          </div>
          {content && (
            <div className='flex items-center gap-2'>
              <button 
                type="button"
                onClick={() => setShowOriginal(!showOriginal)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showOriginal 
                    ? 'bg-orange-500 text-white shadow-sm' 
                    : theme === 'dark' 
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Toggle between original and cutout"
              >
                {showOriginal ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                {showOriginal ? 'Cutout' : 'Compare'}
              </button>

              <button 
                onClick={downloadImage}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-sm"
                title="Download transparent cutout PNG"
              >
                {downloading ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : (
                  <>
                    <Download className='w-3.5 h-3.5' />
                    Download PNG
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {!content ? (
          <div className='flex-1 flex flex-col justify-center items-center text-center p-6'>
            <div className={`text-sm flex flex-col items-center gap-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Eraser className='w-10 h-10 opacity-50' />
              <p>{preview ? 'Click "Remove Background" to process' : 'Upload an image to get started'}</p>
            </div>
          </div>
        ) : (
          <div 
            style={!showOriginal ? {
              backgroundImage: theme === 'dark' 
                ? 'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)'
                : 'linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)',
              backgroundColor: theme === 'dark' ? '#27272a' : '#f4f4f5',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            } : {}}
            className={`relative flex-1 flex items-center justify-center overflow-hidden rounded-lg border ${
              theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'
            }`}
          >
            <img 
              src={showOriginal ? preview : content} 
              alt={showOriginal ? "original image" : "background removed transparent image"} 
              className="w-full h-full object-contain max-h-[70vh] rounded-lg transition-all"
            />
            {showOriginal && (
              <span className="absolute top-3 left-3 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded font-medium backdrop-blur-sm">
                Original Preview
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground;
