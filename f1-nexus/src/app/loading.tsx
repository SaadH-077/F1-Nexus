export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-4 pb-24 space-y-6 animate-pulse">
      {/* Stats bar skeleton */}
      <div className="bg-card-dark border border-border-dark rounded-xl h-14 w-full" />

      {/* Hero skeleton */}
      <div className="bg-card-dark border border-border-dark rounded-2xl w-full" style={{ minHeight: 520 }}>
        <div className="p-8 md:p-12 space-y-4">
          <div className="h-5 w-24 bg-white/5 rounded-full" />
          <div className="h-12 w-64 bg-white/5 rounded-lg" />
          <div className="h-4 w-48 bg-white/5 rounded" />
          <div className="flex gap-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
            <div className="h-12 border-b border-border-dark bg-white/[0.02]" />
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="flex items-center gap-2.5 py-2">
                  <div className="w-4 h-4 bg-white/5 rounded" />
                  <div className="w-9 h-9 bg-white/5 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-24 bg-white/5 rounded" />
                    <div className="h-2 w-16 bg-white/[0.03] rounded" />
                  </div>
                  <div className="w-8 h-4 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pace chart skeleton */}
      <div className="bg-card-dark border border-border-dark rounded-2xl h-48 w-full" />
    </div>
  );
}
