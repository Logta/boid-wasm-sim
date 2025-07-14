export function Header() {
  return (
    <header role="banner" className="bg-slate-800 border-b border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ボイド群れシミュレーション
          </h1>
          <p className="text-slate-400 text-sm mt-1">リアルタイム群れ行動シミュレーション</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-300">動作中</span>
        </div>
      </div>
    </header>
  )
}