interface SectionHeaderProps {
  title: string;
  description?: string;
  actionSlot?: React.ReactNode;
}

export function SectionHeader({ title, description, actionSlot }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
          {title}
        </p>
        {description && <p className="mt-2 max-w-xl text-sm text-slate-500">{description}</p>}
      </div>
      {actionSlot && <div className="flex items-center gap-3">{actionSlot}</div>}
    </div>
  );
}
