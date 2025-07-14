import { Bird, Circle } from "lucide-react"

export function Header() {
  return (
    <header role="banner" className="bg-card border-b p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bird className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ボイド群れシミュレーション
            </h1>
            <p className="text-muted-foreground text-sm mt-1">リアルタイム群れ行動シミュレーション</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">動作中</span>
        </div>
      </div>
    </header>
  )
}