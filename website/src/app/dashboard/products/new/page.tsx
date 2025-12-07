'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Option, Variant, Image } from '@/types/product';
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function NewProductPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [basePrice, setBasePrice] = useState('');
  const [sku, setSku] = useState('');
    const [stock, setStock] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [images, setImages] = useState<Image[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
    useEffect(() => {
      const generateVariants = () => {
        if (options.length === 0) {
          setVariants([]);
          return;
        }
  
        const optionValues = options.map(opt => opt.values);
        const cartesian = (...a: string[][]): string[][] => a.reduce((acc, val) => acc.flatMap(d => val.map(e => [d, e].flat())));
        
        const newVariantCombinations = cartesian(...optionValues);
  
        const newVariants = newVariantCombinations.map(combination => {
          const optionMap: Record<string, string> = {};
          options.forEach((opt, i) => {
            optionMap[opt.name] = combination[i];
          });
  
          // Try to find existing variant to preserve its data
          const existingVariant = variants.find(v => {
            const vOptions = Object.entries(v.options).sort().toString();
            const newOptions = Object.entries(optionMap).sort().toString();
            return vOptions === newOptions;
          });
  
          return {
            options: optionMap,
            sku: existingVariant?.sku || '',
            price: existingVariant?.price || 0,
            stock: existingVariant?.stock || 0,
            images: existingVariant?.images || [],
          };
        });
  
        setVariants(newVariants);
      };
  
      generateVariants();
    }, [options]);
  
    const handleVariantChange = (index: number, field: 'sku' | 'price' | 'stock', value: string) => {
      const newVariants = [...variants];
      if (field === 'price' || field === 'stock') {
        newVariants[index][field] = parseInt(value, 10);
      } else {
        newVariants[index][field] = value;
      }
      setVariants(newVariants);
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
  
      const newProduct = {
        name,
        description,
        brand,
        category,
        tags,
        basePrice: parseFloat(basePrice),
        sku,
        stock: parseInt(stock, 10),
        options,
        variants,
        images,
      };
  
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newProduct),
        });
  
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to create product');
        }
  
        router.push('/dashboard');
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleOptionChange = (index: number, field: 'name' | 'values', value: string) => {
      const newOptions = [...options];
      if (field === 'values') {
        newOptions[index][field] = value.split(',').map(v => v.trim());
      } else {
        newOptions[index][field] = value;
      }
      setOptions(newOptions);
    };
  
    const addOption = () => {
      setOptions([...options, { name: '', values: [] }]);
    };
  
    const removeOption = (index: number) => {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    };
  
    return (
      <div className={`w-full max-w-4xl mx-auto p-8 ${inter.className}`}>
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input type="text" value={tags.join(', ')} onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
  
          {/* Pricing and Stock */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Pricing and Stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price</label>
                <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
  
          {/* Options */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Option Name (e.g., Size)"
                  value={option.name}
                  onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Values (e.g., S, M, L)"
                  value={option.values.join(', ')}
                  onChange={(e) => handleOptionChange(index, 'values', e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <button type="button" onClick={() => removeOption(index)} className="text-red-500">
                  <XCircle />
                </button>
              </div>
            ))}
            <button type="button" onClick={addOption} className="flex items-center gap-2 text-blue-600">
              <PlusCircle size={20} />
              <span>Add Option</span>
            </button>
          </div>
  
          {/* Variants */}
          {variants.length > 0 && (
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Variants</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      {options.map(opt => <th key={opt.name} className="p-2">{opt.name}</th>)}
                      <th className="p-2">Price</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={index} className="border-b">
                        {options.map(opt => <td key={opt.name} className="p-2">{variant.options[opt.name]}</td>)}
                        <td className="p-2">
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
  
          {error && <p className="text-red-500">{error}</p>}
  
          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center">
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <PlusCircle className="mr-2" />}
              Create Product
            </button>
          </div>
        </form>
      </div>
    );
  }
  

