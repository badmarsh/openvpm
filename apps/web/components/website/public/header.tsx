import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  site: { title: string; slug: string };
  practice: { name: string; logoUrl: string | null } | null;
  navPages: { title: string; slug: string }[];
}

export function PublicHeader({ site, practice, navPages }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/site/${site.slug}`} className="flex items-center gap-3">
          {practice?.logoUrl && (
            <Image
              src={practice.logoUrl}
              alt={practice.name}
              width={40}
              height={40}
              className="rounded"
            />
          )}
          <span className="text-lg font-semibold">{practice?.name ?? site.title}</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          {navPages.map((page) => (
            <Link
              key={page.slug}
              href={`/site/${site.slug}/${page.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}