import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TimezoneTable from './components/features/TimezoneTable';
import { useState } from 'react';
import Modal from './components/ui/Modal';
import TimezoneForm from './components/features/TimezoneForm';
import { Plus } from 'lucide-react';
import LocationDetector from './components/features/LocationDetector';

const queryClient = new QueryClient();

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Timezone Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Timezone
            </button>
          </div>

          <LocationDetector />

          <div className="bg-white rounded-lg shadow p-6">
            <TimezoneTable />
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Timezone">
            <TimezoneForm onSuccess={() => setIsModalOpen(false)} />
          </Modal>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
