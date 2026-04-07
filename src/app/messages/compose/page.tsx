'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { MessageFormat, MessageTrigger } from '@/types';

interface Beneficiary {
  id: string;
  name: string;
  relation: string;
}

export default function ComposeMessagePage() {
  const router = useRouter();
  const supabase = createClient();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [format, setFormat] = useState<MessageFormat>('text');
  const [trigger, setTrigger] = useState<MessageTrigger>('on_death');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);

  // Fetch beneficiaries
  useState(() => {
    const fetchBeneficiaries = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('beneficiaries')
          .select('id, name, relation')
          .eq('user_id', user.id)
          .order('created_at');

        if (error) throw error;

        setBeneficiaries(data || []);
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
        toast.error('Failed to load beneficiaries');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBeneficiary) {
      toast.error('Please select a beneficiary');
      return;
    }

    if (format === 'text' && (!subject || !content)) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (format !== 'text' && !fileInput) {
      toast.error(`Please upload a ${format} file`);
      return;
    }

    if (trigger === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      let storagePath: string | undefined;

      // Upload file if not text
      if (format !== 'text' && fileInput) {
        const fileName = `${user.id}/${Date.now()}-${fileInput.name}`;
        const { error: uploadError } = await supabase.storage
          .from('messages')
          .upload(fileName, fileInput);

        if (uploadError) throw uploadError;
        storagePath = fileName;
      }

      // Insert message
      const { error: insertError } = await supabase.from('messages').insert([
        {
          user_id: user.id,
          recipient_beneficiary_id: selectedBeneficiary,
          format,
          trigger,
          subject: format === 'text' ? subject : undefined,
          content: format === 'text' ? content : undefined,
          scheduled_date: trigger === 'scheduled' ? scheduledDate : undefined,
          scheduled_time: trigger === 'scheduled' ? scheduledTime : undefined,
          storage_path: storagePath,
          is_delivered: false,
        },
      ]);

      if (insertError) throw insertError;

      toast.success('Message saved successfully');
      router.push('/messages');
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 text-purple-900 animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-30 flex items-center gap-3">
        <Link href="/messages">
          <ArrowLeft className="h-6 w-6 text-gray-700 hover:text-gray-900" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Compose Message</h1>
          <p className="text-xs text-gray-600">Create a message for your loved ones</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Beneficiary Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Send to
          </label>
          <select
            value={selectedBeneficiary}
            onChange={e => setSelectedBeneficiary(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="">Select a beneficiary</option>
            {beneficiaries.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.relation})
              </option>
            ))}
          </select>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Message Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['text', 'video', 'audio'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`py-3 rounded-lg font-medium text-sm transition-all ${
                  format === f
                    ? 'bg-gradient-to-r from-purple-900 to-blue-800 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Format-Specific Fields */}
        {format === 'text' ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Message subject"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Message
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message here..."
                rows={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white resize-none"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Upload {format}
            </label>
            <input
              type="file"
              accept={format === 'video' ? 'video/*' : 'audio/*'}
              onChange={e => setFileInput(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 bg-white"
            />
            {fileInput && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {fileInput.name}
              </p>
            )}
          </div>
        )}

        {/* Trigger Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            When to send
          </label>
          <div className="space-y-2">
            {(['on_death', 'scheduled', 'manual'] as const).map(t => (
              <label key={t} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="trigger"
                  value={t}
                  checked={trigger === t}
                  onChange={e => setTrigger(e.target.value as MessageTrigger)}
                  className="w-4 h-4 text-purple-900"
                />
                <span className="text-gray-700 font-medium">
                  {t === 'on_death'
                    ? 'On My Passing'
                    : t === 'scheduled'
                      ? 'On A Scheduled Date'
                      : 'Send Manually'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Scheduled Date/Time */}
        {trigger === 'scheduled' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Saving...' : 'Save Message'}
        </button>
      </form>
    </div>
  );
}
