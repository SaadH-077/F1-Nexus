export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-pulse">
      <div className="bg-card-dark border border-border-dark rounded-xl h-56 w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card-dark border border-border-dark rounded-xl h-48"></div>
        ))}
      </div>
    </div>
  );
}
