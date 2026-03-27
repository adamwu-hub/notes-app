import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Notes App',
  description: 'A secure way to store and share your notes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
