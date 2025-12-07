'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Building2, Phone, Globe, Mail, MapPin, Edit3, Camera, X, Save, UploadCloud } from 'lucide-react';
import { Inter } from 'next/font/google';

// --- FONTS ---
const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter'
});

// --- TYPE DEFINITION ---
interface Vendor {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  // Added image fields (optional)
  bannerUrl?: string; 
  avatarUrl?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

const StoreProfilePage = () => {
  const { token } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Vendor | null>(null);

  // --- IMAGE UPLOAD STATE ---
  // We use separate state for previews so the UI updates instantly before saving
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Refs to trigger hidden file inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Default Placeholders
  const DEFAULT_BANNER = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"; 
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&q=80"; 

  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!token) return;

      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/vendors/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setVendor(data);
          setFormData(data);
          // Set initial previews from backend data
          setBannerPreview(data.bannerUrl || DEFAULT_BANNER);
          setAvatarPreview(data.avatarUrl || DEFAULT_AVATAR);
        } else {
          throw new Error(data.message || 'Failed to fetch vendor profile');
        }
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) setError(err.message);
        else setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, [token]);

  // --- IMAGE SELECTION HANDLER ---
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Create a local preview URL immediately
    const objectUrl = URL.createObjectURL(file);
    
    if (type === 'banner') {
        setBannerPreview(objectUrl);
    } else {
        setAvatarPreview(objectUrl);
    }

    // 2. TODO: UPLOAD LOGIC
    // In a real app, you would upload this file to your server/S3 here.
    // For now, we will simulate an upload delay.
    setIsUploading(true);
    
    try {
        // const formData = new FormData();
        // formData.append('file', file);
        // const res = await fetch('/api/upload', { method: 'POST', body: formData ... });
        // const data = await res.json();
        // const uploadedUrl = data.url;

        // SIMULATION: Just using the local object URL as the "uploaded" URL for now
        // Replace this line with actual API response URL
        const uploadedUrl = objectUrl; 

        // Update the form data so it gets saved when user clicks "Save" later? 
        // Or usually image uploads autosave. Let's assume autosave for images:
        
        // Update local vendor state instantly
        if (vendor) {
            const updatedVendor = { ...vendor, [type === 'banner' ? 'bannerUrl' : 'avatarUrl']: uploadedUrl };
            setVendor(updatedVendor);
            // Optionally call API to save the URL to the vendor profile immediately
        }

    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image");
    } finally {
        setIsUploading(false);
    }
  };

  // --- HANDLE INPUT CHANGE ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
        const field = name.split('.')[1] as keyof typeof formData.address;
        setFormData({
            ...formData,
            address: { ...formData.address, [field]: value }
        });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  // --- HANDLE SAVE ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData) return;

    setIsSaving(true);
    try {
        const response = await fetch('/api/vendors/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            setVendor(data); 
            setIsEditing(false);
        } else {
            alert(data.message || "Failed to update profile");
        }
    } catch (err: unknown) {
        console.error(err);
        alert("An error occurred while saving.");
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-300" /></div>;

  if (error && !vendor) return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-800 border border-red-100">
            <p className="font-medium">Unable to load profile</p>
            <p className="text-sm mt-1 opacity-80">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-red-900 shadow-sm hover:bg-red-50 border border-red-100">Retry</button>
        </div>
      </div>
  );

  if (!vendor) return <p className="text-center text-zinc-500 mt-20">No profile found.</p>;

  return (
    <div className={`w-full max-w-5xl mx-auto pb-20 ${inter.className}`}>
      
      {/* --- HIDDEN INPUTS FOR IMAGE UPLOAD --- */}
      <input 
        type="file" 
        ref={bannerInputRef} 
        onChange={(e) => handleImageSelect(e, 'banner')} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={(e) => handleImageSelect(e, 'avatar')} 
        className="hidden" 
        accept="image/*"
      />

      {/* --- VISUAL HEADER --- */}
      <div className="relative mb-8">
        
        {/* Banner Image Container */}
        <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-zinc-900 group">
            <Image 
                src={bannerPreview || DEFAULT_BANNER}
                alt="Store Banner"
                fill
                unoptimized
                className="object-cover transition-opacity duration-300 group-hover:opacity-90"
            />
            {/* Darker Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Banner Camera Button (Functional) */}
            <button 
                onClick={() => bannerInputRef.current?.click()}
                className="absolute right-6 top-6 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/50 hover:scale-105"
                title="Change Banner Image"
            >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>

            {/* Profile Content */}
            <div className="absolute bottom-6 left-8 flex items-end gap-6 z-10">
                {/* Avatar with functional upload */}
                <div className="relative h-28 w-28 rounded-full border-[5px] border-white shadow-xl group/avatar cursor-pointer">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-100">
                        <Image 
                            src={avatarPreview || DEFAULT_AVATAR}
                            alt="Vendor Avatar"
                            fill
                            unoptimized
                            className="object-cover"
                        />
                        {/* Avatar Overlay on Hover */}
                        <div 
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/avatar:opacity-100"
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
                
                {/* Text Info */}
                <div className="mb-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">{vendor.name}</h1>
                    <p className="text-base font-medium text-zinc-200">@{vendor.name.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
            </div>
        </div>

        {/* Edit Profile Button */}
        <div className="flex justify-end mt-4">
             <button 
                onClick={() => setIsEditing(true)}
                className="group flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:border-black hover:bg-black hover:text-white hover:shadow-lg"
             >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-black flex items-center gap-2 border-b border-zinc-100 pb-4">
                <Building2 className="h-5 w-5 text-zinc-400" />
                About the Store
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Description</label>
                    <p className="text-base text-zinc-700 leading-relaxed">
                        {vendor.description || "No description provided yet. Add a bio to tell customers about your brand."}
                    </p>
                </div>
            </div>
          </div>

           <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-black flex items-center gap-2 border-b border-zinc-100 pb-4">
                <MapPin className="h-5 w-5 text-zinc-400" />
                Location
            </h2>
            {vendor.address ? (
                <div className="flex flex-col gap-1 text-base text-zinc-800 font-medium">
                    <span>{vendor.address.line1}</span>
                    <span className="text-zinc-500 font-normal">
                        {vendor.address.city}, {vendor.address.state} {vendor.address.pincode}
                    </span>
                </div>
            ) : (
                <p className="text-sm text-zinc-400 italic">No address configured.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACT */}
        <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6">
                <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2">Contact Information</h2>
                <div className="space-y-5">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                            <Mail className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email</span>
                            <p className="text-sm font-semibold text-zinc-900 break-all">{vendor.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                            <Phone className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Phone</span>
                            <p className="text-sm font-semibold text-zinc-900">{vendor.phone || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                            <Globe className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Website</span>
                            <div className="mt-0.5">
                                {vendor.website ? (
                                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors">
                                        {vendor.website.replace(/^https?:\/\//, '')}
                                    </a>
                                ) : (
                                    <p className="text-sm text-zinc-400">N/A</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditing && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-black">Edit Store Profile</h2>
                    <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                        <X className="h-5 w-5 text-zinc-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="edit-profile-form" onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Store Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-2 text-sm font-semibold text-black focus:border-black focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 focus:border-black focus:outline-none transition-all resize-none h-24" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Phone</label>
                                <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-2 text-sm text-zinc-800 focus:border-black focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Website</label>
                                <input name="website" value={formData.website || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-2 text-sm text-zinc-800 focus:border-black focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-black mb-4">Address</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <input name="address.line1" value={formData.address?.line1 || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-base text-zinc-800 focus:border-black focus:outline-none" placeholder="Street Address" />
                                </div>
                                <div>
                                    <input name="address.city" value={formData.address?.city || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-base text-zinc-800 focus:border-black focus:outline-none" placeholder="City" />
                                </div>
                                <div>
                                    <input name="address.state" value={formData.address?.state || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-base text-zinc-800 focus:border-black focus:outline-none" placeholder="State" />
                                </div>
                                <div>
                                    <input name="address.pincode" value={formData.address?.pincode || ''} onChange={handleChange} className="w-full border-b-2 border-zinc-200 bg-transparent py-3 text-base text-zinc-800 focus:border-black focus:outline-none" placeholder="Zip Code" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-zinc-50 border-t border-zinc-100">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-black transition-colors">Cancel</button>
                    <button type="submit" form="edit-profile-form" disabled={isSaving} className="flex items-center gap-2 rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StoreProfilePage;