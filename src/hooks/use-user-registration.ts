// hooks/useUserRegistrations.ts
import { useState, useEffect } from 'react';
import { UserRegistration } from '@/types/registration';

export function useUserRegistrations() {
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/registrations/user');
        
        if (!response.ok) {
          throw new Error('Failed to fetch registration data');
        }
        
        const data = await response.json();
        setRegistrations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  return { registrations, loading, error };
}