import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { Home } from './pages/Home'
import { Journal } from './pages/Journal'
import { Goals } from './pages/Goals'
import { Progress } from './pages/Progress'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Home')

  const page = {
    Home: <Home />,
    Journal: <Journal />,
    Goals: <Goals />,
    Progress: <Progress />,
  }[activeTab]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <main className="flex-1 overflow-hidden pb-20">
        {page}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
