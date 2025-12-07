'use client';

import { Product } from '@/types/Product';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ProductForm from '@/components/ProductForm';
import { useAuth } from '@/contexts/AuthContext';
import ProductModal from '@/components/ProductModal';
import { Loader2, Plus, Edit2, Trash2, Package, ImageIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Inter } from 'next/font/google';

// --- FONTS ---
const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter'
});

interface ProductFormHandle {
  submit: () => void;
  clearForm: () => void;
  isSubmitting: boolean;
}

// --- SUB-COMPONENT: HANDLES INDIVIDUAL CARD IMAGES & ERRORS ---
const ProductCard = ({ product, handleEdit, handleDelete }: { 
    product: Product, 
    handleEdit: (p: Product) => void, 
    handleDelete: (id: string) => void 
}) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imgError, setImgError] = useState(false);

    // Filter out invalid/empty image strings immediately
    const validImages = (product.images || []).map(img => img.url).filter(url => url && url.length > 0);
    const hasImages = validImages.length > 0 && !imgError;
    const currentSrc = hasImages ? validImages[currentImgIndex] : null;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % validImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-lg hover:-translate-y-1">

            {/* --- IMAGE SLIDER SECTION --- */}
            <div className="relative w-full aspect-[4/3] bg-zinc-50 overflow-hidden border-b border-zinc-100">
                {hasImages && currentSrc ? (
                    <>
                        <Image
                            src={currentSrc}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => setImgError(true)} // If 404, switch to placeholder
                        />

                        {/* Arrows - Only show if > 1 valid image */}
                        {validImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>

                                {/* Counter Badge */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm pointer-events-none z-10">
                                    <ImageIcon className="h-3 w-3" />
                                    <span>{currentImgIndex + 1}/{validImages.length}</span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    // Fallback Placeholder
                    <div className="flex flex-col h-full w-full items-center justify-center text-zinc-400 gap-3 border-2 border-dashed border-zinc-200 rounded-lg mx-4 my-6">
                        {imgError ? (
                            <>
                                <AlertCircle className="h-10 w-10 text-red-400" />
                                <span className="text-sm text-red-400 font-medium">Image Missing</span>
                            </>
                        ) : (
                            <>
                                <Package className="h-12 w-12" />
                                <span className="text-sm text-zinc-500 font-medium">No Image</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* DETAILS SECTION */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-black line-clamp-1">{product.name}</h3>
                        <p className="text-lg font-bold text-black">${product.basePrice.toFixed(2)}</p>
                </div>

                {/* VARIANTS */}
                {product.variants && product.variants.length > 0 && (
                    <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {product.variants.length} Variants
                            </p>
                            <div className="flex flex-wrap gap-1">
                            {product.variants.slice(0, 3).map((v, i) => (
                                <span key={i} className="inline-block rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm font-semibold text-zinc-600">
                                    {Object.values(v.options || {}).join(' / ')}
                                </span>
                            ))}
                            {product.variants.length > 3 && (
                                <span className="inline-block px-1 text-sm text-zinc-400">...</span>
                            )}
                            </div>
                    </div>
                )}
                
                {/* ACTIONS */}
                <div className="mt-6 flex items-center gap-3 border-t border-zinc-100 pt-4">
                    <button
                        onClick={() => handleEdit(product)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white py-2 text-xs font-bold uppercase tracking-wide text-zinc-900 transition-colors hover:bg-zinc-50 hover:border-zinc-300"
                    >
                        <Edit2 className="h-3 w-3" />
                        Edit
                    </button>
                    <button
                        onClick={() => product._id && handleDelete(product._id)}
                        disabled={!product._id}
                        className="flex items-center justify-center rounded-md border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                        title="Delete Product"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductsPage = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const formRef = useRef<ProductFormHandle>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/products?vendor=${user._id}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          fetchProducts();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchProducts();
  }, [user, fetchProducts]);

  const handleSaveSuccess = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    if (formRef.current) {
      formRef.current.clearForm();
    }
    fetchProducts();
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const isSubmitting = formRef.current?.isSubmitting || false;

  return (
    <div className={`w-full max-w-7xl mx-auto p-8 ${inter.className}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black">My Products</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">Manage your inventory and pricing.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        title={editingProduct ? "Edit Product" : "Add a New Product"}
        product={editingProduct || undefined}
        isSubmitting={isSubmitting}
      >
        <ProductForm ref={formRef} onSave={handleSaveSuccess} />
      </ProductModal>

      {/* CONTENT AREA */}
      <div>
        {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              // Use the new Sub-Component to isolate image logic
              <ProductCard 
                key={product._id || index} 
                product={product} 
                handleEdit={handleEdit} 
                handleDelete={handleDelete} 
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white shadow-sm py-20 px-8 text-center">
            <div className="rounded-full bg-zinc-100 p-6 mb-6">
                <Package className="h-12 w-12 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-3">No products found</h3>
            <p className="text-zinc-600 text-base max-w-md leading-relaxed">
                Your inventory is currently empty. Add your first product to start selling on DRYP and reach new customers.
            </p>
            <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 rounded-full bg-black px-8 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-all hover:shadow-lg"
            >
                Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;