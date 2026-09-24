import type { Metadata } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const grotesk = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-grotesk',
  display: 'swap',
});

const jbmono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jbmono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VaultSTX® — Trustless Milestone Escrow',
  description:
    'STX-locked milestone escrow on Stacks. Fund work, release per milestone, arbitrate disputes on-chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${jbmono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
