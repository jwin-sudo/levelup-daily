type Tab = 'Home' | 'Journal' | 'Goals' | 'Progress'

const tabs: Tab[] = ['Home', 'Journal', 'Goals', 'Progress']

const icons: Record<Tab, string> = {
  Home: '🏠',
  Journal: '📔',
  Goals: '🎯',
  Progress: '📈',
}

interface TabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-semibold transition-colors ${
            activeTab === tab
              ? 'text-green-500'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-xl">{icons[tab]}</span>
          <span>{tab}</span>
        </button>
      ))}
    </nav>
  )
}

export type { Tab }
