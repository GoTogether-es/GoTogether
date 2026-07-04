import { render, screen } from '@testing-library/react';

jest.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('@/components/notification-bell', () => ({
  NotificationBell: () => null,
}));

jest.mock('@/components/confirm-dialog', () => ({
  ConfirmDialog: () => null,
}));

jest.mock('@/components/route-announcer', () => ({
  RouteAnnouncer: () => null,
}));

import { AppShell } from '@/components/app-shell';

describe('AppShell', () => {
  it('renders the navigation and footer', () => {
    render(
      <AppShell>
        <div data-testid="content">Page content</div>
      </AppShell>,
    );

    expect(screen.getByAltText('GoTogether')).toBeInTheDocument();
    expect(screen.getAllByText('Explorar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Abrir menú principal')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders login button when no session', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('has skip-to-content link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument();
  });
});
