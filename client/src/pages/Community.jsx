import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState, useCallback } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || ''

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { theme } = useTheme()

  const fetchCreations = useCallback(async () => {
    try {
      const token = await getToken().catch(() => null)
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get('/api/user/get-published-creations', { headers })
      if (data.success) {
        setCreations(data.creations || [])
      } else {
        toast.error(data.message || "Failed to load creations")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const imageLikeToggle = async (id) => {
    if (!user) {
      return toast.error("Please log in to like creations")
    }

    try {
      const token = await getToken().catch(() => null)
      const { data } = await axios.post('/api/user/toggle-like-creation', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(data.message)
        await fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    fetchCreations()
  }, [fetchCreations])

  return !loading ? (
    <div className={`flex-1 h-full flex flex-col gap-4 p-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      <div className="flex items-center justify-between">
        <h1 className='text-xl font-semibold'>Community Showcase</h1>
        <span className={`text-xs px-2.5 py-1 rounded-full ${
          theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-200 text-gray-700'
        }`}>
          {creations.length} shared creations
        </span>
      </div>

      <div className={`h-full w-full rounded-xl overflow-y-auto ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-100'
      }`}>
        {creations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Sparkles className="w-8 h-8 text-blue-500 opacity-60" />
            <p className="font-medium text-sm">No community creations yet</p>
            <p className="text-xs text-zinc-500">Create an image or article and toggle &apos;Publish to Community&apos; to share it here!</p>
          </div>
        ) : (
          <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 p-4'>
            {creations.map((creation, index) => {
              const safeLikes = Array.isArray(creation.likes) ? creation.likes : []
              const isLiked = Boolean(user?.id && safeLikes.includes(user.id))
              const isImage = creation.type === 'image' || (typeof creation.content === 'string' && creation.content.startsWith('http'))

              return (
                <div key={creation.id || index} className='relative group mb-4 break-inside-avoid rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900'>
                  {isImage ? (
                    <img 
                      src={creation.content} 
                      alt={creation.prompt || "AI Creation"} 
                      className='w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]' 
                    />
                  ) : (
                    <div className="p-4 text-xs leading-relaxed max-h-48 overflow-hidden text-zinc-300">
                      <p className="font-semibold text-blue-400 mb-2 capitalize">{creation.type?.replace('-', ' ')}</p>
                      <p className="line-clamp-6">{creation.content}</p>
                    </div>
                  )}

                  <div className={`p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent ${
                    isImage ? 'absolute inset-0 flex flex-col justify-end' : 'border-t border-zinc-800'
                  }`}>
                    <p className='text-xs text-zinc-200 line-clamp-2 mb-2 font-medium'>{creation.prompt}</p>
                    <div className='flex gap-2 items-center justify-between'>
                      <span className='text-xs text-zinc-400 font-mono'>{safeLikes.length} {safeLikes.length === 1 ? 'like' : 'likes'}</span>
                      <Heart 
                        onClick={() => imageLikeToggle(creation.id)} 
                        className={`w-4 h-4 cursor-pointer transition-transform hover:scale-125 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-white'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center h-full'>
      <span className={`w-10 h-10 my-1 rounded-full border-3 ${
        theme === 'dark' ? 'border-[#00DA83]' : 'border-green-500'
      } border-t-transparent animate-spin`}></span>
    </div>
  )
}

export default Community
