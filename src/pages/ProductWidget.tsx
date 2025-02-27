import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Code2, Package, Search } from 'lucide-react';
import { createAutocomplete } from '@algolia/autocomplete-core';
import algoliasearch from 'algoliasearch';

interface Product {
  objectID: string;
  name: string;
  upc: string;
  productName: string;
}

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_API_KEY
);

const ProductWidget = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const baseUrl = import.meta.env.VITE_PRODUCT_WIDGET_URL?.replace(/\/+$/, '');
  const widgetUrl = `${baseUrl}?upc=${selectedProduct?.upc || ''}`;
  const [autocompleteState, setAutocompleteState] = useState<any>({
    collections: [],
    isOpen: false
  });
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const storageKey = `${import.meta.env.VITE_BRAND_NAME}_UPC`;

  // Load the saved UPC from localStorage on component mount
  useEffect(() => {
    const savedUpc = localStorage.getItem(storageKey);
    if (savedUpc && !selectedProduct) {
      // Fetch the product details from Algolia using the saved UPC
      searchClient
        .initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME)
        .search('', {
          filters: `upc:${savedUpc}`,
          hitsPerPage: 1,
          attributeForDistinct: 'upc'
        })
        .then((response) => {
          if (response.hits.length > 0) {
            const product = response.hits[0] as Product;
            setSelectedProduct(product);
            setInputValue(product.productName || product.name || '');
          }
        })
        .catch(error => {
          console.error('Error fetching product:', error);
        });
    }
  }, []);

  const autocomplete = useMemo(
    () =>
      createAutocomplete({
        onStateChange({ state }) {
          // Deduplicate the results by UPC before setting state
          if (state.collections && state.collections.length > 0 && state.collections[0].items.length > 0) {
            const items = state.collections[0].items as Product[];
            
            // Create a new state object with deduplicated items
            const newState = {
              ...state,
              collections: [
                {
                  ...state.collections[0],
                  items: items
                },
                ...state.collections.slice(1)
              ]
            };
            
            setAutocompleteState(newState);
          } else {
            setAutocompleteState(state);
          }
        },
        getSources() {
          return [
            {
              sourceId: 'products',
              getItems({ query }) {
                if (!query || query.trim().length === 0) {
                  return Promise.resolve([]);
                }
                
                console.log('Searching for:', query);
                
                return searchClient
                  .initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME)
                  .search(query, {
                    hitsPerPage: 30 // Increased to ensure we get enough results after deduplication
                  })
                  .then((response) => {
                    console.log('Search response:', response);
                    return response.hits as Product[];
                  })
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
    
    if (selectedProduct && value !== (selectedProduct.productName || selectedProduct.name)) {
      // Clear selected product if user changes the input
      setSelectedProduct(null);
    }
    
    autocomplete.setQuery(value);
    autocomplete.refresh();
  };

  const handleProductSelect = (item: Product) => {
    setSelectedProduct(item);
    setInputValue(item.productName || item.name || '');
    autocomplete.setIsOpen(false);
    // Save the selected UPC to localStorage
    localStorage.setItem(storageKey, item.upc);
  };

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="100%"
  height="800"
  style="border: none;"
  title="Product Widget"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
></iframe>`;

  return (
    <div className="w-full h-[calc(100vh-64px)] p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
        <div className="w-full lg:w-[40%] bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Product Widget</h2>
          </div>
          <p className="text-gray-600 mb-4">
            This is the product widget. It provides access 
            to all the retail locations that sell that 
            specific product, via either a url or iframe
            code.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Key Features</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Real-time product updates</li>
              <li>Interactive product viewer</li>
              <li>Customizable styling</li>
              <li>Mobile-responsive design</li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-[60%] bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold">Embed Code</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
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
                    onFocus={() => {
                      if (inputValue.trim()) {
                        autocomplete.setIsOpen(true);
                      }
                    }}
                    placeholder="Search for a product..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {autocompleteState.isOpen && autocompleteState.collections?.[0]?.items?.length > 0 && (
                  <div
                    ref={panelRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-y-auto"
                  >
                    {autocompleteState.collections[0].items.map((item: Product) => (
                      <button
                        key={item.objectID}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleProductSelect(item)}
                      >
                        <div className="font-medium">{item.productName || item.name || 'Unknown Product'}</div>
                        <div className="text-sm text-gray-500">UPC: {item.upc || 'N/A'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>

          {selectedProduct ? (
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
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600">Please select a product to view the embed code.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        {selectedProduct ? (
          <>
            <div className="text-sm text-gray-600 mb-2">
              Widget URL: {widgetUrl} 
              &nbsp;<a href={widgetUrl} target="_blank" rel="noopener noreferrer"><b>(Open)</b></a>
            </div>
            <div className="w-full">
              <iframe
                src={widgetUrl}
                width="100%"
                height="800"
                style={{ border: 'none' }}
                className="rounded-lg"
                title="Product Widget"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Start by selecting a product above to preview the widget.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductWidget;