import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";

const linkClass = "font-medium text-muted-foreground hover:text-foreground";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    setIsMenuOpen(false);
    logout();
    navigate("/", { replace: true });
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  const authenticatedLinks = (
    <>
      <Link to="/wishlist" className={linkClass} onClick={closeMenu}>
        Λίστα επιθυμιών
      </Link>
      <Link to="/my-listings" className={linkClass} onClick={closeMenu}>
        Οι αγγελίες μου
      </Link>
      <Link to="/my-proposals" className={linkClass} onClick={closeMenu}>
        Οι προτάσεις μου
      </Link>
      {user?.role === "admin" && (
        <Link to="/admin" className={linkClass} onClick={closeMenu}>
          Διαχείριση
        </Link>
      )}
    </>
  );

  return (
    <nav className="border-b px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary" onClick={closeMenu}>
            <img src={logo} alt="ReBook" className="h-8 w-8 rounded-md" />
            ReBook
          </Link>
          <Link to="/listings" className={`hidden sm:inline text-sm ${linkClass}`} onClick={closeMenu}>
            Αγγελίες
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-4 text-sm md:flex">
          {user ? (
            <>
              {authenticatedLinks}
              <NotificationBell />
              <span className="text-muted-foreground">{user.full_name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Αποσύνδεση
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Σύνδεση
              </Link>
              <Link to="/register">
                <Button size="sm">Εγγραφή</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          <button
            aria-label="Μενού"
            className="rounded-md p-2 text-foreground hover:bg-accent"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMenuOpen && (
        <div className="mt-3 flex flex-col gap-3 border-t pt-3 text-sm md:hidden">
          <Link to="/listings" className={linkClass} onClick={closeMenu}>
            Αγγελίες
          </Link>
          {user ? (
            <>
              {authenticatedLinks}
              <span className="text-muted-foreground">{user.full_name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-fit">
                Αποσύνδεση
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass} onClick={closeMenu}>
                Σύνδεση
              </Link>
              <Link to="/register" onClick={closeMenu}>
                <Button size="sm">Εγγραφή</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
