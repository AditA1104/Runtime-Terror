import { useState, useEffect, useCallback } from 'react';
import { Farmer } from '../types/schema';
import { DEFAULT_FARMER, DEFAULT_SAVED_ACCOUNTS } from '../lib/mockData';
import { getFarmerProfile, updateFarmerProfile } from '../lib/api';
import { setGlobalLanguage, SupportedLang } from './useTranslation';

const FARMER_SESSION_KEY = 'agriq_farmer_session';
const SAVED_ACCOUNTS_KEY = 'agriq_saved_accounts';

export function useFarmerAuth() {
  const [savedAccounts, setSavedAccounts] = useState<Farmer[]>(() => {
    const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SAVED_ACCOUNTS;
  });

  const [farmer, setFarmer] = useState<Farmer | null>(() => {
    const saved = localStorage.getItem(FARMER_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SAVED_ACCOUNTS[0];
      }
    }
    return DEFAULT_SAVED_ACCOUNTS[0];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Switch to another existing account
  const switchAccount = useCallback((farmerId: string) => {
    const target = savedAccounts.find(a => a.farmer_id === farmerId);
    if (target) {
      setFarmer(target);
      localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(target));
      if (target.preferred_lang) {
        setGlobalLanguage(target.preferred_lang as SupportedLang);
      }
    }
  }, [savedAccounts]);

  // Add a new farmer profile
  const addNewAccount = useCallback((newProfile: Partial<Farmer>): Farmer => {
    const created: Farmer = {
      farmer_id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      full_name: newProfile.full_name || 'Kisan Bandhu',
      phone_number: newProfile.phone_number || '9876543210',
      village: newProfile.village || 'Village Center',
      district: newProfile.district || 'District APMC',
      state: newProfile.state || 'Karnataka',
      preferred_lang: newProfile.preferred_lang || 'kn',
      created_at: new Date().toISOString(),
    };

    setSavedAccounts(prev => {
      const exists = prev.some(a => a.phone_number === created.phone_number);
      const updated = exists ? prev.map(a => a.phone_number === created.phone_number ? created : a) : [...prev, created];
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });

    setFarmer(created);
    localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(created));
    if (created.preferred_lang) {
      setGlobalLanguage(created.preferred_lang as SupportedLang);
    }
    return created;
  }, []);

  // Remove an account
  const removeAccount = useCallback((farmerId: string) => {
    setSavedAccounts(prev => {
      const filtered = prev.filter(a => a.farmer_id !== farmerId);
      const finalAccounts = filtered.length > 0 ? filtered : DEFAULT_SAVED_ACCOUNTS;
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(finalAccounts));
      if (farmer?.farmer_id === farmerId) {
        setFarmer(finalAccounts[0]);
        localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(finalAccounts[0]));
      }
      return finalAccounts;
    });
  }, [farmer]);

  const loginWithPhone = useCallback(async (phone: string, _otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if already in saved accounts
      const existing = savedAccounts.find(a => a.phone_number === phone);
      if (existing) {
        setFarmer(existing);
        localStorage.setItem(FARMER_SESSION_KEY, JSON.stringify(existing));
        if (existing.preferred_lang) {
          setGlobalLanguage(existing.preferred_lang as SupportedLang);
        }
        return true;
      }

      // Fetch or create profile for this phone number
      const profile = await getFarmerProfile(phone);
      addNewAccount(profile);
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [savedAccounts, addNewAccount]);

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

      // Update in savedAccounts list
      setSavedAccounts(prev => {
        const next = prev.map(a => a.farmer_id === updated.farmer_id ? updated : a);
        localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(next));
        return next;
      });

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
    savedAccounts,
    isLoggedIn,
    isLoading,
    switchAccount,
    addNewAccount,
    removeAccount,
    loginWithPhone,
    logout,
    updateProfile,
  };
}
