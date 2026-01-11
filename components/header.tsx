import { Telescope } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Telescope className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
                별볼일
              </h1>
              <p className="text-xs text-muted-foreground">오늘 밤 별볼일 있나요?</p>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              사용법
            </Link>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              피드백
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
