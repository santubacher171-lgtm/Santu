import { auth } from "../lib/firebase";
import { LogOut, Coins, CreditCard, LayoutDashboard, CheckSquare } from "lucide-react";
import { User } from "firebase/auth";

interface NavbarProps {
  user: User | null;
  coins: number;
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Navbar({ user, coins, activeView, setActiveView }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">EarnFlow</span>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'tasks', label: 'Earn Coins', icon: CheckSquare },
                { id: 'withdraw', label: 'Withdraw', icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === item.id 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-gray-700">{coins.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => auth.signOut()}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
                <span className="text-sm text-gray-400">Not Signed In</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      {user && (
        <div className="md:hidden border-t border-gray-50 flex justify-around p-2 bg-white">
            <button onClick={() => setActiveView('dashboard')} className={`p-2 transition-colors ${activeView === 'dashboard' ? 'text-orange-500' : 'text-gray-400'}`}>
                <LayoutDashboard className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveView('tasks')} className={`p-2 transition-colors ${activeView === 'tasks' ? 'text-orange-500' : 'text-gray-400'}`}>
                <CheckSquare className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveView('withdraw')} className={`p-2 transition-colors ${activeView === 'withdraw' ? 'text-orange-500' : 'text-gray-400'}`}>
                <CreditCard className="w-6 h-6" />
            </button>
        </div>
      )}
    </nav>
  );
}
