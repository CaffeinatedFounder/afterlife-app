'use client';

import Link from 'next/link';
import { MessageSquare, Video, Mic, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Message, MessageFormat, MessageTrigger } from '@/types';

interface MessageCardProps {
  message: Message & {
    beneficiary?: {
      name: string;
      relation: string;
    };
  };
}

export function MessageCard({ message }: MessageCardProps) {
  const formatIcon = {
    text: <MessageSquare className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    audio: <Mic className="h-5 w-5" />,
  }[message.format];

  const triggerLabel = {
    on_death: 'On My Passing',
    scheduled: 'Scheduled',
    manual: 'Manual Send',
  }[message.trigger];

  const triggerColor = {
    on_death: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-amber-100 text-amber-700',
    manual: 'bg-gray-100 text-gray-700',
  }[message.trigger];

  const beneficiaryName = message.beneficiary?.name || 'Unknown';
  const beneficiaryRelation = message.beneficiary?.relation || 'Beneficiary';
  const subject = message.subject || 'Untitled message';
  const createdDate = formatDate(message.created_at);

  return (
    <Link href={`/messages/${message.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-900 flex-shrink-0">
            {formatIcon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {beneficiaryName}
                </h3>
                <p className="text-xs text-gray-600">{beneficiaryRelation}</p>
              </div>
              {message.is_delivered && (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              )}
            </div>

            {/* Subject Preview */}
            <p className="text-sm text-gray-600 truncate mb-2">{subject}</p>

            {/* Trigger Badge and Date */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${triggerColor}`}>
                {triggerLabel}
              </span>
              <span className="text-xs text-gray-500">{createdDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
