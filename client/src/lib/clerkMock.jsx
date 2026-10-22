/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const MockAuthContext = createContext({
  isSignedIn: true,
  isLoaded: true,
  userId: 'dev_user_sandbox',
  user: {
    id: 'dev_user_sandbox',
    fullName: 'Demo Creator',
    firstName: 'Demo',
    lastName: 'Creator',
    primaryEmailAddress: { emailAddress: 'creator@creationsuite.ai' },
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  },
  getToken: async () => 'dev_sandbox_token'
});

export const ClerkProvider = ({ children }) => {
  const [isSignedIn] = useState(true);

  const value = {
    isSignedIn,
    isLoaded: true,
    userId: 'dev_user_sandbox',
    user: {
      id: 'dev_user_sandbox',
      fullName: 'Demo Creator',
      firstName: 'Demo',
      lastName: 'Creator',
      primaryEmailAddress: { emailAddress: 'creator@creationsuite.ai' },
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    },
    getToken: async () => 'dev_sandbox_token'
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(MockAuthContext);
  return {
    isSignedIn: ctx.isSignedIn,
    isLoaded: ctx.isLoaded,
    user: ctx.user
  };
};

export const useAuth = () => {
  const ctx = useContext(MockAuthContext);
  return {
    isSignedIn: ctx.isSignedIn,
    isLoaded: ctx.isLoaded,
    userId: ctx.userId,
    getToken: ctx.getToken
  };
};

export const useClerk = () => {
  return {
    openSignIn: () => console.log('Developer Mode: SignIn simulated'),
    openSignUp: () => console.log('Developer Mode: SignUp simulated'),
    signOut: () => console.log('Developer Mode: SignOut simulated')
  };
};

export const Protect = ({ children }) => {
  return <>{children}</>;
};

export const UserButton = () => {
  const { user } = useUser();
  return (
    <div className="flex items-center gap-2 cursor-pointer" title="Developer Mode User">
      <img
        src={user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
        alt="User Avatar"
        className="w-8 h-8 rounded-full border border-blue-500/30 object-cover ring-2 ring-blue-500/20"
      />
    </div>
  );
};

export const SignIn = () => {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center max-w-sm mx-auto my-12">
      <h3 className="text-lg font-bold text-white mb-2">Developer Sandbox</h3>
      <p className="text-sm text-zinc-400">Authenticated automatically as Demo Creator.</p>
    </div>
  );
};

export const dark = {};
export const light = {};
