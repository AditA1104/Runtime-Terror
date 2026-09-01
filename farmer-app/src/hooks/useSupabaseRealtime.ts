import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../types/schema';
import { supabase, isSupabaseLive } from '../lib/supabase';
import { getFarmerBookings, subscribeToLocalState } from '../lib/api';

export function useSupabaseRealtime(farmerId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [lastStatusChange, setLastStatusChange] = useState<{
    token: string;
    from?: string;
    to: string;
    timestamp: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const data = await getFarmerBookings(farmerId);
      setBookings(data);
      // Find latest active booking (not cancelled or completed, or most recent)
      const active = data.find(b => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)) || data[0] || null;
      setActiveBooking(active);
    } catch (e) {
      console.error('Error refreshing bookings:', e);
    } finally {
      setIsLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    refreshData();

    // 1. Local event emitter subscription (for demo and offline transitions)
    const unsubscribeLocal = subscribeToLocalState(() => {
      refreshData();
    });

    // 2. Supabase Realtime Subscription (when connected to live Supabase backend)
    let channel: any = null;
    if (isSupabaseLive && supabase) {
      channel = supabase
        .channel(`farmer-bookings-${farmerId || 'all'}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          (payload: any) => {
            console.log('⚡ Supabase Realtime event received:', payload);
            if (payload.eventType === 'UPDATE' && payload.new) {
              setLastStatusChange({
                token: payload.new.token_number,
                from: payload.old?.status,
                to: payload.new.status,
                timestamp: Date.now(),
              });
            }
            refreshData();
          }
        )
        .subscribe((status: string) => {
          console.log(`Realtime channel status: ${status}`);
        });
    }

    return () => {
      unsubscribeLocal();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [farmerId, refreshData]);

  return {
    bookings,
    activeBooking,
    setActiveBooking,
    lastStatusChange,
    isLoading,
    refreshData,
  };
}
