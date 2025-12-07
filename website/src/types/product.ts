export interface Option {
  name: string;
  values: string[];
}

export interface Image {
  url: string;
  publicId: string;
}

export interface Variant {
  options: Record<string, string>;
  sku?: string;
  stock: number;
  price: number;
  images: Image[];
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  brand: string;
  category: string;
  tags: string[];
  basePrice: number;
  sku?: string;
  stock: number;
  options: Option[];
  variants: Variant[];
  images: Image[];
  vendor: string; // Assuming vendor is an ID string
  isActive: boolean;
  rating: number;
  reviews: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}
