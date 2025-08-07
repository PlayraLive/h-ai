"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

interface UserTypeContextType {
  userType: "freelancer" | "client";
  setUserType: (type: "freelancer" | "client") => void;
  isLoading: boolean;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export function UserTypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
  const [isLoading, setIsLoading] = useState(true);

  // Load user type from localStorage or user profile
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadUserType = async () => {
      try {
        // First try to get from localStorage
        const savedUserType = localStorage.getItem(`userType_${user.$id}`);
        if (savedUserType && (savedUserType === "freelancer" || savedUserType === "client")) {
          setUserType(savedUserType as "freelancer" | "client");
          setIsLoading(false);
          return;
        }

        // If not in localStorage, try to get from user profile
        try {
          const response = await fetch(`/api/user-profile?userId=${user.$id}`);
          const data = await response.json();
          
          if (data.profile?.user_type) {
            setUserType(data.profile.user_type);
            localStorage.setItem(`userType_${user.$id}`, data.profile.user_type);
          } else {
            // Default to user's original type
            setUserType(user.userType || "freelancer");
            localStorage.setItem(`userType_${user.$id}`, user.userType || "freelancer");
          }
        } catch (error) {
          console.error('Error loading user type from profile:', error);
          // Fallback to user's original type
          setUserType(user.userType || "freelancer");
          localStorage.setItem(`userType_${user.$id}`, user.userType || "freelancer");
        }
      } catch (error) {
        console.error('Error loading user type:', error);
        setUserType(user.userType || "freelancer");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserType();
  }, [user]);

  const handleSetUserType = async (type: "freelancer" | "client") => {
    setUserType(type);
    
    if (user) {
      // Save to localStorage
      localStorage.setItem(`userType_${user.$id}`, type);
      
      // Save to user profile
      try {
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.$id,
            userType: type,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save user type to profile');
        }
      } catch (error) {
        console.error('Error saving user type:', error);
      }
    }
  };

  return (
    <UserTypeContext.Provider value={{
      userType,
      setUserType: handleSetUserType,
      isLoading
    }}>
      {children}
    </UserTypeContext.Provider>
  );
}

export function useUserType() {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
}
