import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type AppThemeProviderProps = {
  children: React.ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="nova-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
