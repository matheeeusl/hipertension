"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeSwitch } from "./ThemeSwitch";

export const NavMenu = () => {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-blue-600 ${
      pathname === href ? "text-blue-600" : "text-gray-600"
    }`;

  if (!user) {
    return (
      <div className="flex justify-end items-center gap-2 px-6 py-3 border-b bg-background">
        <ThemeSwitch />
        <LocaleSwitch />
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
          {t.auth.signIn}
        </Link>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-6 px-6 py-3 border-b bg-background">
      <Link href="/measure" className={linkClass("/measure")}>
        {t.nav.record}
      </Link>
      <Link href="/weight" className={linkClass("/weight")}>
        {t.nav.weight}
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-gray-400">{user.email}</span>
        <ThemeSwitch />
        <LocaleSwitch />
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          {t.nav.signOut}
        </Button>
      </div>
    </nav>
  );
};
