import { useEffect, useState } from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "postgrad-hub-ui-theme";

type ThemeToggleProps = {
  /** e.g. light icons on the public navy header */
  triggerClassName?: string;
};

export function ThemeToggle({ triggerClassName }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 shrink-0", triggerClassName)}
          aria-label="Color theme"
        >
          <Sun className="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          disabled={!mounted}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          Light
          {mounted && theme === "light" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          disabled={!mounted}
          className="gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
          {mounted && theme === "dark" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          disabled={!mounted}
          className="gap-2"
        >
          <Monitor className="h-4 w-4" />
          System
          {mounted && theme === "system" ? <span className="ml-auto text-xs text-muted-foreground">✓</span> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
