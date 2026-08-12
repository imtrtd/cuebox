"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type AppView = "home" | "library";

export function SiteNav({
  active,
  onCreate,
}: {
  active: AppView | "explore";
  onCreate?: () => void;
}) {
  const router = useRouter();

  function go(view: AppView) {
    router.push(view === "home" ? "/" : "/?view=library");
  }

  return (
    <nav className="site-nav" aria-label="Основная навигация">
      <div className="site-nav-pill">
        <button
          type="button"
          className={active === "home" ? "nav-tab active" : "nav-tab"}
          onClick={() => go("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={active === "library" ? "nav-tab active" : "nav-tab"}
          onClick={() => go("library")}
        >
          Library
        </button>
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
