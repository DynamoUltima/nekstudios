"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  /** Optional count shown on the right — the fulfilment queue, mostly. */
  badge?: number;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Vertical rail nav — the desktop layout. */
export function AdminNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-9">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="label px-5 text-[0.5625rem] text-bone/30">
            {group.title}
          </p>

          <ul className="mt-3.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`label relative flex items-center justify-between gap-3 py-3 pr-5 pl-5 transition-colors duration-200 ${
                      active
                        ? "bg-white/6 text-bone"
                        : "text-bone/55 hover:bg-white/4 hover:text-bone"
                    }`}
                  >
                    {/* The red edge is the only thing marking the current page. */}
                    <span
                      aria-hidden="true"
                      className={`absolute top-0 left-0 h-full w-0.5 bg-red transition-opacity duration-200 ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-1 text-[0.5625rem] tabular-nums ${
                          active ? "bg-red text-white" : "bg-white/10 text-bone/70"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Horizontal strip that replaces the rail below `lg`. */
export function AdminNavStrip({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const items = groups.flatMap((g) => g.items);

  return (
    <nav className="scrollbar-none flex gap-1 overflow-x-auto px-4">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`label shrink-0 border-b-2 px-3.5 py-4 transition-colors duration-200 ${
              active
                ? "border-red text-bone"
                : "border-transparent text-bone/55 hover:text-bone"
            }`}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-2 text-red tabular-nums">{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
