import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CleanTrack Nashik — Unified Civic Issue Reporting & Tracking Portal',
  description:
    'Report garbage, potholes, water leakages, drainage blockages, and streetlights in Nashik. Real-time GPS geotagging, status tracking, and verified resolution.',
  keywords: [
    'Nashik Civic Portal',
    'CleanTrack Nashik',
    'Nashik Municipal Grievance',
    'Report Potholes Nashik',
    'Garbage Complaint Nashik',
    'Panchavati CIDCO Satpur',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
