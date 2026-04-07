'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Will {
  id: string;
  user_id: string;
  current_section: number;
  completion_percentage: number;
  personal_info: Record<string, any> | null;
  family_details: Record<string, any> | null;
  special_instructions: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

interface UseWillReturn {
  will: Will | null;
  loading: boolean;
  error: Error | null;
  saveSection: (section: number, data: Record<string, any>) => Promise<void>;
  nextSection: () => Promise<void>;
  prevSection: () => Promise<void>;
  calculateProgress: () => number;
  generateWill: () => Promise<void>;
}

export function useWill(): UseWillReturn {
  const supabase = createClient();
  const [will, setWill] = useState<Will | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current will
  useEffect(() => {
    const fetchWill = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(new Error('No session'));
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('digital_wills')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setWill(data || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchWill();
  }, [supabase]);

  const saveSection = useCallback(
    async (section: number, data: Record<string, any>) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new Error('No session');

        const sectionKey = {
          1: 'personal_info',
          2: 'family_details',
          3: 'assets',
          4: 'beneficiaries',
          5: 'distributions',
          6: 'special_instructions',
        }[section];

        if (!sectionKey) throw new Error('Invalid section');

        const { data: existingWill, error: fetchError } = await supabase
          .from('digital_wills')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        const updateData = {
          [sectionKey]: data,
          current_section: section + 1,
          completion_percentage: Math.ceil((section / 6) * 100),
        };

        if (existingWill) {
          // Update existing will
          const { error: updateError } = await supabase
            .from('digital_wills')
            .update(updateData)
            .eq('id', existingWill.id);

          if (updateError) throw updateError;
        } else {
          // Create new will
          const { error: insertError } = await supabase
            .from('digital_wills')
            .insert({
              user_id: session.user.id,
              current_section: section + 1,
              completion_percentage: Math.ceil((section / 6) * 100),
              [sectionKey]: data,
            });

          if (insertError) throw insertError;
        }

        // Refetch will
        const { data: updatedWill } = await supabase
          .from('digital_wills')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        setWill(updatedWill);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      }
    },
    [supabase]
  );

  const nextSection = useCallback(async () => {
    if (!will) throw new Error('No will');

    const nextSectionNum = will.current_section + 1;
    if (nextSectionNum > 6) {
      throw new Error('Already at final section');
    }

    const { error } = await supabase
      .from('digital_wills')
      .update({
        current_section: nextSectionNum,
        completion_percentage: Math.ceil((nextSectionNum / 6) * 100),
      })
      .eq('id', will.id);

    if (error) throw error;

    setWill({ ...will, current_section: nextSectionNum });
  }, [will, supabase]);

  const prevSection = useCallback(async () => {
    if (!will) throw new Error('No will');

    const prevSectionNum = will.current_section - 1;
    if (prevSectionNum < 1) {
      throw new Error('Already at first section');
    }

    const { error } = await supabase
      .from('digital_wills')
      .update({
        current_section: prevSectionNum,
        completion_percentage: Math.ceil((prevSectionNum / 6) * 100),
      })
      .eq('id', will.id);

    if (error) throw error;

    setWill({ ...will, current_section: prevSectionNum });
  }, [will, supabase]);

  const calculateProgress = useCallback(() => {
    if (!will) return 0;
    return will.completion_percentage;
  }, [will]);

  const generateWill = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !will) throw new Error('Missing session or will');

      // Call backend API to generate PDF
      // This is a placeholder - implement actual PDF generation
      const response = await fetch('/api/will/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          will_id: will.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate will');
      }

      // Update will status to complete
      const { error } = await supabase
        .from('digital_wills')
        .update({
          current_section: 6,
          completion_percentage: 100,
        })
        .eq('id', will.id);

      if (error) throw error;

      setWill({ ...will, current_section: 6, completion_percentage: 100 });
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, [will, supabase]);

  return {
    will,
    loading,
    error,
    saveSection,
    nextSection,
    prevSection,
    calculateProgress,
    generateWill,
  };
}
