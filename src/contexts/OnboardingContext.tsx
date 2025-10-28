// src/contexts/OnboardingContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from 'src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getOnboardingStatus, OnboardingStatus, markConversationSeen, markGoalCreated, completeOnboarding } from 'src/lib/onboarding';

interface OnboardingContextType {
  onboardingStatus: OnboardingStatus | null;
  loading: boolean;
  markConversationComplete: () => Promise<void>;
  markGoalComplete: () => Promise<void>;
  completeAllOnboarding: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load onboarding status when user authenticates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const status = await getOnboardingStatus(user.uid);
          setOnboardingStatus(status);
        } catch (error) {
          console.error('Error loading onboarding status:', error);
        }
      } else {
        setOnboardingStatus(null);
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshOnboardingStatus = async () => {
    if (userId) {
      const status = await getOnboardingStatus(userId);
      setOnboardingStatus(status);
    }
  };

  const markConversationComplete = async () => {
    if (userId) {
      await markConversationSeen(userId);
      await refreshOnboardingStatus();
    }
  };

  const markGoalComplete = async () => {
    if (userId) {
      await markGoalCreated(userId);
      await refreshOnboardingStatus();
    }
  };

  const completeAllOnboarding = async () => {
    if (userId) {
      await completeOnboarding(userId);
      await refreshOnboardingStatus();
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingStatus,
        loading,
        markConversationComplete,
        markGoalComplete,
        completeAllOnboarding,
        refreshOnboardingStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};