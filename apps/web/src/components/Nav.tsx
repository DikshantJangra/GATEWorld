import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/library", label: "Library" },
];

export function Nav() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3 text-sm">
        <span className="font-semibold">GATEWorld</span>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
