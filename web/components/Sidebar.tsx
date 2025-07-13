export function Sidebar() {
  return (
    <aside role="complementary" className="w-80 bg-gray-800 p-6">
      <h2 className="text-xl font-bold mb-6">Controls</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Boid Count</h3>
          {/* boid数セレクター */}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Parameters</h3>
          {/* パラメータスライダー */}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Simulation Control</h3>
          {/* 再生/一時停止/リセットボタン */}
        </div>
      </div>
    </aside>
  )
}