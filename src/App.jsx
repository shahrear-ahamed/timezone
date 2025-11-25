import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Clock3, Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import TimezoneForm from "./components/features/TimezoneForm";
import TimezoneTable from "./components/features/TimezoneTable";
import Modal from "./components/ui/Modal";

const queryClient = new QueryClient();

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex flex-col gap-10 px-4 py-10 mx-auto w-full max-w-6xl sm:px-6 lg:px-10">
          <header className="p-8 space-y-6 rounded-3xl border shadow-2xl bg-linear-to-br border-white/10 from-slate-900 via-slate-950 to-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                  className="inline-flex gap-2 items-center px-5 py-3 text-sm font-semibold text-white bg-violet-500 rounded-2xl shadow-lg transition shadow-violet-500/30 hover:bg-violet-400"
                >
                  <Plus className="w-4 h-4" />
                  Add timezone entry
                </button>
                <button
                  onClick={() => setTableKey((key) => key + 1)}
                  className="inline-flex gap-2 items-center px-5 py-3 text-sm font-semibold text-white rounded-2xl border transition border-white/20 hover:bg-white/10"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh list
                </button>
              </div>
            </div>
          </header>

          <section className="p-6 rounded-3xl border shadow-2xl backdrop-blur border-white/10 bg-white/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Active peers
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Team time snapshots
                </h2>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-slate-900/70 text-slate-300">
                Auto-sync
              </span>
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
      </div>
    </QueryClientProvider>
  );
}

export default App;
