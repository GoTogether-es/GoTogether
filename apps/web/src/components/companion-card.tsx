import { Button, Card } from '@gotogether/ui';
import type { CompanionSummary } from '@/types';

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
    <Card style={{ padding: 20 }}>
      <img
        src={image}
        alt={`Foto de ${name}`}
        style={{ width: '100%', height: 180, borderRadius: 18, objectFit: 'cover' }}
      />
      <div style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 4px' }}>{name}</h3>
        <p className="gt-helper" style={{ margin: 0 }}>
          {bio}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span className="gt-tag">{specialty}</span>
          <span className="gt-tag">{rating} estrellas</span>
          <span className="gt-tag">{years}</span>
        </div>
        <Button style={{ width: '100%', marginTop: 16 }}>Ver perfil</Button>
      </div>
    </Card>
  );
}
