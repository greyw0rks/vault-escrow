import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'VaultSTX',
  description: 'Trustless milestone escrow on Stacks',
  other: {
      // Talent Protocol verification (update with your actual meta tag)
      "talentapp:project_verification": "59648f1734efc1a574c31c83b45ea63bd0c6eda15fec5523a8895afcbdb232c75b2bb8fcd511bf2dd603494fd2ac5a8c74d8be10884bee3b165c7278aedb9464",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
