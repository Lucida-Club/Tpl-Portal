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
  const [autocompleteState, setAutocompleteState] = useState({});
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
          hitsPerPage: 1
        })
        .then((response) => {
          if (response.hits.length > 0) {
            setSelectedProduct(response.hits[0] as Product);
          }
        });
    }
  }, []);

  const autocomplete = useMemo(
    () =>
      createAutocomplete({
        onStateChange({ state }) {
          setAutocompleteState(state);
        },
        getSources() {
          return [
            {
              sourceId: 'products',
              getItems({ query }) {
                return searchClient
                  .initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME)
                  .search(query, {
                    hitsPerPage: 15
                  })
                  .then((response) => response.hits as Product[]);
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

  const { onFocus, onBlur, onChange } = autocomplete.getInputProps({
    inputElement: inputRef.current,
  });

  const handleProductSelect = (item: Product) => {
    setSelectedProduct(item);
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
      <div className="flex gap-4 max-w-6xl mx-auto">
        <div className="w-[40%] bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Product Widget</h2>
          </div>
          <p className="text-gray-600 mb-4">
            A customizable widget that showcases your products with rich interactive features. Perfect for embedding in e-commerce platforms, marketplaces, and product landing pages.
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

        <div className="w-[60%] bg-white p-4 rounded-lg shadow-lg">
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
                onSubmit={onSubmit}
                onReset={onReset}
                onKeyDown={onKeyDown}
                className="relative"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={onChange}
                    value={selectedProduct ? (selectedProduct.productName || selectedProduct.name) : ''}
                    placeholder="Search for a product..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {autocompleteState.isOpen && (
                  <div
                    ref={panelRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1"
                  >
                    {(autocompleteState as any).collections?.[0]?.items?.map((item: Product) => (
                      <button
                        key={item.objectID}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => handleProductSelect(item)}
                      >
                        <div className="font-medium">{item.productName || item.name}</div>
                        <div className="text-sm text-gray-500">UPC: {item.upc}</div>
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