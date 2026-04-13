"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LayoutGrid, BookOpen, Users, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const SUB_NAV = [
  { href: "", label: "Kanban", icon: LayoutGrid },
  { href: "/storyline", label: "Storyline", icon: BookOpen },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/export", label: "Export", icon: Film },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const basePath = `/projects/${projectId}`;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 border-b border-border px-4 py-1 bg-card/30">
        {SUB_NAV.map((item) => {
          const fullHref = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(fullHref);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
