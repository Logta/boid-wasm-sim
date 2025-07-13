import "./index.css"
import { Header } from "../../../components/Header"
import { Sidebar } from "../../../components/Sidebar"
import { SimulationCanvas } from "../../../components/SimulationCanvas"

export function App() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Header />
        <SimulationCanvas />
      </main>
    </div>
  )
}