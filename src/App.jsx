import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChartLine, Clock3, Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import TimezoneForm from "./components/features/TimezoneForm";
import TimezoneTable from "./components/features/TimezoneTable";
import Modal from "./components/ui/Modal";
import WeeklyViewModal from "./components/features/WeeklyViewModal";

const queryClient = new QueryClient();

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyViewOpen, setIsWeeklyViewOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex flex-col gap-10 px-4 py-10 mx-auto w-full max-w-6xl sm:px-6 lg:px-10">
          <header className="p-8 space-y-6 rounded-3xl border shadow-2xl bg-linear-to-br border-white/10 from-slate-900 via-slate-950 to-slate-900">
            <div className="flex flex-col gap-5 lg:gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                  <Clock3 className="w-3.5 h-3.5" />
                  Live Ops
                </p>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  Global Timezone Command Center
                </h1>
                <p className="text-base text-slate-300 sm:text-lg">
                  Detect your current location, capture teammates’ working
                  times, and keep every region in sync. Built to feel great on
                  both desktop and mobile.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex text-nowrap gap-2 items-center px-5 py-3 text-sm font-semibold text-white bg-violet-600 rounded-2xl transition hover:bg-violet-500 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              </div>
            </div>
          </header>

          <section className="p-6 rounded-3xl border shadow-2xl backdrop-blur border-white/10 bg-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Active peers
                </p>
                <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                  Team time snapshots
                  <span className="px-3 py-1 text-[10px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Auto-sync
                  </span>
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTableKey((key) => key + 1)}
                  className="inline-flex gap-2 items-center px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800/50 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Refresh
                </button>
                <button
                  onClick={() => setIsWeeklyViewOpen(true)}
                  className="inline-flex gap-2 items-center px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800/50 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                >
                  <ChartLine className="w-3.5 h-3.5" />
                  Schedule
                </button>
              </div>
            </div>
            <div className="rounded-2xl border shadow-lg border-white/10">
              <TimezoneTable key={tableKey} />
            </div>
          </section>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Capture teammate time"
        >
          <TimezoneForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>

        <WeeklyViewModal
          isOpen={isWeeklyViewOpen}
          onClose={() => setIsWeeklyViewOpen(false)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
