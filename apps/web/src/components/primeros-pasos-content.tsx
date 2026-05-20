'use client';

import { useEffect, useState } from 'react';
import { Card, Section, Container } from '@gotogether/ui';
import { Loader2, Search, FileText, MessageSquare, Star, CalendarDays, UserCheck, ShieldCheck } from 'lucide-react';
import { getProfile } from '@/services/api';

const clientSteps = [
  {
    icon: FileText,
    title: '1. Completa tu perfil',
    text: 'Añade tu foto, nombre y preferencias. Cuanta más información, mejor podremos emparejarte con el acompañante ideal.',
  },
  {
    icon: Search,
    title: '2. Explora acompañantes',
    text: 'Busca acompañantes verificados por especialidad. Lee sus valoraciones, mira su nivel (bronce, plata, oro) y elige.',
  },
  {
    icon: FileText,
    title: '3. Crea una solicitud',
    text: 'Dinos qué necesitas, cuándo y dónde. Recibirás respuesta en minutos.',
  },
  {
    icon: MessageSquare,
    title: '4. Chatea con tu acompañante',
    text: 'Una vez aceptada la reserva, habla por chat para coordinar los detalles del servicio.',
  },
  {
    icon: Star,
    title: '5. Valora el servicio',
    text: 'Al terminar, valora a tu acompañante. Tu opinión mantiene la calidad de la comunidad.',
  },
];

const companionSteps = [
  {
    icon: FileText,
    title: '1. Completa tu perfil',
    text: 'Añade tu foto, biografía, especialidades y sube tus certificados. Un perfil completo atrae más clientes.',
  },
  {
    icon: CalendarDays,
    title: '2. Configura tu disponibilidad',
    text: 'Indica tus horarios semanales en el Panel de acompañante. Así los clientes saben cuándo estás libre.',
  },
  {
    icon: UserCheck,
    title: '3. Recibe y acepta solicitudes',
    text: 'Te llegarán solicitudes de clientes que encajan con tu perfil. Acéptalas o recházalas desde tu Panel.',
  },
  {
    icon: MessageSquare,
    title: '4. Chatea y coordina',
    text: 'Habla con el cliente por chat para concretar detalles antes y durante el servicio.',
  },
  {
    icon: Star,
    title: '5. Gana valoraciones y sube de nivel',
    text: 'Cada servicio completado suma puntos. Alcanza nivel Plata (5+) y Oro (20+) para destacar.',
  },
];

export function PrimerosPasosContent() {
  const [isCompanion, setIsCompanion] = useState<boolean | null>(null);

  useEffect(() => {
    getProfile().then((p) => setIsCompanion(!!p?.companion)).catch(() => setIsCompanion(false));
  }, []);

  if (isCompanion === null) {
    return (
      <Section className="bg-white">
        <Container>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </Container>
      </Section>
    );
  }

  const steps = isCompanion ? companionSteps : clientSteps;

  return (
    <Section className="bg-white">
      <Container>
        <div className="max-w-3xl mx-auto space-y-6">
          {steps.map((step) => (
            <Card key={step.title} className="p-8 border-gray-50 hover:shadow-lg transition-shadow flex gap-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
