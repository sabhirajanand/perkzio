import { Epilogue, Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-register-sans',
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-register-display',
});

export default function RegisterThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${plusJakarta.variable} ${epilogue.variable} ${plusJakarta.className} min-h-screen bg-[#F5F5F5] antialiased`}
    >
      {children}
    </div>
  );
}
