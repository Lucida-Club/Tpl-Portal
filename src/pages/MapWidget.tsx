import React from 'react';
import { Code2, Briefcase } from 'lucide-react';

const MapWidget = () => {
  const widgetUrl = import.meta.env.VITE_MAP_WIDGET_URL?.replace(/\/+$/, '');

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="600"
  style="border: none;"
  title="Map Widget"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
></iframe>`;

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 space-y-4">
      <div className="flex gap-4 max-w-6xl mx-auto">
        <div className="w-[40%] bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Map Widget</h2>
          </div>
          <p className="text-gray-600 mb-4">
            This is the Map widget. It provides access 
            all the retailers that supply your products.
            When a customer clicks on a retailer, they
            will be taken to the brand widget.
          </p>
        </div>

        <div className="w-[60%] bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Embed Code</h2>
          </div>
          <div className="relative">
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{iframeCode}</code>
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(iframeCode)}
              className="absolute top-2 right-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <div className="text-sm text-gray-600 mb-2">
          Map Widget URL: {widgetUrl} &nbsp;<a href={widgetUrl} target="_blank"><b>(Open)</b></a>
        </div>
        <div className="w-full">
          <iframe
            src={widgetUrl}
            width="100%"
            height="600"
            style={{ border: 'none' }}
            className="rounded-lg"
            title="Map Widget"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default MapWidget;