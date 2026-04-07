'use client';

import { useRouter } from 'next/navigation';
import { Phone, Mail, Shield } from 'lucide-react';
import type { Beneficiary } from '@/types';

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600',
    'bg-gradient-to-br from-red-400 to-red-600',
  ];

  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[hash % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function BeneficiaryCard({ beneficiary }: BeneficiaryCardProps) {
  const router = useRouter();
  const avatarColor = getAvatarColor(beneficiary.name);
  const initials = getInitials(beneficiary.name);

  return (
    <div
      onClick={() => router.push(`/beneficiaries/${beneficiary.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer"
    >
      {/* Avatar and Header */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`h-12 w-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{beneficiary.name}</h3>

          {/* Relation Badge */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {beneficiary.relation}
            </span>

            {beneficiary.is_minor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Shield className="h-3 w-3" />
                Minor
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm text-gray-600">
        {beneficiary.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{beneficiary.phone}</span>
          </div>
        )}

        {beneficiary.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{beneficiary.email}</span>
          </div>
        )}

        {!beneficiary.phone && !beneficiary.email && (
          <p className="text-gray-400 italic">No contact info added</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="text-sm font-medium text-purple-900 hover:text-purple-800 transition">
          View Details →
        </button>
      </div>
    </div>
  );
}
