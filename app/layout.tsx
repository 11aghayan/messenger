import type { Metadata } from 'next';

import ActiveStatus from '@/app/components/ActiveStatus';

import ToasterContext from './context/ToasterContext';
import AuthContext from './context/AuthContext';

import './globals.css';

export const metadata: Metadata = {
  title: 'Messenger Clone',
  description: 'Messenger Clone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          <ToasterContext />
          <ActiveStatus />
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
