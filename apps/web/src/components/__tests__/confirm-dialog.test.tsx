import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../confirm-dialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Eliminar elemento',
    message: 'Esta accion no se puede deshacer',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('returns null when open is false', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Eliminar elemento')).toBeInTheDocument();
    expect(screen.getByText('Esta accion no se puede deshacer')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders custom button labels', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Si" cancelLabel="No" />);
    expect(screen.getByText('Si')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders danger variant with red styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);
    const confirmBtn = screen.getByText('Confirmar');
    expect(confirmBtn.className).toContain('bg-red-600');
  });

  it('renders warning variant with amber styles', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />);
    const confirmBtn = screen.getByText('Confirmar');
    expect(confirmBtn.className).toContain('bg-amber-600');
  });

  it('has correct ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-message');
  });

  it('calls onCancel when Escape is pressed', () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    // The component registers a keydown event on mount
    // We trigger it manually
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    const backdrop = document.querySelector('[aria-hidden="true"]')!;
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalled();
  });
});
