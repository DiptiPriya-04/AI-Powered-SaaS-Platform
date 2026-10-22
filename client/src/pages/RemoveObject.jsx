import { Scissors, Sparkles, Download, X, Eye, EyeOff, Paintbrush, RotateCcw } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { inpaintCanvas } from '../utils/inpainting';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState('')
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [content, setContent] = useState('')
  const [blobResult, setBlobResult] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  // Brush & Inpainting canvas state
  const [brushSize, setBrushSize] = useState(25)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawnMask, setHasDrawnMask] = useState(false)

  const fileInputRef = useRef(null)
  const imageCanvasRef = useRef(null)
  const maskCanvasRef = useRef(null)
  const containerRef = useRef(null)

  const { theme } = useTheme();
  const { getToken } = useAuth()
  const { openUpgradeModal, refreshPlan } = usePlan();

  // Load selected file and setup canvases
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setInput(file)
    setContent('')
    setBlobResult(null)
    setHasDrawnMask(false)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Draw image on canvas once loaded
  useEffect(() => {
    if (!preview) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const imgCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imgCanvas || !maskCanvas) return;

      // Scale to reasonable max resolution while preserving aspect ratio
      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      imgCanvas.width = w;
      imgCanvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;

      const imgCtx = imgCanvas.getContext('2d');
      imgCtx.clearRect(0, 0, w, h);
      imgCtx.drawImage(img, 0, 0, w, h);

      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.clearRect(0, 0, w, h);
      setHasDrawnMask(false);
    };
    img.src = preview;
  }, [preview]);

  const clearSelection = () => {
    setInput(null)
    setPreview('')
    setContent('')
    setBlobResult(null)
    setHasDrawnMask(false)
    setStatusMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearMaskOnly = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setHasDrawnMask(false);
  }

  // Canvas drawing handlers
  const getCanvasCoords = (e) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawnMask(true);
  }

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawnMask(true);
  }

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input && !preview) {
      toast.error('Please upload an image first');
      return;
    }

    const objectName = object.trim();
    if (!objectName && !hasDrawnMask) {
      toast.error('Please either brush over the object on the image, or specify its name');
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Erasing object & synthesizing surrounding texture...");

      let processedBlob = null;
      let processedUrl = "";

      // 1. If mask was drawn on canvas, perform instant AI inpainting
      const imgCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      if (imgCanvas && maskCanvas && (hasDrawnMask || !objectName)) {
        const inpaintResult = inpaintCanvas(imgCanvas, maskCanvas);
        processedUrl = inpaintResult.toDataURL('image/png');
        processedBlob = await inpaintResult.toBlob();

        setContent(processedUrl);
        setBlobResult(processedBlob);
        toast.success("Object removed and background seamlessly filled!");
      }

      // 2. Also sync creation with backend to log in PostgreSQL and update quota
      setStatusMessage("Saving processed image to your account...");
      const formData = new FormData();
      if (processedBlob) {
        formData.append('image', processedBlob, 'object-removed.png');
      } else {
        formData.append('image', input);
      }
      formData.append('object', objectName || 'Unwanted object');

      const { data } = await axios.post(
        '/api/ai/remove-image-object',
        formData,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        if (!processedUrl && data.content) {
          setContent(data.content);
          toast.success("Object removed successfully!");
        }
        refreshPlan?.().catch(() => {});
      } else {
        if (!processedUrl) {
          toast.error(data.message || "Failed to remove object");
        }
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("upgrade") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      console.error("Remove object error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to remove object");
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
      link.download = `object-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      toast.success("Processed image downloaded!");
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
            theme === 'dark' ? 'text-[#4A7AFF]' : 'text-blue-600'
          }`}/>
          <div>
            <h1 className='text-xl font-semibold'>Object Removal & Inpainting</h1>
            <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Brush directly over the object to erase it and reconstruct background texture
            </p>
          </div>
        </div>
        
        <div className='space-y-6'>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Upload Image & Brush Object</label>
              
              {preview && hasDrawnMask && (
                <button
                  type="button"
                  onClick={clearMaskOnly}
                  className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Brush
                </button>
              )}
            </div>
            
            {preview ? (
              <div className="space-y-3">
                {/* Interactive Canvas container */}
                <div 
                  ref={containerRef}
                  className={`relative w-full rounded-lg overflow-hidden border cursor-crosshair ${
                    theme === 'dark' ? 'border-zinc-600 bg-zinc-950' : 'border-gray-300 bg-gray-100'
                  }`}
                  style={{ minHeight: '260px', maxHeight: '380px' }}
                >
                  <canvas 
                    ref={imageCanvasRef} 
                    className="w-full h-full object-contain pointer-events-none block max-h-[380px] mx-auto"
                  />
                  <canvas 
                    ref={maskCanvasRef} 
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full object-contain cursor-crosshair max-h-[380px] mx-auto"
                  />
                  
                  <button
                    type="button"
                    onClick={clearSelection}
                    className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-all ${
                      theme === 'dark' 
                        ? 'bg-zinc-800/80 hover:bg-zinc-700 text-white' 
                        : 'bg-gray-200/80 hover:bg-gray-300 text-zinc-900'
                    }`}
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <Paintbrush className="w-3 h-3 text-red-400" />
                    <span>{hasDrawnMask ? 'Mask ready to inpaint' : 'Brush over object to remove'}</span>
                  </div>
                </div>

                {/* Brush size controller */}
                <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300' : 'bg-gray-50 border-gray-200 text-zinc-700'
                }`}>
                  <span className="font-medium flex items-center gap-1.5">
                    <Paintbrush className="w-3.5 h-3.5 text-blue-500" /> Brush Size:
                  </span>
                  <div className="flex items-center gap-2">
                    {[15, 30, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBrushSize(size)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                          brushSize === size 
                            ? 'bg-blue-600 text-white' 
                            : theme === 'dark' ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600' : 'bg-white border text-zinc-700 hover:bg-gray-100'
                        }`}
                      >
                        {size === 15 ? 'Small' : size === 30 ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
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

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>Object Name (Optional when brushed)</label>
            <input
              type="text"
              value={object}
              onChange={(e) => setObject(e.target.value)}
              className={`w-full p-3 text-sm rounded-md border outline-none focus:ring-1 ${
                theme === 'dark' 
                  ? 'border-zinc-600 bg-zinc-800 focus:border-blue-500 focus:ring-blue-500 text-white' 
                  : 'border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-gray-900'
              }`}
              placeholder="e.g., watch, spoon, person, watermark"
            />
            <p className={`mt-1 text-xs ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
            }`}>Brush over the object on the image, or specify its name</p>
          </div>

          <button 
            disabled={loading || (!input && !preview)} 
            className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-3 text-sm rounded-lg transition-all hover:shadow-lg ${
              theme === 'dark' 
                ? 'hover:shadow-blue-500/20' 
                : 'hover:shadow-blue-400/30'
            } ${
              loading || (!input && !preview) ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {
              loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              : <Scissors className='w-5 h-5'/>
            }
            Remove Object & Inpaint
          </button>

          {loading && statusMessage && (
            <div className="flex items-center gap-2 justify-center text-xs text-blue-400 animate-pulse pt-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
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
            <Scissors className={`w-6 h-6 ${
              theme === 'dark' ? 'text-[#4A7AFF]' : 'text-blue-600'
            }`} />
            <div>
              <h1 className='text-xl font-semibold'>Processed Image</h1>
              {content && (
                <p className="text-xs text-green-500 font-medium">✓ Object Removed & Seamlessly Reconstructed</p>
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
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : theme === 'dark' 
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Toggle between original and inpainted image"
              >
                {showOriginal ? <EyeOff className='w-3.5 h-3.5' /> : <Eye className='w-3.5 h-3.5' />}
                {showOriginal ? 'Inpainted' : 'Compare'}
              </button>

              <button 
                onClick={downloadImage}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm"
                title="Download processed image"
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
              <Scissors className='w-10 h-10 opacity-50' />
              <p>{preview ? 'Brush over the object on the left, then click "Remove Object & Inpaint"' : 'Upload an image to get started'}</p>
            </div>
          </div>
        ) : (
          <div className={`relative flex-1 flex items-center justify-center overflow-hidden rounded-lg border ${
            theme === 'dark' ? 'border-zinc-700 bg-zinc-950' : 'border-gray-200 bg-gray-50'
          }`}>
            <img 
              src={showOriginal ? preview : content} 
              alt={showOriginal ? "original image" : "object removed image"} 
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

export default RemoveObject;
