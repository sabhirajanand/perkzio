export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="mt-4 h-4 w-64 animate-pulse rounded bg-zinc-100" />
        <div className="mt-10 h-12 w-full animate-pulse rounded-full bg-zinc-100" />
        <div className="mt-4 h-12 w-full animate-pulse rounded-full bg-zinc-100" />
      </div>
    </div>
  );
}

