import { render, screen } from '@testing-library/react';
import { StepIndicator } from '../step-indicator';

describe('StepIndicator', () => {
  const steps = [
    { label: 'Perfil' },
    { label: 'Verificacion' },
    { label: 'Finalizar' },
  ];

  it('renders all steps with labels', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Verificacion')).toBeInTheDocument();
    expect(screen.getByText('Finalizar')).toBeInTheDocument();
  });

  it('marks active step with aria-current', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    const active = screen.getByText('Verificacion').closest('li');
    const stepSpan = active?.querySelector('[aria-current="step"]');
    expect(stepSpan).toBeInTheDocument();
  });

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    // First step should show a checkmark SVG (not a number)
    const items = screen.getAllByRole('listitem');
    const firstStepMark = items[0].querySelector('svg');
    expect(firstStepMark).toBeInTheDocument();
  });

  it('shows step number for pending steps', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    // First step shows number 1
    const stepCircle = screen.getByText('1');
    expect(stepCircle).toBeInTheDocument();
  });

  it('has nav with aria-label', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByLabelText('Progreso del registro')).toBeInTheDocument();
  });

  it('renders single step without connectors', () => {
    render(<StepIndicator steps={[{ label: 'Unico' }]} currentStep={0} />);
    expect(screen.getByText('Unico')).toBeInTheDocument();
  });
});
