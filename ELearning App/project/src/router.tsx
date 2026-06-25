import React, { createContext, useContext, useState, useCallback } from 'react';

export type Page =
  | 'home'
  | 'courses'
  | 'course-detail'
  | 'lesson'
  | 'my-learning'
  | 'bookmarks'
  | 'notifications'
  | 'profile'
  | 'admin-courses'
  | 'admin-students';

type RouterContextType = {
  currentPage: Page;
  params: Record<string, string>;
  navigate: (page: Page | string, params?: Record<string, string>) => void;
};

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((page: string, newParams?: Record<string, string>) => {
    setCurrentPage(page as Page);
    setParams(newParams ?? {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <RouterContext.Provider value={{ currentPage, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useLocation must be used within RouterProvider');
  return ctx;
}

export function Link({ page, params, children, className }: {
  page: string;
  params?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}) {
  const { navigate } = useLocation();
  return (
    <button onClick={() => navigate(page, params)} className={className}>
      {children}
    </button>
  );
}
