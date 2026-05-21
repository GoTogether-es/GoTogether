'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Mail, CheckCircle2, XCircle, PartyPopper, Ban, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/services/api';
import type { NotificationData } from '@/types';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const ICON_MAP: Record<string, { icon: typeof Bell; className: string }> = {
  booking_requested: { icon: Mail, className: 'text-blue-500' },
  booking_accepted: { icon: CheckCircle2, className: 'text-emerald-500' },
  booking_declined: { icon: XCircle, className: 'text-red-500' },
  booking_completed: { icon: PartyPopper, className: 'text-amber-500' },
  booking_cancelled: { icon: Ban, className: 'text-red-500' },
  rating_received: { icon: Star, className: 'text-amber-500' },
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      if (cancelled) return;
      setNotifications(notifs);
      setUnreadCount(count);
    }

    load();

    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!session) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        load();
      }
    });

    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Notification' },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleClick = async (notif: NotificationData) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
    }
    if (notif.bookingId) {
      router.push(`/reservas`);
      setOpen(false);
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Notificaciones (${unreadCount} sin leer)`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
        >
          <div className="p-3 border-b flex items-center justify-between">
            <p className="font-bold text-sm">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Marcar todas leidas
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">Sin notificaciones</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={clsx(
                    'w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
                    !n.read && 'bg-blue-50/30',
                  )}
                >
                  {(() => {
                    const mapped = ICON_MAP[n.type];
                    const IconComponent = mapped?.icon || Bell;
                    return (
                      <span className={`shrink-0 ${mapped?.className || 'text-gray-400'}`}>
                        <IconComponent className="w-5 h-5" />
                      </span>
                    );
                  })()}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}