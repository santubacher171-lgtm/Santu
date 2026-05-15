import { motion } from "motion/react";
import { Coins, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { UserProfile } from "../types";
import { AdSpace } from "./AdSpace";

interface DashboardProps {
  stats: UserProfile;
  setActiveView: (view: string) => void;
}

export function Dashboard({ stats, setActiveView }: DashboardProps) {
  const usdBalance = stats.coins / 1000;

  const cards = [
    { label: 'Total Balance', value: stats.coins.toLocaleString(), sub: 'Coins', icon: Coins, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Estimated Value', value: `$${usdBalance.toFixed(2)}`, sub: 'USD', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tasks Completed', value: stats.tasksCompleted, sub: 'Tasks', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Withdrawn', value: `$${stats.totalWithdrawn.toFixed(2)}`, sub: 'Paid Out', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 text-sm">Here's your earning summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl transition-transform group-hover:scale-110`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AdSpace label="AD_SPACE: DASHBOARD_BANNER" />
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to earn more?</h2>
              <p className="text-gray-500 max-w-md mb-6">Complete simple tasks like watching videos or visiting links to accumulate more coins instantly.</p>
              <button 
                onClick={() => setActiveView('tasks')}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                Start Earning Now
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
            <Coins className="absolute -bottom-10 -right-10 w-48 h-48 text-orange-50/50 -rotate-12" />
          </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-3xl text-white">
                <h3 className="font-bold mb-4">Quick Tip</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Withdrawals are processed within 24-48 hours. Make sure your payment details are correct before submitting a request.
                </p>
                <div className="mt-6 flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-300">System Status: Online</span>
                </div>
            </div>
            <AdSpace label="AD_SPACE: SIDEBAR" />
        </div>
      </div>
    </div>
  );
}
