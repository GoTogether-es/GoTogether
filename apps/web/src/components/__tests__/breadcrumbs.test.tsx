import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders items as links when href is provided', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Explorar', href: '/explorar' },
      { label: 'Detalle' },
    ];
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Explorar').closest('a')).toHaveAttribute('href', '/explorar');
  });

  it('renders last item as plain text with aria-current', () => {
    const items = [
      { label: 'Inicio', href: '/' },
      { label: 'Pagina actual' },
    ];
    render(<Breadcrumbs items={items} />);
    const last = screen.getByText('Pagina actual');
    expect(last.closest('a')).toBeNull();
    expect(last).toHaveAttribute('aria-current', 'page');
  });

  it('renders without links when no hrefs', () => {
    render(<Breadcrumbs items={[{ label: 'Solo texto' }]} />);
    expect(screen.getByText('Solo texto')).toBeInTheDocument();
  });

  it('has aria-label on nav', () => {
    render(<Breadcrumbs items={[{ label: 'Test' }]} />);
    expect(screen.getByLabelText('Ruta de navegación')).toBeInTheDocument();
  });
});
