import { useState } from "react";
import { CreditCard, DollarSign, Send, Info } from "lucide-react";
import { UserProfile } from "../types";
import { AdSpace } from "./AdSpace";

interface WithdrawFormProps {
  stats: UserProfile;
  onSubmit: (data: { amount: number; method: string; details: string }) => Promise<void>;
}

export function WithdrawForm({ stats, onSubmit }: WithdrawFormProps) {
  const [method, setMethod] = useState("paypal");
  const [amount, setAmount] = useState(1000);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const usdValue = amount / 1000;
  const maxCoins = stats.coins;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 1000) return alert("Minimum withdrawal is 1000 coins ($1.00)");
    if (amount > maxCoins) return alert("Insufficient balance");
    
    setLoading(true);
    try {
      await onSubmit({ amount, method, details });
      setDetails("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Withdraw Earnings</h2>
        <p className="text-gray-500 text-sm">Convert your coins back to real cash.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Available</span>
            <div className="text-2xl font-black text-orange-600 mt-1">{stats.coins.toLocaleString()}</div>
            <div className="text-xs text-orange-400">Coins</div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Est. Value</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">${(stats.coins / 1000).toFixed(2)}</div>
            <div className="text-xs text-emerald-400">USD</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Withdrawal Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'paypal', label: 'PayPal' },
                { id: 'bkash', label: 'bKash' },
                { id: 'rocket', label: 'Rocket' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                    method === m.id 
                      ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount (Minimum 1,000)</label>
            <div className="relative">
              <input
                type="number"
                min={1000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">
                ≈ ${usdValue.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Details ({method === 'paypal' ? 'Email' : 'Number'})</label>
            <input
              required
              type="text"
              placeholder={method === 'paypal' ? "your@email.com" : "017XXXXXXXX"}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>

          <button
            disabled={loading || stats.coins < 1000}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : "Submit Withdrawal Request"}
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Withdrawals are processed manually to ensure security. You will receive an email confirmation once your payment has been sent.
          </p>
        </div>
      </div>

      <AdSpace label="AD_SPACE: WITHDRAW_PAGE" />
    </div>
  );
}
