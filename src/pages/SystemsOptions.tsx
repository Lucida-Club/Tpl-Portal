import { useState } from 'react';
import { Code2, Briefcase } from 'lucide-react';

interface PanelResult {
  message?: string;
  recordsIndexed?: number;
}

const SystemsOptions = () => {
  const [results, setResults] = useState<{[key: string]: PanelResult}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});

  const panels = [
    {
      title: "Product Indexing",
      description: "Update the Algolia product index with latest data",
      endpoint: `${import.meta.env.VITE_PORTAL_URL}.netlify/functions/algolia`,
      id: "products"
    },
    {
      title: "Retailer Indexing",
      description: "Update the Algolia retailer index with latest data",
      endpoint: `${import.meta.env.VITE_PORTAL_URL}.netlify/functions/algolia-retailers`,
      id: "retailers"
    },
    {
      title: "Geocoding Update",
      description: "Update location data for retailers",
      endpoint: `${import.meta.env.VITE_PORTAL_URL}.netlify/functions/geocode`,
      id: "geocode"
    }
  ];

  const handleRunFunction = async (endpoint: string, id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults(prev => ({ ...prev, [id]: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, [id]: { message: 'Error occurred' + error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 space-y-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">System Operations</h2>
          </div>
          <div className="space-y-4">
            {panels.map((panel) => (
              <div key={panel.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{panel.title}</h2>
                    <p className="text-gray-600">{panel.description}</p>
                  </div>
                  <button
                    onClick={() => handleRunFunction(panel.endpoint, panel.id)}
                    disabled={loading[panel.id]}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300 ml-4"
                  >
                    {loading[panel.id] ? 'Running...' : 'Run'}
                  </button>
                </div>
                {results[panel.id] && (
                  <div className="mt-4 p-2 bg-white rounded">
                    <pre className="text-sm">
                      {JSON.stringify(results[panel.id], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemsOptions;