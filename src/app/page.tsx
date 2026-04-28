import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Disc, House, ZodiacVirgo } from "lucide-react";

export default function Page() {
  return (
    <>
      <nav className="flex items-center justify-between h-24 gap-2 px-10 border-b border-border">
        <div className="flex shrink-0 items-center gap-2 text-xl">
          <Disc className="w-10 h-10" />
          <span>Disc-Overy</span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="rounded-full">
            <House />
          </Button>
          <div className="relative w-full max-w-md group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-primary group-focus-within:text-primary"></div>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              className="w-96 bg-card/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50"
            ></input>
          </div>
        </div>

        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full shrink-0">
          <ZodiacVirgo />
        </div>
      </nav>
      <div className="py-5 grid grid-cols-12 w-full">
        <div className="col-span-2 flex justify-center py-5">
          <p className="uppercase tracking-tighter text-center">Pulse Matches <br/> Find Your Music Soulmate</p>          
        </div>

        <div className="col-span-8 py-5 px-25">
          <div className="py-5">
            <p className="font-sans text-primary tracking-tighter uppercase text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] drop-shadow-[0_0_2px_rgba(168,85,247,1)]">
              Daily Discovery
            </p>
            <p className="font-sans font-black tracking-tighter uppercase text-9xl">
              YOUR PULSE.
            </p>
            <div className="grid grid-cols-5 w-full py-15">
              <div className="col-span-1 flex justify-center items-center">
                <div className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src="https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F256d9a1f3c58022e090c66f46b9de938.640x640x1.jpg"
                      alt="Lambing"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary opacity-0 shadow-xl transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                      <svg
                        fill="black"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="truncate font-sans text-lg font-bold tracking-tight text-white">
                      Lambing
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Lola Amour
                    </p>
                  </div>

                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-purple-600/20 group-hover:opacity-100" />
                </div>
              </div>

              <div className="col-span-1 flex justify-center items-center">
                <div className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src="https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F917be436c8bcbb07003bcf22100d3e1e.1000x1000x1.png"
                      alt="Pag-Ibig ay Kanibalismo II"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary opacity-0 shadow-xl transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                      <svg
                        fill="black"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="truncate font-sans text-lg font-bold tracking-tight text-white">
                      Pag-Ibig ay Kanibalismo II
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      fitterkarma
                    </p>
                  </div>

                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-purple-600/20 group-hover:opacity-100" />
                </div>
              </div>

                  <div className="col-span-1 flex justify-center items-center">
                <div className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src="https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fdfa6b621942590d3d3e78cec9b813e48.1000x1000x1.jpg"
                      alt="Leonora"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary opacity-0 shadow-xl transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                      <svg
                        fill="black"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="truncate font-sans text-lg font-bold tracking-tight text-white">
                      Leonora
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Sugarcane
                    </p>
                  </div>

                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-purple-600/20 group-hover:opacity-100" />
                </div>
              </div>

                  <div className="col-span-1 flex justify-center items-center">
                <div className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src="https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F48310c065367f5a328c0717cf089ed20.1000x1000x1.png"
                      alt="Multo"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary opacity-0 shadow-xl transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                      <svg
                        fill="black"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="truncate font-sans text-lg font-bold tracking-tight text-white">
                      Multo
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Cup of Joe
                    </p>
                  </div>

                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-purple-600/20 group-hover:opacity-100" />
                </div>
              </div>

                  <div className="col-span-1 flex justify-center items-center">
                <div className="group relative w-full max-w-[280px] rounded-xl bg-zinc-900/40 p-4 transition-all duration-300 hover:bg-zinc-800/60 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src="https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2F02f9f4e770a8d8dfc532660c381927c5.1000x1000x1.png"
                      alt="Sinta"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary opacity-0 shadow-xl transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                      <svg
                        fill="black"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 ml-1"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="truncate font-sans text-lg font-bold tracking-tight text-white">
                      Sinta
                    </h3>
                    <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                      Rob Deniel
                    </p>
                  </div>

                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-600/0 to-purple-600/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:from-purple-600/20 group-hover:opacity-100" />
                </div>
              </div>

            </div>
          </div>
        </div>
        
        
        <div className="h-screen overflow-y-auto sticky top-0 col-span-2 py-5 no-scrollbar">
          <ToggleGroup type="single" defaultValue="all" spacing={2}>
            <ToggleGroupItem value="Queue">Queue</ToggleGroupItem>
            <ToggleGroupItem value="Lyrics">Lyrics</ToggleGroupItem>
          </ToggleGroup>
          <p className="flex justify-center py-10 font-sans text-xl">            
            &apos;O ayan ka nanaman<br/>
            Kailangan ko na bang kabahan?<br/>
            Ayus lang, ano naman<br/>
            Kung magsama na naman ang magkaibigan lang?<br/>
            <br/>          
            Wag kang ngumiti<br/>
            &apos;Di ako madadaan sa tamis ng tingin<br/>
            Kung hanggang kilig lang naman tayong dalawa<br/>            
            <br/>
            Wag kang masyadong malambing (Di ko kayang humindi)<br/>
            Mabuti pa at wag na nating alamin (Sa sunod na lang ulit)<br/>
            Wag kang masyadong malambing<br/>          
            <br/>
            Yo! Chill!<br/>
            Yo! Chill!<br/>
            <br/>            
            Ano ba? At ano na?<br/>
            Habul-habulan nalang ba tayong dalawa?<br/>
            Okay lang, o&apos; basta<br/>
            Wag mo na sanang dagdagan ang aking naramdaman<br/>
            <br/>
            Wag kang ngumiti<br/>
            &apos;Di ako madadaan sa tamis ng tingin<br/>
            Kung hanggang kilig lang naman tayong dalawa<br/>
            <br/>            
            Wag kang masyadong malambing (&apos;Di ko kayang humindi)<br/>
            Mabuti pa at wag na nating alamin (Sa sunod na lang ulit)<br/>
            Wag kang masyadong malambing<br/>
            <br/>
            Ano ba talaga? (Ano na?)<br/>
            Damayan nalang ba? (Damayan nalang ba?)<br/>
            O&apos; tuloy-tuloy na? (O&apos; tuloy-tuloy na?)<br/>
            (&apos;Di ko kayang humindi)<br/>
            (Sa sunod na lang ulit)<br/>
            <br/>
            Wag kang masyadong malambing (&apos;Di ko kayang humindi)<br/>
            Mabuti pa at wag na nating alamin (Sa sunod na lang ulit)<br/>
            Wag kang masyadong malambing<br/>
            <br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang tanga!<br/>
            Wag kang masyadong malambing<br/>
          </p>
        </div>
      </div>
    </>
  );
}
