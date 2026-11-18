import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  ChevronRight,
  X,
  Shield,
  Check,
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  type AppNotification,
} from '../../lib/api/notifications';
import { acceptRoleInvite, declineRoleInvite } from '../../lib/api/profiles';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'consultation' | 'updates'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const userIdentifier = user?.id || user?.email || '';

  const loadNotifs = () => {
    if (!userIdentifier) {
      setNotifications([]);
      return;
    }
    setNotifications(getNotifications(userIdentifier));
  };

  useEffect(() => {
    loadNotifs();
    const handleUpdate = () => loadNotifs();
    window.addEventListener('ayush_notification_update', handleUpdate);
    window.addEventListener('ayush_auth_change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ayush_notification_update', handleUpdate);
      window.removeEventListener('ayush_auth_change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [userIdentifier]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleAcceptRole = async (notif: AppNotification) => {
    if (!user) return;
    setActionInProgress(notif.id);
    try {
      await acceptRoleInvite(user.id, user.email, notif.id);
      loadNotifs();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeclineRole = async (notif: AppNotification) => {
    if (!user) return;
    setActionInProgress(notif.id);
    try {
      await declineRoleInvite(user.id, user.email, notif.id);
      loadNotifs();
    } finally {
      setActionInProgress(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'consultation') return n.type === 'consultation';
    if (filter === 'updates') return n.type === 'event' || n.type === 'system' || n.type === 'role_invite';
    return true;
  });

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative inline-block text-left" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-full text-ayush-ivory/85 hover:text-ayush-gold hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-ayush-charcoal/10 z-50 overflow-hidden font-ui animate-scale-in">
            {/* Header */}
            <div className="px-5 py-3.5 bg-ayush-forest text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-ayush-gold" />
                <h3 className="font-display font-bold text-base text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-ayush-gold text-ayush-forest font-bold text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead(userIdentifier)}
                    className="text-xs font-semibold text-ayush-gold hover:underline flex items-center gap-1 cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clearNotifications(userIdentifier)}
                    className="p-1 rounded text-white/60 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Clear notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-around border-b border-gray-100 bg-gray-50/80 px-2 py-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'consultation', label: 'Consultations' },
                { id: 'updates', label: 'Updates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filter === tab.id
                      ? 'bg-white text-ayush-forest shadow-xs border border-gray-200/60'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notification Items List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {filteredNotifs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Bell className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No new notifications</p>
                  <p className="text-xs text-gray-400">You're all caught up!</p>
                </div>
              ) : (
                filteredNotifs.map((notif) => {
                  const isRoleInvite = notif.type === 'role_invite' && notif.roleInvite;
                  const isInvitePending = isRoleInvite && notif.roleInvite?.status === 'pending';

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 transition-colors flex gap-3 items-start ${
                        !notif.read ? 'bg-amber-50/40 font-medium' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {/* Status Icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {isRoleInvite ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                          </div>
                        ) : notif.status === 'confirmed' || notif.status === 'completed' ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : notif.status === 'pending' ? (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                          </div>
                        ) : notif.status === 'rejected' || notif.status === 'cancelled' ? (
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <XCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Info className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{notif.message}</p>

                        {/* Consultation Extra Badges */}
                        {(notif.doctorName || notif.date) && (
                          <div className="inline-flex items-center gap-2 text-[11px] text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded-md mb-1 font-semibold">
                            {notif.doctorName && <span>👨‍⚕️ {notif.doctorName}</span>}
                            {notif.date && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Calendar className="w-3 h-3 text-ayush-gold" /> {notif.date}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Role Invite Action Buttons */}
                        {isInvitePending ? (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={actionInProgress === notif.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptRole(notif);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept Role
                            </button>
                            <button
                              type="button"
                              disabled={actionInProgress === notif.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineRole(notif);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : isRoleInvite && notif.roleInvite?.status === 'accepted' ? (
                          <div className="mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accepted & Active
                          </div>
                        ) : isRoleInvite && notif.roleInvite?.status === 'declined' ? (
                          <div className="mt-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <X className="w-3 h-3" /> Declined
                          </div>
                        ) : notif.type === 'consultation' ? (
                          <div className="flex items-center justify-end pt-0.5">
                            <Link
                              to="/dashboard?tab=consultations"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                              }}
                              className="text-[11px] font-bold text-ayush-forest hover:text-ayush-gold inline-flex items-center gap-0.5"
                            >
                              View Details <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="text-xs font-bold text-ayush-forest hover:text-ayush-gold transition-colors inline-flex items-center gap-1"
              >
                Go to Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
