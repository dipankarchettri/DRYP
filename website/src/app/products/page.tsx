'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/Product';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products - assuming an endpoint like /api/products/all
        // You might need to adjust this endpoint based on your backend implementation
        const response = await fetch('/api/products/all');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">All Products</h1>

      {loading ? (
        <p className="text-lg text-gray-600">Loading products...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              {product.images && product.images.length > 0 && (
                <div className="relative w-full h-64 mb-6">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{product.name}</h3>
              <p className="text-xl text-gray-900 font-bold mt-4">${product.basePrice.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-600">No products found.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
