"use client";

import Link from "next/link";

export type AppView = "home" | "library";

export function SiteNav({
  active,
  onNavigate,
  onCreate,
}: {
  active: AppView | "explore";
  onNavigate?: (view: AppView) => void;
  onCreate?: () => void;
}) {
  return (
    <nav className="site-nav" aria-label="Основная навигация">
      <div className="site-nav-pill">
        {onNavigate ? (
          <button
            type="button"
            className={active === "home" ? "nav-tab active" : "nav-tab"}
            onClick={() => onNavigate("home")}
          >
            Home
          </button>
        ) : (
          <Link
            href="/?view=home"
            className={active === "home" ? "nav-tab active" : "nav-tab"}
          >
            Home
          </Link>
        )}
        {onNavigate ? (
          <button
            type="button"
            className={active === "library" ? "nav-tab active" : "nav-tab"}
            onClick={() => onNavigate("library")}
          >
            Library
          </button>
        ) : (
          <Link
            href="/?view=library"
            className={active === "library" ? "nav-tab active" : "nav-tab"}
          >
            Library
          </Link>
        )}
        {onCreate ? (
          <button type="button" className="nav-tab" onClick={onCreate}>
            Create
          </button>
        ) : (
          <Link href="/?view=library&create=1" className="nav-tab">
            Create
          </Link>
        )}
        <Link
          href="/explore"
          className={active === "explore" ? "nav-tab active" : "nav-tab"}
        >
          Explore
        </Link>
      </div>
    </nav>
  );
}
