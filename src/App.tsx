import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./lib/firebase";
import { UserProfile, Task } from "./types";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./components/Dashboard";
import { TaskList } from "./components/TaskList";
import { WithdrawForm } from "./components/WithdrawForm";
import { Coins, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync user profile
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || "",
            coins: 0,
            tasksCompleted: 0,
            totalWithdrawn: 0,
            role: 'user',
          };
          await setDoc(userRef, { ...newProfile, createdAt: serverTimestamp() });
          setStats(newProfile);
        }

        // Live stats listener
        const unsubStats = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setStats(doc.data() as UserProfile);
          }
        });

        // Load tasks
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snap) => {
          const t: Task[] = [];
          snap.forEach(doc => t.push({ id: doc.id, ...doc.data() } as Task));
          setTasks(t);
        });

        return () => {
          unsubStats();
          unsubTasks();
        };
      } else {
        setStats(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleClaim = async (taskId: string) => {
    if (!user) return;
    const idToken = await user.getIdToken();
    const response = await fetch('/api/claim-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, taskId })
    });
    
    if (!response.ok) {
      const err = await response.json();
      alert(err.error || "Failed to claim reward");
    }
  };

  const handleWithdrawal = async (data: { amount: number; method: string; details: string }) => {
    if (!user || !stats) return;
    if (stats.coins < data.amount) return;

    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        email: user.email,
        amountCoins: data.amount,
        amountUSD: data.amount / 1000,
        method: data.method,
        details: data.details,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Optimistically/Client-side we don't update coins directly because rules forbid it
      // But we can notify the user
      alert("Withdrawal request submitted successfully!");
      setActiveView('dashboard');
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Failed to submit withdrawal request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="bg-orange-500 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-orange-200 rotate-6">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">EarnFlow</h1>
            <p className="text-gray-500 mt-2">The most transparent way to earn coins through simple daily tasks.</p>
          </div>
          
          <button
            onClick={login}
            className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all hover:bg-gray-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>
          
          <div className="pt-12 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            Professional PTC Solution
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar 
        user={user} 
        coins={stats?.coins || 0} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && stats && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Dashboard stats={stats} setActiveView={setActiveView} />
            </motion.div>
          )}

          {activeView === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <TaskList tasks={tasks} onClaim={handleClaim} />
            </motion.div>
          )}

          {activeView === 'withdraw' && stats && (
            <motion.div key="withdraw" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <WithdrawForm stats={stats} onSubmit={handleWithdrawal} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">EarnFlow &copy; 2026</p>
        </div>
      </footer>
    </div>
  );
}
