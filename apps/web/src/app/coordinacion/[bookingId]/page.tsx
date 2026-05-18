'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Container, Section } from '@gotogether/ui';
import { Phone, MapPin, Clock, Send } from 'lucide-react';
import { getChatRoom, getBooking } from '@/services/api';
import { createClient } from '@/lib/supabase/client';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface BookingData {
  id: string;
  serviceType: string;
  address: string;
  scheduledAt: string;
  status: string;
  client?: { id?: string; profile?: { fullName: string } | null } | null;
  companion?: { profile?: { fullName: string } | null } | null;
}

export default function CoordinacionPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [companionName, setCompanionName] = useState('');
  const [roomId, setRoomId] = useState('');

  const supabaseRef = useRef(createClient());
  const channelRef = useRef<any>(null);
  const roomIdRef = useRef('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const supabase = supabaseRef.current;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Debes iniciar sesión para acceder al chat.');
          setLoading(false);
          return;
        }

        const currentUserId = session.user?.id || '';

        const [chatData, bookingData] = await Promise.all([
          getChatRoom(bookingId),
          getBooking(bookingId),
        ]);

        if (cancelled) return;

        const initialMessages = chatData.messages || [];
        setMessages(initialMessages);
        setBooking(bookingData);
        setUserId(currentUserId);
        setRoomId(chatData.room.id);
        roomIdRef.current = chatData.room.id;

        const clientName = bookingData.client?.profile?.fullName || '';
        const companion = bookingData.companion?.profile?.fullName || '';
        setCompanionName(companion || clientName);

        const channel = supabase
          .channel(`room-${chatData.room.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ChatMessage',
              filter: `roomId=eq.${chatData.room.id}`,
            },
            (payload: any) => {
              const msg = payload.new as ChatMessage;
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
              scrollToBottom();
            },
          )
          .subscribe();

        channelRef.current = channel;

        setTimeout(() => scrollToBottom(), 100);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error al cargar el chat');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
    };
  }, [bookingId]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !roomIdRef.current || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const supabase = supabaseRef.current;
      const { error: insertError } = await supabase
        .from('ChatMessage')
        .insert({ roomId: roomIdRef.current, senderId: userId, content });

      if (insertError) throw insertError;

      scrollToBottom();
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto text-center py-20">
            <p className="text-gray-500">Cargando chat...</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto text-center py-20">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <Button variant="primary" onClick={() => router.push('/reservas')}>
              Volver a Mis Reservas
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/reservas')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium"
          >
            &larr; Volver a Mis Reservas
          </button>

          <h1 className="text-3xl font-bold mb-2">Coordinación del Servicio</h1>
          <p className="text-gray-500 mb-8">
            Chat en tiempo real para coordinar los detalles del servicio.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-0 flex flex-col gap-0 border-0 shadow-xl shadow-gray-900/5 overflow-hidden">
              <div className="flex justify-between items-center border-b p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {companionName ? companionName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="font-bold">{companionName || 'Acompañante'}</h3>
                    <p className="text-xs text-green-600 font-medium">En línea</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-blue-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Llamar
                </Button>
              </div>

              <div className="bg-gray-50 p-6 min-h-[400px] max-h-[500px] overflow-y-auto flex flex-col gap-4" role="log" aria-live="polite" aria-label="Mensajes del chat" ref={chatContainerRef}>
                {messages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No hay mensajes aún. Escribe el primero.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 p-4 border-t bg-white">
                <input
                  className="gt-input flex-grow"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <Button variant="primary" className="px-6" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <div className="space-y-6">
              {booking && (
                <Card className="p-6 border-0 shadow-xl shadow-gray-900/5">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Detalles de la reserva
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Servicio</span>
                      <p className="font-medium mt-1">{booking.serviceType}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ubicación</span>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="font-medium">{booking.address}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Fecha y hora</span>
                      <div className="flex items-start gap-2 mt-1">
                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="font-medium">
                          {new Date(booking.scheduledAt).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(booking.scheduledAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Estado</span>
                      <p className="font-medium mt-1 capitalize">{booking.status.toLowerCase().replace('_', ' ')}</p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-blue-600 text-white border-0 shadow-xl shadow-blue-600/20">
                <h4 className="font-bold mb-2">Asistencia Segura</h4>
                <p className="text-blue-100 text-sm mb-6">
                  Si necesitas ayuda urgente o quieres reportar una incidencia durante el servicio:
                </p>
                <a
                  href="tel:112"
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-base font-bold bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Llamada de Emergencia
                </a>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}