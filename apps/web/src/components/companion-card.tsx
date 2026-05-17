'use client';

import { Button, Card } from '@gotogether/ui';
import { ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export interface CompanionSummary {
  id: string;
  profile: {
    fullName: string;
    headline?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  };
  specialties: string | null;
  rating: number;
  yearsOnPlatform: number;
  verified: boolean;
}

export function CompanionCard({
  id,
  profile,
  specialties,
  rating,
  yearsOnPlatform,
  verified,
}: CompanionSummary) {
  return (
    <Card className="p-5 flex flex-col">
      <div className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-blue-50">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={`Foto de ${profile.fullName}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-300">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .66.54 1.2 1.2 1.2h16.8c.66 0 1.2-.54 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="mt-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold">{profile.fullName}</h3>
          {verified && (
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
        </div>
        <p className="gt-helper flex-1">
          {profile.headline || profile.bio || 'Acompañante en GoTogether'}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {specialties && (
            <span className="gt-tag">{specialties}</span>
          )}
          <span className="gt-tag">
            <Star className="w-3 h-3 inline-block mr-0.5 fill-amber-400 stroke-amber-400" />
            {rating.toFixed(1)}
          </span>
          <span className="gt-tag">{yearsOnPlatform} {yearsOnPlatform === 1 ? 'año' : 'años'}</span>
        </div>
        <Link href={routes.explorarCompanion(id)} className="mt-4 block">
          <Button className="w-full" variant="primary">Ver perfil</Button>
        </Link>
      </div>
    </Card>
  );
}
