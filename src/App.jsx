import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import TimezoneForm from "./components/features/TimezoneForm";
import TimezoneTable from "./components/features/TimezoneTable";
import Modal from "./components/ui/Modal";

const queryClient = new QueryClient();

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8 min-h-screen bg-gray-50">
        <div className="mx-auto space-y-6 max-w-5xl">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Timezone Management
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 w-4 h-4" />
              Add Timezone
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <TimezoneTable />
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add New Timezone"
          >
            <TimezoneForm onSuccess={() => setIsModalOpen(false)} />
          </Modal>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
