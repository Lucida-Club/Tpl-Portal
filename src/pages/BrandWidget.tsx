import React, { useState, useRef, useMemo } from 'react';
import { Code2, Briefcase, Search } from 'lucide-react';
import { createAutocomplete } from '@algolia/autocomplete-core';
import algoliasearch from 'algoliasearch';

interface Retailer {
  objectID: string;
  retailerName: string;
  retailerId: string;
  storeName: string;
}

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_API_KEY
);

const BrandWidget = () => {
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const baseUrl = import.meta.env.VITE_BRAND_WIDGET_URL?.replace(/\/+$/, '');
  const widgetUrl = `${baseUrl}${selectedRetailer?.retailerId ? `?retailerId=${selectedRetailer.retailerId}` : ''}`;
  const [autocompleteState, setAutocompleteState] = useState<any>({
    collections: [],
    isOpen: false
  });
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const autocomplete = useMemo(
    () =>
      createAutocomplete({
        onStateChange({ state }) {
          setAutocompleteState(state);
        },
        getSources() {
          return [
            {
              sourceId: 'retailers',
              getItems({ query }) {
                if (!query || query.trim().length === 0) {
                  return Promise.resolve([]);
                }
                
                return searchClient
                  .initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME + '-retailers')
                  .search(query, {
                    hitsPerPage: 10
                  })
                  .then((response) => response.hits as Retailer[])
                  .catch(error => {
                    console.error('Algolia search error:', error);
                    return [];
                  });
              },
            },
          ];
        },
      }),
    []
  );

  const { onSubmit, onReset, onKeyDown } = autocomplete.getFormProps({
    inputElement: inputRef.current,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    if (selectedRetailer && value !== selectedRetailer.retailerName) {
      setSelectedRetailer(null);
    }
    
    autocomplete.setQuery(value);
    if (value.trim()) {
      autocomplete.setIsOpen(true);
    }
    autocomplete.refresh();
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      autocomplete.setQuery(inputValue);
      autocomplete.setIsOpen(true);
      autocomplete.refresh();
    }
  };

  const handleRetailerSelect = (item: Retailer) => {
    setSelectedRetailer(item);
    setInputValue(item.retailerName);
    autocomplete.setIsOpen(false);
  };

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="600"
  style="border: none;"
  title="Brand Widget"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
></iframe>`;

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 space-y-4">
      <div className="flex gap-4 max-w-6xl mx-auto">
        <div className="w-[40%] bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Brand Widget</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            This is the brand widget. It provides access 
            to all the products for the brand in a single 
            UI that can be used via a iframe or stand alone
            url.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Key Features</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Embeddable Code</li>
              <li>Standalone URL</li>
              <li>Dynamic Search</li>
              <li>Full Checkout</li>
            </ul>
          </div>
        </div>

        <div className="w-[60%] bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Embed Code</h2>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Retailer (Optional)
            </label>
            <div className="relative">
              <form 
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit(e);
                }}
                onReset={onReset}
                onKeyDown={onKeyDown}
                className="relative"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Search for a retailer..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {autocompleteState.isOpen && autocompleteState.collections?.[0]?.items?.length > 0 && (
                  <div
                    ref={panelRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-y-auto"
                  >
                    {autocompleteState.collections[0].items.map((item: Retailer) => (
                      <button
                        key={item.objectID}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleRetailerSelect(item)}
                      >
                        <div className="font-medium">{item.storeName || 'Unknown Store'}</div>
                        <div className="text-sm text-gray-500">Store ID: {item.retailerId || 'N/A'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
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
          Widget URL: {widgetUrl} &nbsp;<a href={widgetUrl} target="_blank"><b>(Open)</b></a>
        </div>
        <div className="w-full">
          <iframe
            src={widgetUrl}
            width="100%"
            height="600"
            style={{ border: 'none' }}
            className="rounded-lg"
            title="Brand Widget"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

export default BrandWidget;