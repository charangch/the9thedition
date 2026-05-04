export default function Loading() {
  return (
    <main className="container-premium py-12" aria-busy="true" aria-live="polite">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-charcoal/10" />
          <div className="h-10 w-80 max-w-full rounded bg-charcoal/10" />
          <div className="h-4 w-[34rem] max-w-full rounded bg-charcoal/10" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-primary/15 bg-white">
              <div className="aspect-[16/10] w-full bg-charcoal/10" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-24 rounded bg-charcoal/10" />
                <div className="h-6 w-full rounded bg-charcoal/10" />
                <div className="h-4 w-2/3 rounded bg-charcoal/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
