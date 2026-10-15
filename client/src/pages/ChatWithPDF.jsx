import { FileText, MessageSquare, History, Send, Upload, X, Loader2, File, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ChatWithPDF = () => {
  const { openUpgradeModal, refreshPlan } = usePlan();
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(() => {
    const saved = localStorage.getItem('pdfChat_conversation');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(() => {
    const saved = localStorage.getItem('pdfChat_selectedFile');
    return saved ? JSON.parse(saved) : null;
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { theme } = useTheme();
  const { getToken } = useAuth();

  useEffect(() => {
    localStorage.setItem('pdfChat_selectedFile', JSON.stringify(selectedFile));
  }, [selectedFile]);

  useEffect(() => {
    localStorage.setItem('pdfChat_conversation', JSON.stringify(conversation));
  }, [conversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setPdfFile(files[0]);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await axios.get('/api/ai/pdf-chat-history', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load history');
        }

        if (data.files) {
          setChatHistory(data.files.map(fileName => ({ fileName })));
          
          const rawSavedFile = localStorage.getItem('pdfChat_selectedFile');
          let savedFile = null;
          try {
            savedFile = rawSavedFile ? JSON.parse(rawSavedFile) : null;
          } catch (e) {
            savedFile = rawSavedFile;
          }
          if (savedFile && data.files.includes(savedFile)) {
            await loadHistory(savedFile);
          }
        }
        
        if (data.chatHistory) {
          setConversation(data.chatHistory);
          if (data.fileName) {
            setSelectedFile(data.fileName);
          }
        }
      } catch (error) {
        console.warn('Initial PDF chat history note:', error.response?.data?.message || error.message);
        // Do not show an error toast on page mount when user simply has no prior chats
      }
    };
    fetchInitialData();
  }, [getToken]);

  const loadHistory = async (fileName) => {
    try {
      setHistoryLoading(true);
      
      const cachedConv = localStorage.getItem(`pdfChat_conv_${fileName}`);
      
      if (cachedConv) {
        setConversation(JSON.parse(cachedConv));
        setSelectedFile(fileName);
      }
      const { data } = await axios.get(
        `/api/ai/pdf-chat-history?file_name=${encodeURIComponent(fileName)}`,
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      
      if (data.success) {
        setConversation(data.chatHistory);
        setSelectedFile(fileName);
        localStorage.setItem(
          `pdfChat_conv_${fileName}`,
          JSON.stringify(data.chatHistory)
        );
      }
    } catch (error) {
      toast.error('Failed to load chat history');
      setChatHistory(prev => prev.filter(item => item.fileName !== fileName));
    } finally {
      setHistoryLoading(false);
      setShowSidebar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      toast.error('Please upload a PDF file first');
      fileInputRef.current?.focus();
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter your question');
      textareaRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('message', message.trim());
    formData.append('chatHistory', JSON.stringify(conversation));

    try {
      setLoading(true);
      const { data } = await axios.post('/api/ai/chat-with-pdf', formData, {
        headers: { 
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        setConversation(data.chatHistory);
        setMessage('');
        refreshPlan?.().catch(() => {});
        
        if (!chatHistory.some(item => item.fileName === pdfFile.name)) {
          setChatHistory(prev => [...prev, { fileName: pdfFile.name }]);
        }
        
        localStorage.setItem(
          `pdfChat_conv_${pdfFile.name}`,
          JSON.stringify(data.chatHistory)
        );
      } else {
        toast.error(data.message || 'Failed to process PDF');
        if (data.message?.toLowerCase().includes("limit") || data.message?.toLowerCase().includes("upgrade") || data.message?.toLowerCase().includes("premium")) {
          openUpgradeModal();
        }
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      const msg = error.response?.data?.message || error.message || 'Failed to process PDF';
      toast.error(msg);
      if (msg.toLowerCase().includes("limit") || msg.toLowerCase().includes("upgrade") || msg.toLowerCase().includes("premium")) {
        openUpgradeModal();
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLocalHistory = () => {
    localStorage.removeItem('pdfChat_selectedFile');
    localStorage.removeItem('pdfChat_conversation');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pdfChat_conv_')) {
        localStorage.removeItem(key);
      }
    });
    setSelectedFile(null);
    setConversation([]);
    setPdfFile(null);
    toast.success('Chat history cleared');
  };

  const removeFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${
      theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile header with sidebar toggle */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b ${
        theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-5 h-5 ${
            theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
          }`} />
          <h1 className="font-semibold">PDF Chat</h1>
        </div>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'
          }`}
          aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
        >
          {showSidebar ? <X className="w-5 h-5" /> : <History className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - PDF upload and history */}
        <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-full md:w-80 flex-shrink-0 overflow-y-auto ${
          theme === 'dark' ? 'bg-zinc-950 border-r border-zinc-800' : 'bg-white border-r border-gray-200'
        }`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className={`w-5 h-5 ${
                theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
              }`} />
              <h1 className="text-lg font-semibold">Chat with PDF</h1>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Upload PDF</label>
              <label 
                className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                  isDragging 
                    ? theme === 'dark' 
                      ? 'border-[#00DA83] bg-zinc-900' 
                      : 'border-green-500 bg-gray-100'
                    : theme === 'dark'
                      ? 'border-zinc-700 hover:bg-zinc-900'
                      : 'border-gray-300 hover:bg-gray-100'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {pdfFile ? (
                  <div className={`w-full flex items-center gap-3 p-2 rounded ${
                    theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'
                  }`}>
                    <File className={`w-5 h-5 flex-shrink-0 ${
                      theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
                    }`} />
                    <span className="text-sm truncate flex-1">{pdfFile.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className={`transition-colors ${
                        theme === 'dark' ? 'text-zinc-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                      }`}
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-6 h-6 mb-2 ${
                      theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
                    }`} />
                    <p className={`text-sm text-center ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {isDragging ? 'Drop your PDF here' : 'Click or drag PDF to upload'}
                    </p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setPdfFile(e.target.files[0]);
                        }
                      }}
                      required
                    />
                  </>
                )}
              </label>
              <p className={`text-xs mt-2 ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
              }`}>Supports PDF files up to 5MB</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <History className="w-4 h-4" />
                  <span>Chat History</span>
                </div>
                {chatHistory.length > 0 && (
                  <button 
                    onClick={clearLocalHistory}
                    className={`text-xs transition-colors flex items-center gap-1 ${
                      theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="Clear all history"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {historyLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className={`w-5 h-5 animate-spin ${
                      theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
                    }`} />
                  </div>
                ) : chatHistory.length > 0 ? (
                  chatHistory.map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-3 text-sm rounded cursor-pointer transition flex items-center justify-between ${
                        selectedFile === item.fileName 
                          ? theme === 'dark'
                            ? 'bg-zinc-800 border border-zinc-700'
                            : 'bg-gray-200 border border-gray-300'
                          : theme === 'dark'
                            ? 'hover:bg-zinc-900'
                            : 'hover:bg-gray-100'
                      }`}
                      onClick={() => loadHistory(item.fileName)}
                    >
                      <span className="truncate flex-1">{item.fileName}</span>
                      {selectedFile === item.fileName && (
                        <div className={`w-2 h-2 rounded-full ml-2 flex-shrink-0 ${
                          theme === 'dark' ? 'bg-[#00DA83]' : 'bg-green-600'
                        }`} />
                      )}
                    </div>
                  ))
                ) : (
                  <p className={`text-xs p-2 ${
                    theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                  }`}>No previous chats found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${
          theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'
        }`}>
          {/* Conversation display */}
          <div className="flex-1 overflow-y-auto p-4">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileText className={`w-12 h-12 mb-4 ${
                  theme === 'dark' ? 'text-zinc-500' : 'text-gray-400'
                }`} />
                <h2 className="text-xl font-semibold mb-2">Chat with your PDF</h2>
                <p className={`max-w-md ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                }`}>
                  Upload a PDF file and ask questions about its content to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg transition ${
                      msg.role === 'user' 
                        ? theme === 'dark' 
                          ? 'bg-zinc-900' 
                          : 'bg-gray-200'
                        : theme === 'dark'
                          ? 'bg-zinc-800'
                          : 'bg-gray-100'
                    }`}
                  >
                    <div className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
                    }`}>
                      {msg.role === 'user' ? 'You' : 'PDF Assistant'}
                    </div>
                    <div className={`reset-tw prose max-w-none ${
                      theme === 'dark' ? 'prose-invert' : ''
                    }`}>
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
                  }`}>
                    <div className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-[#00DA83]' : 'text-green-600'
                    }`}>PDF Assistant</div>
                    <div className={`flex items-center gap-2 ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-zinc-800 bg-zinc-950/50' : 'border-gray-200 bg-white/50'
          } backdrop-blur-sm`}>
            {pdfFile && (
              <div className={`flex items-center gap-2 mb-2 text-xs ${
                theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
              }`}>
                <File className="w-3 h-3" />
                <span className="truncate">{pdfFile.name}</span>
                <button 
                  onClick={removeFile}
                  className={`ml-auto transition-colors ${
                    theme === 'dark' ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                  }`}
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full p-3 pr-12 rounded-lg focus:outline-none resize-none transition ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border border-zinc-800 focus:ring-1 focus:ring-[#00DA83]'
                    : 'bg-white border border-gray-300 focus:ring-1 focus:ring-green-500'
                }`}
                placeholder={pdfFile ? "Ask questions about the PDF..." : "Upload a PDF to start chatting"}
                rows={1}
                disabled={loading || !pdfFile}
              />
              <button
                type="submit"
                disabled={loading || !pdfFile || !message.trim()}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition ${
                  loading || !pdfFile || !message.trim()
                    ? theme === 'dark' 
                      ? 'text-zinc-600' 
                      : 'text-gray-400'
                    : theme === 'dark'
                      ? 'text-[#00DA83] hover:bg-zinc-800'
                      : 'text-green-600 hover:bg-gray-200'
                }`}
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithPDF;