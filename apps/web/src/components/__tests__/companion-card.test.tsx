import { render, screen } from '@testing-library/react';
import { CompanionCard } from '../companion-card';

const mockCompanion = {
  name: 'María García',
  bio: 'Enfermera retirada con 20 años de experiencia.',
  specialty: 'Cuidados paliativos',
  rating: '4.8',
  years: '5 años de experiencia',
  image: '/images/companions/maria.jpg',
};

describe('CompanionCard', () => {
  it('renders all companion information correctly', () => {
    render(<CompanionCard {...mockCompanion} />);

    // Check name
    expect(screen.getByRole('heading', { name: mockCompanion.name })).toBeInTheDocument();

    // Check bio
    expect(screen.getByText(mockCompanion.bio)).toBeInTheDocument();

    // Check tags
    expect(screen.getByText(mockCompanion.specialty)).toBeInTheDocument();
    expect(screen.getByText(`${mockCompanion.rating} estrellas`)).toBeInTheDocument();
    expect(screen.getByText(mockCompanion.years)).toBeInTheDocument();

    // Check image
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', `Foto de ${mockCompanion.name}`);
    expect(image).toHaveAttribute('src', expect.stringContaining('maria.jpg'));

    // Check button
    expect(screen.getByRole('button', { name: /ver perfil/i })).toBeInTheDocument();
  });

  it('renders correctly without optional specialty', () => {
    const companionWithoutSpecialty = { ...mockCompanion, specialty: undefined };
    render(<CompanionCard {...companionWithoutSpecialty} />);

    expect(screen.getByRole('heading', { name: mockCompanion.name })).toBeInTheDocument();
    expect(screen.queryByText('Cuidados paliativos')).not.toBeInTheDocument();
  });
});
