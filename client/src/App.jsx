import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import WriteArticle from './pages/WriteArticle';
import BlogTitles from './pages/BlogTitles';
import GenerateImages from './pages/GenerateImages';
import RemoveBackground from './pages/RemoveBackground';
import RemoveObject from './pages/RemoveObject';
import ReviewResume from './pages/ReviewResume';
import Community from './pages/Community';
import { Toaster } from 'react-hot-toast';
import { useAuth, ClerkProvider } from '@clerk/clerk-react';
import { dark, light } from '@clerk/themes';
import CalculateATSScore from './pages/CalculateATSScore';
import HumanizeText from './pages/HumanizeText';
import ChatWithPDF from './pages/ChatWithPDF';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PlanProvider } from './context/PlanContext';
import UpgradeModal from './components/UpgradeModal';

// Clerk wrapper component
const ClerkThemeWrapper = ({ children, publishableKey }) => {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: theme === 'dark' ? dark : light,
        variables: {
          colorPrimary: theme === 'dark' ? '#6366f1' : '#4f46e5',
          colorBackground: theme === 'dark' ? '#09090b' : '#ffffff',
          colorText: theme === 'dark' ? '#f4f4f5' : '#27272a',
          colorInputBackground: theme === 'dark' ? '#18181b' : '#ffffff',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};

const Loader = () => {
  const { theme } = useTheme();

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    }`}>
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
          theme === 'dark' 
            ? 'border-t-transparent border-[#4f6cff]' 
            : 'border-t-transparent border-blue-600'
        }`}></div>
        <p className={`mt-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Loading...
        </p>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Toaster />
      <UpgradeModal />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='write-article' element={<WriteArticle />} />
          <Route path='blog-titles' element={<BlogTitles />} />
          <Route path='humanize-text' element={<HumanizeText />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='review-resume' element={<ReviewResume />} />
          <Route path='calculate-ats-score' element={<CalculateATSScore />} />
          <Route path='chat-with-pdf' element={<ChatWithPDF />} />
          <Route path='community' element={<Community />} />
        </Route>
      </Routes>
    </div>
  );
};

const App = ({ publishableKey }) => {
  return (
    <ThemeProvider>
      <ClerkThemeWrapper publishableKey={publishableKey}>
        <PlanProvider>
          <AppContent />
        </PlanProvider>
      </ClerkThemeWrapper>
    </ThemeProvider>
  );
};

export default App;