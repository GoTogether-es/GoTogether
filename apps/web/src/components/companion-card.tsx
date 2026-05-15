import { Button, Card } from '@gotogether/ui';
import type { CompanionSummary } from '@/types';
import Image from 'next/image';

type CompanionCardProps = CompanionSummary;

export function CompanionCard({
  name,
  bio,
  specialty,
  rating,
  years,
  image,
}: CompanionCardProps) {
  return (
    <Card className="p-5">
      <div className="relative w-full h-[180px]">
        <Image
          src={image}
          alt={`Foto de ${name}`}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-1">{name}</h3>
        <p className="gt-helper">
          {bio}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="gt-tag">{specialty}</span>
          <span className="gt-tag">{rating} estrellas</span>
          <span className="gt-tag">{years}</span>
        </div>
        <Button className="w-full mt-4">Ver perfil</Button>
      </div>
    </Card>
  );
}
