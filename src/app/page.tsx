export default function Page() {
  return (
    <>
    <nav className="h-24 border-b border-border px-10 flex items-center justify-between gap-8">
  
    <div className="text-xl tracking-tighter shrink-0">
      Disc-Overy
    </div>
  
    <div className="relative w-full max-w-md group flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary">
    </div>
    <input 
      type="text"
      placeholder="Search..."
      className="w-full bg-card/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50"
    />
    </div>
  
    <div className="w-10 h-10 rounded-full bg-primary shrink-0" />

    </nav>
    </>
  )
}