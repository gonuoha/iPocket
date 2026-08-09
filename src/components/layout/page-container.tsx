import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export function PageContainer({ children, className, wide }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8",
        wide ? "max-w-2xl lg:max-w-7xl" : "max-w-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

type PageContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>{children}</div>
  );
}

type PageSectionProps = {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function PageSection({
  title,
  children,
  action,
  className,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-center justify-between gap-3">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className={title || action ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
