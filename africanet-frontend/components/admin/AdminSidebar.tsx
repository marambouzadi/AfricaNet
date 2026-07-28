'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  RefreshCcw,
  Users,
  Bot,
  LogOut,
} from 'lucide-react';

const navItems = [
  {
    section: 'PRINCIPAL',
    items: [{ label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard }],
  },
  {
    section: 'CATALOGUE',
    items: [
      { label: 'Produits', href: '/admin/produits', icon: Package },
      { label: 'Stock', href: '/admin/stock', icon: Boxes },
    ],
  },
  {
    section: 'GESTION',
    items: [
      { label: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
      { label: 'Échanges', href: '/admin/echanges', icon: RefreshCcw },
      { label: 'Clients', href: '/admin/clients', icon: Users },
    ],
  },
  {
    section: 'IA',
    items: [{ label: 'Assistant IA', href: '/admin/assistant', icon: Bot }],
  },
];

interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch('http://localhost:8090/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {});
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'AD';

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Administrateur';
  const roleLabel = user?.role === 'ADMIN' ? 'Administrateur' : user?.role || 'Admin';

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <div className="admin-logo-badge">AN</div>
        <div>
          <div className="admin-logo-name">AfricaNet</div>
          <div className="admin-logo-role">Back-office</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        {navItems.map((group) => (
          <div key={group.section} className="admin-nav-group">
            <div className="admin-nav-section-label">{group.section}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${active ? 'admin-nav-item-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="admin-user-avatar">{initials}</div>
          <div>
            <div className="admin-user-name">{fullName}</div>
            <div className="admin-user-role">{roleLabel}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
