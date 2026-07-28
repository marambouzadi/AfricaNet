'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  breadcrumb: string;
}

export default function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const [initials, setInitials] = useState('AD');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch('http://localhost:8090/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const init = `${data.firstName?.charAt(0) || ''}${data.lastName?.charAt(0) || ''}`.toUpperCase();
            setInitials(init || 'AD');
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-header-title">{title}</h1>
        <p className="admin-header-breadcrumb">{breadcrumb}</p>
      </div>
      <div className="admin-header-right">
        <button className="admin-notif-btn">
          <Bell size={20} />
          <span className="admin-notif-badge">3</span>
        </button>
        <div className="admin-header-avatar">{initials}</div>
      </div>
    </header>
  );
}
