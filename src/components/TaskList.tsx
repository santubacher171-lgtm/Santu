import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ExternalLink, Timer, CheckCircle, ArrowRight, X } from "lucide-react";
import { Task } from "../types";
import { AdSpace } from "./AdSpace";
import { auth } from "../lib/firebase";

interface TaskListProps {
  tasks: Task[];
  onClaim: (taskId: string) => Promise<void>;
}

export function TaskList({ tasks, onClaim }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCounting && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0 && isCounting) {
      setIsCounting(false);
      setCanClaim(true);
    }
    return () => clearInterval(interval);
  }, [isCounting, timer]);

  const startTask = (task: Task) => {
    setSelectedTask(task);
    setTimer(task.duration);
    setIsCounting(true);
    setCanClaim(false);
    
    // Simulate opening link/video
    window.open(task.url, '_blank', 'noreferrer');
  };

  const handleClaim = async () => {
    if (!selectedTask) return;
    setIsClaiming(true);
    try {
      await onClaim(selectedTask.id);
      setSelectedTask(null);
      setCanClaim(false);
    } finally {
      setIsClaiming(false);
    }
  };

  const closeTask = () => {
    setSelectedTask(null);
    setIsCounting(false);
    setCanClaim(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
          <p className="text-gray-500 text-sm">Select a task and wait for the timer to earn coins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 transition-all flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${task.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {task.type === 'video' ? <Play className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{task.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <Timer className="w-3 h-3" /> {task.duration}s
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                    +{task.reward} Coins
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => startTask(task)}
              className="bg-gray-50 group-hover:bg-orange-500 text-gray-400 group-hover:text-white p-2 rounded-xl transition-all"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <AdSpace label="AD_SPACE: TASKS_PAGE" />

      {/* Task Execution Overlay */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Task</span>
                <button onClick={closeTask} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-8 text-center space-y-6">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${canClaim ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                  {canClaim ? (
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <Timer className={`w-10 h-10 text-orange-500 ${isCounting ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">Please keep the task window open to earn your reward.</p>
                </div>

                <div className="text-4xl font-black text-gray-900 tabular-nums">
                  {timer}s
                </div>

                <div className="pt-4">
                  {canClaim ? (
                    <button
                      disabled={isClaiming}
                      onClick={handleClaim}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                      {isClaiming ? "Processing..." : `Claim ${selectedTask.reward} Coins`}
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl cursor-not-allowed">
                      Watching Ad...
                    </div>
                  )}
                </div>
                
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                  AD_SPACE: OVERLAY_BANNER
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
