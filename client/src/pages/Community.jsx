import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { theme } = useTheme()

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creation', { id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
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
    if (user) {
      fetchCreations()
    }
  }, [user])

  return !loading ? (
    <div className={`flex-1 h-full flex flex-col gap-4 p-6 ${
      theme === 'dark' ? 'text-white' : 'text-gray-900'
    }`}>
      <h1 className='text-xl font-semibold'>Community Creations</h1>
      <div className={`h-full w-full rounded-xl overflow-y-auto ${
        theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-100'
      }`}>
        {creations.length > 0 ? (
          <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 p-4'>
            {creations.map((creation, index) => {
              const likesArray = Array.isArray(creation.likes) ? creation.likes : [];
              const isLiked = user?.id ? likesArray.includes(user.id.toString()) : false;

              return (
                <div key={creation.id || index} className='relative group mb-4 break-inside-avoid rounded-lg overflow-hidden'>
                  <img 
                    src={creation.content} 
                    alt={creation.prompt || "Community creation"} 
                    className='w-full h-auto rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]' 
                  />

                  <div className={`absolute inset-0 flex flex-col justify-end p-3 rounded-lg transition-opacity duration-200 ${
                    theme === 'dark'
                      ? 'group-hover:bg-gradient-to-b from-transparent via-black/40 to-black/80'
                      : 'group-hover:bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80'
                  }`}>
                    {creation.prompt && (
                      <p className={`text-sm hidden group-hover:block mb-2 font-medium line-clamp-3 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-100'
                      }`}>{creation.prompt}</p>
                    )}
                    <div className='flex gap-1.5 items-center justify-end group-hover:justify-between'>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        theme === 'dark' ? 'bg-black/60 text-white' : 'bg-gray-800/60 text-gray-100'
                      }`}>
                        {likesArray.length} {likesArray.length === 1 ? 'like' : 'likes'}
                      </span>
                      <button
                        type="button"
                        onClick={() => imageLikeToggle(creation.id)}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none"
                        aria-label="Like creation"
                      >
                        <Heart 
                          className={`w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${
                            isLiked
                              ? 'fill-red-500 text-red-500' 
                              : theme === 'dark' 
                                ? 'text-white' 
                                : 'text-gray-100'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Heart className={`w-12 h-12 mb-3 opacity-40 ${
              theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
            }`} />
            <h3 className="text-lg font-semibold mb-1">No community creations yet</h3>
            <p className={`text-sm max-w-sm ${
              theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              Generate stunning AI images in Generate Images tool and choose "Make this image public" to publish them here!
            </p>
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
