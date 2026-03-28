import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareText, Brain, RefreshCw, Menu, X, HeartPulse } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/sentiment', icon: MessageSquareText, label: 'Sentiment Analyzer' },
  { to: '/org-health', icon: HeartPulse, label: 'Org Health' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { refreshData } = useEmployees();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r-2 border-foreground bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-3 border-b-2 border-foreground px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-primary shadow-[2px_2px_0px_#000]">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-heading text-foreground">NOVA</h1>
            <p className="text-xs text-muted-foreground">AI-Powered HR Analytics</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t-2 border-foreground p-3">
          <button
            onClick={refreshData}
            className="sidebar-link w-full justify-center gap-2 hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Regenerate Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b-2 border-foreground bg-card px-4 py-3 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold font-heading">
              {NAV_ITEMS.find(i => i.to === location.pathname)?.label || 'Employee Insights'}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
