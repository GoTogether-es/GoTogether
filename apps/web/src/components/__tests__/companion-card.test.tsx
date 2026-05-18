import { render, screen } from '@testing-library/react';
import { CompanionCard } from '../companion-card';
import type { CompanionSummary } from '@/types';

const mockCompanion: CompanionSummary = {
  id: 'test-1',
  profile: {
    fullName: 'María García',
    bio: 'Enfermera retirada con 20 años de experiencia.',
    headline: 'Acompañante senior',
    avatarUrl: '/images/companions/maria.jpg',
  },
  specialties: 'Cuidados paliativos',
  rating: 4.8,
  yearsOnPlatform: 5,
  verified: true,
};

describe('CompanionCard', () => {
  it('renders all companion information correctly', () => {
    render(<CompanionCard {...mockCompanion} />);

    expect(screen.getByRole('heading', { name: mockCompanion.profile.fullName })).toBeInTheDocument();

    expect(screen.getByText(mockCompanion.profile.headline!)).toBeInTheDocument();

    expect(screen.getByText(mockCompanion.specialties!)).toBeInTheDocument();

    expect(screen.getByText('4.8')).toBeInTheDocument();

    expect(screen.getByText(`5 años`)).toBeInTheDocument();

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('alt', `Foto de ${mockCompanion.profile.fullName}`);

    expect(screen.getByRole('link', { name: /ver perfil/i })).toBeInTheDocument();
  });

  it('renders without optional specialty', () => {
    const companionWithoutSpecialty: CompanionSummary = {
      ...mockCompanion,
      specialties: null,
    };
    render(<CompanionCard {...companionWithoutSpecialty} />);

    expect(screen.getByRole('heading', { name: mockCompanion.profile.fullName })).toBeInTheDocument();
    expect(screen.queryByText('Cuidados paliativos')).not.toBeInTheDocument();
  });

  it('shows default description when no headline or bio', () => {
    const minimal: CompanionSummary = {
      id: 'test-2',
      profile: {
        fullName: 'Juan',
        headline: null,
        bio: null,
        avatarUrl: null,
      },
      specialties: null,
      rating: 3.0,
      yearsOnPlatform: 1,
      verified: false,
    };
    render(<CompanionCard {...minimal} />);

    expect(screen.getByText('Acompañante en GoTogether')).toBeInTheDocument();
    expect(screen.getByText('1 año')).toBeInTheDocument();
  });
});
