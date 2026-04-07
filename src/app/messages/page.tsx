import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, MessageSquare } from 'lucide-react';
import { MessageCard } from '@/components/messages/message-card';
import { Message } from '@/types';
import type { MessageFormat, MessageTrigger } from '@/types';

async function getMessages(userId: string, format?: MessageFormat) {
  const supabase = await createClient();

  let query = supabase
    .from('messages')
    .select(`
      *,
      beneficiary:beneficiaries(name, relation)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (format && format !== 'all') {
    query = query.eq('format', format);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect('/auth/login');
  }

  return data.user;
}

interface SearchParams {
  filter?: string;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getUser();
  const { filter = 'all' } = await searchParams;

  const messages = await getMessages(
    user.id,
    (filter !== 'all' ? filter : undefined) as MessageFormat | undefined
  );

  const tabs = [
    { id: 'all', label: 'All', count: messages.length },
    {
      id: 'text',
      label: 'Text',
      count: messages.filter(m => m.format === 'text').length,
    },
    {
      id: 'video',
      label: 'Video',
      count: messages.filter(m => m.format === 'video').length,
    },
    {
      id: 'audio',
      label: 'Audio',
      count: messages.filter(m => m.format === 'audio').length,
    },
  ];

  const filteredMessages = messages.filter(m =>
    filter === 'all' ? true : m.format === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600">Leave messages for your loved ones</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/messages?filter=${tab.id}`}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-purple-900 to-blue-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-75">({tab.count})</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-purple-900" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 text-center mb-6 max-w-xs">
              {filter !== 'all'
                ? `You haven't created any ${filter} messages yet.`
                : 'Create your first message to share with your loved ones after you pass away.'}
            </p>
            <Link
              href="/messages/compose"
              className="px-6 py-2 bg-gradient-to-r from-purple-900 to-blue-800 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              Compose Message
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map(message => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* FAB Button */}
      <Link
        href="/messages/compose"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-purple-900 to-blue-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
