import { Telescope } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Telescope className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                StarGazer AI
              </h1>
              <p className="text-xs text-muted-foreground">천체 관측 적합도 분석</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              사용법
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              피드백
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
