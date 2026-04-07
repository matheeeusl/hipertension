"use client"

import { Provider } from 'react-redux';
import { store } from '../../store';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from 'next-themes';

export default function Wrapper({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LocaleProvider>
        <AuthProvider>
          <Provider store={store}>
            {children}
          </Provider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
