'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types/order';
import { Loader2, TrendingUp, Package, Users, PlusCircle, ArrowUpRight, ShoppingCart, DollarSign } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Reusable Components ---

const StatCard = ({ title, value, icon, formatAsCurrency = false }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-bold uppercase text-zinc-500">{title}</p>
      <div className="rounded-full bg-zinc-100 p-3">
        {icon}
      </div>
    </div>
    <p className="text-3xl font-extrabold text-black">
      {formatAsCurrency ? `$${(value || 0).toFixed(2)}` : (value || 0)}
    </p>
  </div>
);

const RecentOrderItem = ({ order }) => (
  <div className="flex items-center justify-between py-3 hover:bg-zinc-50 rounded-lg px-2 -mx-2">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
        <ShoppingCart size={18} className="text-zinc-500" />
      </div>
      <div>
        <p className="font-semibold text-black">Order #{order.orderNumber}</p>
        <p className="text-sm text-zinc-500">{order.user?.name || 'Guest User'}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-black">${order.totalAmount.toFixed(2)}</p>
      <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
    </div>
  </div>
);

const TopProductItem = ({ product, index }) => (
  <div className="flex items-center justify-between py-3 hover:bg-zinc-50 rounded-lg px-2 -mx-2">
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-zinc-400">{index + 1}</span>
      <p className="font-semibold text-black">{product.name}</p>
    </div>
    <p className="text-sm font-bold text-zinc-600">{product.totalQuantity || 0} sold</p>
  </div>
);


export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || user?.role !== 'vendor') {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics/vendor`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/orders/vendor?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
      if (!ordersRes.ok) throw new Error('Failed to fetch recent orders');
      
      const analyticsData = await analyticsRes.json();
      const ordersData = await ordersRes.json();

      setAnalytics(analyticsData);
      setRecentOrders(Array.isArray(ordersData) ? ordersData : []);

    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, user, API_BASE_URL]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchData();
      }
    }
  }, [authLoading, isAuthenticated, router, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto ${inter.className}`}>
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black">Dashboard</h1>
          <p className="mt-2 text-lg font-medium text-zinc-600">
            Welcome back, {user?.name || 'Vendor'}. Here's what's happening with your store today.
          </p>
        </div>

      </div>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Revenue" value={analytics?.summary?.totalRevenue} icon={<DollarSign className="h-5 w-5 text-green-600" />} formatAsCurrency />
        <StatCard title="Total Orders" value={analytics?.summary?.totalOrders} icon={<ShoppingCart className="h-5 w-5 text-blue-600" />} />
        <StatCard title="Total Products" value={analytics?.summary?.totalProducts} icon={<Package className="h-5 w-5 text-purple-600" />} />
      </div>
      
      {/* RECENT ACTIVITY & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* RECENT ORDERS */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => <RecentOrderItem key={order._id} order={order} />)
            ) : (
              <p className="text-center py-10 text-zinc-500">No recent orders found.</p>
            )}
          </div>
        </div>

        {/* TOP SELLING PRODUCTS */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Top Selling Products</h2>
            <Link href="/dashboard/analytics" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              View Analytics <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {analytics?.topSoldProducts?.length > 0 ? (
              analytics.topSoldProducts.map((product, index) => <TopProductItem key={product._id} product={product} index={index} />)
            ) : (
              <p className="text-center py-10 text-zinc-500">Not enough sales data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 