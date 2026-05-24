import { render, screen } from '@testing-library/react';
import { FileUpload } from '../file-upload';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-1' } } } })) },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://storage/certificates/file.pdf' } })),
      })),
    },
  })),
}));

describe('FileUpload', () => {
  const defaultProps = {
    onUploaded: jest.fn(),
    accept: '.pdf,.jpg,.png',
    label: 'Subir certificado',
    helper: 'Formatos aceptados: PDF, JPG, PNG',
  };

  it('renders label and helper text', () => {
    render(<FileUpload {...defaultProps} />);
    expect(screen.getByText('Subir certificado')).toBeInTheDocument();
    expect(screen.getByText('Formatos aceptados: PDF, JPG, PNG')).toBeInTheDocument();
  });

  it('renders in idle state with upload prompt', () => {
    render(<FileUpload {...defaultProps} />);
    expect(screen.getByText('Haz clic para seleccionar archivo')).toBeInTheDocument();
  });

  it('renders with done state when uploadedUrl is provided', () => {
    render(<FileUpload {...defaultProps} uploadedUrl="https://example.com/file.pdf" />);
    expect(screen.getByText('Archivo subido correctamente')).toBeInTheDocument();
  });

  it('has hidden file input', () => {
    render(<FileUpload {...defaultProps} />);
    const input = screen.getByLabelText('Subir certificado');
    expect(input).toHaveAttribute('type', 'file');
    expect(input.className).toContain('hidden');
  });
});
