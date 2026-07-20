'use client';
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Role = 'admin' | 'user';

interface RoleContextType {
  role: Role;
  toggle: () => void;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: 'admin',
  toggle: () => {},
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('deskai-role') as Role | null;
    if (stored === 'admin' || stored === 'user') setRoleState(stored);
  }, []);

  const toggle = useCallback(() => {
    setRoleState(prev => {
      const next = prev === 'admin' ? 'user' : 'admin';
      if (mounted) localStorage.setItem('deskai-role', next);
      return next;
    });
  }, [mounted]);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    if (mounted) localStorage.setItem('deskai-role', r);
  }, [mounted]);

  return (
    <RoleContext.Provider value={{ role, toggle, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
