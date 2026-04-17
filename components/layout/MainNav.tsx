"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Book,
  Calendar,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  User,
  Video,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MainNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => pathname?.startsWith(path);

  // Only show links that actually work in the MVP
  const dashboardPath =
    user.role === "tutor"
      ? "/tutor-dashboard"
      : user.role === "admin"
      ? "/admin-dashboard"
      : "/dashboard";

  const navItems = [
    {
      title: "Dashboard",
      href: dashboardPath,
      icon: <Home className="mr-2 h-4 w-4" />,
      active: isActive(dashboardPath),
    },
    {
      title: "Courses",
      href: "/courses",
      icon: <Book className="mr-2 h-4 w-4" />,
      active: isActive("/courses"),
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Video className="mr-2 h-4 w-4" />,
      active: isActive("/live-classes"),
    },
  ];

  // "Both" role gets a second dashboard link
  if (user.role === "both") {
    navItems.splice(1, 0, {
      title: "Tutor View",
      href: "/tutor-dashboard",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      active: isActive("/tutor-dashboard"),
    });
  }

  const displayName = user.full_name || user.email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center">
          <Link href={dashboardPath} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block text-xl font-extrabold tracking-tight text-foreground">
              Edu<span className="text-primary">Connect</span>
            </span>
          </Link>

          <nav className="ml-10 hidden space-x-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] border-r-0 bg-background"
            >
              <div className="flex h-16 items-center border-b px-4">
                <Link
                  href={dashboardPath}
                  className="flex items-center gap-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-extrabold">
                    Edu<span className="text-primary">Connect</span>
                  </span>
                </Link>
              </div>
              <nav className="flex flex-col space-y-1 px-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Avatar className="h-9 w-9 border-2 border-border">
                  <AvatarImage
                    src={user.avatar_url || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-semibold text-foreground max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-bold">{displayName}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={dashboardPath} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/courses" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Courses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


