'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { LinkButton } from '@/components/link-button';
import { ShieldCheck, Search, User, Mail, Send, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { inviteSupervision, searchUsers } from '@/services/api';

export default function SupervisorOnboardingPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showNoAccount, setShowNoAccount] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentName, setSentName] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedUser(null);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try { setSearchResults(await searchUsers(query)); }
      catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
  }, []);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.profile?.fullName || user.email);
    setSearchResults([]);
  };

  const handleSendInvite = async () => {
    if (selectedUser) {
      setSending(true);
      try {
        await inviteSupervision({
          clientName: selectedUser.profile?.fullName || selectedUser.email,
          clientId: selectedUser.id,
          clientEmail: selectedUser.email,
        });
        setSentName(selectedUser.profile?.fullName || selectedUser.email);
        setSent(true);
        toast.success('Invitación enviada');
      } catch (err: any) {
        toast.error(err.message || 'Error al enviar invitación');
      } finally {
        setSending(false);
      }
    } else if (showNoAccount && manualName && manualEmail) {
      setSending(true);
      try {
        await inviteSupervision({
          clientName: manualName,
          clientEmail: manualEmail,
        });
        setSentName(manualName);
        setSent(true);
        toast.success('Invitación enviada');
      } catch (err: any) {
        toast.error(err.message || 'Error al enviar invitación');
      } finally {
        setSending(false);
      }
    }
  };

  if (sent) {
    return (
      <Section>
        <Container>
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold mb-3">¡Invitación enviada!</h1>
            <p className="text-gray-500 text-lg mb-8">
              Hemos enviado un email a <strong>{sentName}</strong> para que pueda aceptar tu invitación de supervisión.
            </p>
            <Card className="p-6 border-0 shadow-xl bg-blue-50 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium">
                Mientras {sentName} no acepte, verás la invitación como &quot;Pendiente de aceptación&quot; en tu panel de Supervisión.
              </p>
            </Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" className="h-12 px-8" onClick={() => router.push('/supervision')}>
                Ir a mi Supervisión
              </Button>
              <Button variant="ghost" className="h-12 px-8" onClick={() => router.push('/explorar')}>
                Explorar GoTogether
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-3">Invita a la persona que supervisas</h1>
          <p className="text-gray-500 text-lg mb-10">
            Busca a la persona que quieres supervisar por su nombre. Le enviaremos una invitación por email.
          </p>

          <Card className="p-8 border-0 shadow-xl shadow-blue-900/5 mb-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" aria-hidden="true" />
              Buscar persona
            </h3>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="supervised-search" className="sr-only">Buscar por nombre</label>
              <input
                id="supervised-search"
                className="gt-input pl-9"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {searching && (
              <p className="text-sm text-gray-400 flex items-center gap-1 mb-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
              </p>
            )}

            {!searching && searchResults.length > 0 && !selectedUser && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                {searchResults.slice(0, 5).map((user: any) => (
                  <button
                    key={user.id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 flex items-center gap-3"
                    onClick={() => handleSelectUser(user)}
                  >
                    <User className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800">{user.profile?.fullName || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                <p className="text-sm text-blue-800 font-medium">
                  Enviar invitación a: <strong>{selectedUser.profile?.fullName || selectedUser.email}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">{selectedUser.email}</p>
              </div>
            )}

            <Button
              variant="primary"
              className="w-full h-12 flex items-center justify-center gap-2"
              onClick={handleSendInvite}
              disabled={sending || !selectedUser}
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              ) : (
                <><Send className="w-4 h-4" /> Enviar invitación de supervisión</>
              )}
            </Button>
          </Card>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-400 hover:text-blue-600 transition-colors"
              onClick={() => setShowNoAccount(!showNoAccount)}
            >
              {showNoAccount ? 'Buscar persona registrada' : 'La persona aún no tiene cuenta'}
            </button>
          </div>

          {showNoAccount && (
            <Card className="p-8 border-0 shadow-xl shadow-gray-900/5 mt-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                Invitar a alguien sin cuenta
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="manual-name">
                    Nombre de la persona
                  </label>
                  <input
                    id="manual-name"
                    className="gt-input"
                    placeholder="Ej: María García"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="manual-email">
                    Email de la persona
                  </label>
                  <input
                    id="manual-email"
                    type="email"
                    className="gt-input"
                    placeholder="Ej: maria@ejemplo.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full h-12"
                  onClick={handleSendInvite}
                  disabled={sending || !manualName || !manualEmail}
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</>
                  ) : (
                    'Enviar invitación'
                  )}
                </Button>
              </div>
            </Card>
          )}

          <div className="mt-8 text-center">
            <LinkButton href="/explorar" variant="ghost" className="text-sm">
              Omitir por ahora <ArrowRight className="w-4 h-4 ml-1" />
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
