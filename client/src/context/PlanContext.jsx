import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || '';

const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [plan, setPlan] = useState('free');
  const [freeUsage, setFreeUsage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Sync plan and usage from user metadata or backend API
  const refreshPlan = useCallback(async () => {
    if (!user) {
      setPlan('free');
      setFreeUsage(0);
      return;
    }

    try {
      const metadata = user.publicMetadata || {};
      const initialPlan = metadata.plan === 'premium' || metadata.plan === 'pro' ? 'premium' : 'free';
      setPlan(initialPlan);
      setFreeUsage(metadata.free_usage ?? 0);

      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get('/api/user/get-user-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data?.success) {
        setPlan(data.plan === 'premium' || data.plan === 'pro' ? 'premium' : 'free');
        setFreeUsage(data.free_usage ?? 0);
      }
    } catch (err) {
      console.warn("Could not sync plan data:", err.message);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (isLoaded) {
      refreshPlan();
    }
  }, [isLoaded, user, refreshPlan]);

  // Upgrade or switch plan action
  const upgradeToPlan = async (targetPlan = 'premium', autoClose = true) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan");
      return false;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        '/api/user/update-plan',
        { plan: targetPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        const updatedPlan = data.plan === 'premium' ? 'premium' : 'free';
        setPlan(updatedPlan);
        toast.success(data.message || "Plan updated successfully!");
        if (autoClose) {
          setShowUpgradeModal(false);
        }

        // Reload Clerk user so publicMetadata syncs everywhere
        if (typeof user.reload === 'function') {
          await user.reload().catch(() => {});
        }
        await refreshPlan();
        return true;
      } else {
        toast.error(data?.message || "Failed to upgrade plan");
        return false;
      }
    } catch (error) {
      console.error("Upgrade plan error:", error);
      toast.error(error.response?.data?.message || error.message || "An error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isPremium = plan === 'premium';

  return (
    <PlanContext.Provider
      value={{
        plan,
        freeUsage,
        isPremium,
        loading,
        refreshPlan,
        upgradeToPlan,
        showUpgradeModal,
        setShowUpgradeModal,
        openUpgradeModal: () => setShowUpgradeModal(true),
        closeUpgradeModal: () => setShowUpgradeModal(false)
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};
