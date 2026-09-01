import { useState, useEffect, useCallback } from 'react';
import { Farmer } from '../types/schema';
import { DEFAULT_FARMER } from '../lib/mockData';
import { getFarmerProfile, updateFarmerProfile } from '../lib/api';

const FARMER_SESSION_KEY = 'agriq_farmer_session';

export function useFarmerAuth() {
  const [farmer, setFarmer] = useState<Farmer | null>(() => {
    const saved = localStorage.getItem(FARMER_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_FARMER;
      }
    }
    return DEFAULT_FARMER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem(FARMER_SESSION_KEY) || true; // Default logged in for smooth demo experience
  });

  const loginWithPhone = useCallback(async (phone: string, _otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Fetch or create profile for this phone number
      const profile = await getFarmerProfile(phone);
      setFarmer(profile);
      setIsLoggedIn(true);
      localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(profile));
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(FARMER_SESSION_KEY);
    setFarmer(null);
    setIsLoggedIn(false);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Farmer>): Promise<Farmer | null> => {
    if (!farmer) return null;
    setIsLoading(true);
    try {
      const updated = await updateFarmerProfile(updates);
      setFarmer(updated);
      localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Profile update error:', e);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [farmer]);

  useEffect(() => {
    if (farmer) {
      localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(farmer));
    }
  }, [farmer]);

  return {
    farmer,
    isLoggedIn,
    isLoading,
    loginWithPhone,
    logout,
    updateProfile,
  };
}
