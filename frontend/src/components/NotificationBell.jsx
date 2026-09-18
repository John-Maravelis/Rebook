import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const POLL_INTERVAL_MS = 15000;

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  async function loadNotifications() {
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
    } catch {
      // π.χ. έληξε το token - δεν είναι κρίσιμο, θα ξαναδοκιμάσει στο επόμενο poll
    }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notification) {
    try {
      if (!notification.is_read) {
        await api.patch(`/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
        );
      }
    } catch {
      // αγνοούμε, δεν είναι κρίσιμο για το UX
    }
    setIsOpen(false);
    if (notification.listing_id) {
      navigate(`/listings/${notification.listing_id}`);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen((prev) => !prev)}>
        <span className="relative">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border bg-card p-2 shadow-md">
          {notifications.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">Δεν υπάρχουν ειδοποιήσεις.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer rounded-md p-2 text-sm ${
                    notification.is_read ? "text-muted-foreground" : "bg-secondary font-medium"
                  }`}
                >
                  {notification.content}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
