interface FooterProps {
  site: { title: string; slug: string };
  practice: { name: string; phone: string | null; address: string | null } | null;
}

export function PublicFooter({ practice }: FooterProps) {
  return (
    <footer className="border-t bg-muted/30 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="font-semibold">{practice?.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{practice?.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{practice?.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {practice?.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}