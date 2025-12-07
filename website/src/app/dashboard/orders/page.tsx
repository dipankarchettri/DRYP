'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Inter } from 'next/font/google';
import { Loader2, AlertCircle } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function OrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!token || user?.role !== 'vendor') {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/vendor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-red-50 border-dashed border-2 border-red-200 rounded-lg">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="mt-4 text-xl font-semibold text-red-600">Failed to load orders</h2>
        <p className="mt-2 text-red-500">{error || 'An unknown error occurred.'}</p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto p-8 ${inter.className}`}>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-black">Your Orders</h1>
      </div>
      
      {orders.length === 0 ? (
        <p className="text-center text-zinc-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 border border-zinc-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-zinc-900">Order #{order.orderNumber}</h2>
                <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-sm font-medium text-zinc-600">Customer: {order.user ? order.user.name : 'Guest User'}</p>
                {order.user?.email && <p className="text-sm text-zinc-500">{order.user.email}</p>}
              </div>
              <div className="mt-4">
                <h3 className="text-md font-semibold text-zinc-800 mb-2">Items:</h3>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.product?._id || Math.random()} className="flex justify-between items-center">
                      <span>{item.product?.name || 'Product not found'} (x{item.quantity})</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-zinc-100 mt-4 pt-4 flex justify-between items-center">
                <p className="font-semibold text-zinc-800">Total:</p>
                <p className="font-bold text-lg text-zinc-900">${order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="mt-4">
                <p className={`text-sm font-bold uppercase ${
                  order.status === 'delivered' ? 'text-green-600' :
                  order.status === 'shipped' ? 'text-blue-600' :
                  order.status === 'processing' ? 'text-orange-600' :
                  'text-zinc-500'
                }`}>{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}