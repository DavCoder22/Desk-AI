import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RoleProvider } from '@/components/RoleProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'DeskAI - Gestión de Incidentes',
  description: 'Sistema de Gestión de Incidentes Inteligente con IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden">
        <ThemeProvider>
          <RoleProvider>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950 transition-colors">
                {children}
                <footer className="text-center text-xs text-gray-400 dark:text-gray-600 pt-8 pb-4 border-t border-gray-200 dark:border-gray-800 mt-8">
                  <p>
                    Desarrollado por{' '}
                    <a href="https://github.com/DavCoder22" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                      David Malquin
                    </a>{' '}
                    &mdash; Universidad Central del Ecuador &mdash;{' '}
                    <a href="https://github.com/DavCoder22/Desk-AI" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      DeskAI
                    </a>
                  </p>
                </footer>
              </main>
            </div>
            <Toaster position="top-right" />
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
