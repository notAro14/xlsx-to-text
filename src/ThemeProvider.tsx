import { Theme } from "@radix-ui/themes";
import { useMediaQuery } from "@uidotdev/usehooks";
import { type ReactNode, useEffect, useRef } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (themeRef.current) {
      themeRef.current.className = isDark
        ? "dark radix-themes"
        : "light radix-themes";
    }
  }, [isDark]);

  return <Theme ref={themeRef}>{children}</Theme>;
}
