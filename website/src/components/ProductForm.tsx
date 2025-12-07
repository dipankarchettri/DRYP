'use client';

import React, {
  useState,
  useImperativeHandle,
  useEffect,
  ChangeEvent,
} from 'react';
import type { Product, Variant } from '@/types/Product';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { X, Plus, UploadCloud, Loader2 } from 'lucide-react';
import { Inter } from 'next/font/google';

// Assumed component exists based on your code
import ImageCropper from './ImageCropper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// --- FONTS ---
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

// --- TYPES ---
interface VariantState {
  color: string;
  sizes: string;
  price: string;
  stock: Record<string, string>;
  images: { url: string, publicId: string }[];
}

interface ProductFormProps {
  onSave: () => void;
  product?: Product;
}

export interface ProductFormHandle {
  submit: () => void;
  clearForm: () => void;
  isSubmitting: boolean;
}

interface InputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

// --- REUSABLE COMPONENTS ---
const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
}) => (
  <div className="w-full">
    <label
      htmlFor={name}
      className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2.5"
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all disabled:opacity-60"
      placeholder={placeholder}
    />
  </div>
);

const TextArea: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => (
  <div className="w-full">
    <label
      htmlFor={name}
      className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-2.5"
    >
      {label}
    </label>
    <textarea
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      rows={5}
      disabled={disabled}
      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none disabled:opacity-60"
      placeholder={placeholder}
    />
  </div>
);

const ProductForm = React.forwardRef<ProductFormHandle, ProductFormProps>(
  ({ onSave, product }, ref) => {
    const { token } = useAuth();

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      brand: '',
      category: '',
      tags: '',
      basePrice: '',
    });

    const [variants, setVariants] = useState<VariantState[]>([
      { color: '', sizes: '', price: '', stock: {}, images: [] },
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [croppingImage, setCroppingImage] = useState<{
      variantIndex: number;
      image: string;
    } | null>(null);

    // No longer need unused croppedImage state
    // const [croppedImage, setCroppedImage] = useState<{
    //   variantIndex: number;
    //   file: File;
    // } | null>(null);

    const resetForm = () => {
      setFormData({
        name: '',
        description: '',
        brand: '',
        category: '',
        tags: '',
        basePrice: '',
      });
      setVariants([
        { color: '', sizes: '', price: '', stock: {}, images: [] },
      ]);
    };

    const handleProductChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (
      index: number,
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = e.target;
      const newVariants = [...variants];
      const variant = newVariants[index];

      if (name === 'color') {
        variant.color = value;
      } else if (name === 'sizes') {
        variant.sizes = value;
        const sizesArray = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const newStock: Record<string, string> = {};
        sizesArray.forEach((size) => {
          newStock[size] = variant.stock[size] || '0';
        });
        variant.stock = newStock;
      } else if (name === 'price') {
        variant.price = value;
      }

      setVariants(newVariants);
    };

    const handleStockChange = (
      variantIndex: number,
      size: string,
      value: string
    ) => {
      const newVariants = [...variants];
      newVariants[variantIndex].stock[size] = value;
      setVariants(newVariants);
    };

    const handleImageSelect = async (
      variantIndex: number,
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            if (img.width > 736 || img.height > 981) {
              setCroppingImage({
                variantIndex,
                image: reader.result as string,
              });
            } else {
              uploadImage(variantIndex, file);
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
      if (!croppingImage) return;
      
      const { variantIndex } = croppingImage;
      try {
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });

        await uploadImage(variantIndex, file);
      } catch (error) {
        console.error('Error processing cropped image:', error);
        alert('Failed to process cropped image');
      } finally {
        setCroppingImage(null);
      }
    };

    const uploadImage = async (
      variantIndex: number,
      imageFile: File
    ) => {
      if (!token) {
        alert('Authentication required');
        return;
      }

      setIsUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageFile);

      try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formDataUpload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.url && data.publicId) {
          const newVariants = [...variants];
          newVariants[variantIndex].images.push({ url: data.url, publicId: data.publicId });
          setVariants(newVariants);
        } else {
          throw new Error(data.message || 'Image upload failed');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Error uploading image: ${message}`);
      } finally {
        setIsUploading(false);
      }
    };

    const handleRemoveImage = (variantIndex: number, imageIndex: number) => {
      const newVariants = [...variants];
      newVariants[variantIndex].images.splice(imageIndex, 1);
      setVariants(newVariants);
    };

    const addVariant = () => {
      setVariants([
        ...variants,
        { color: '', sizes: '', price: '', stock: {}, images: [] },
      ]);
    };

    const removeVariant = (index: number) => {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      setIsSubmitting(true);

      const allVariantImages = variants.flatMap((v) => v.images);

      interface ProductData {
        name: string;
        description: string;
        brand: string;
        category: string;
        tags: string[];
        basePrice: number;
        images: { url: string, publicId: string }[];
        options: { name: string; values: string[] }[];
        variants: {
          options: { Color: string; Size: string };
          stock: number;
          price: number;
          images: { url: string, publicId: string }[];
        }[];
      }

      const productData: ProductData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: allVariantImages,
        options: [],
        variants: [],
      };

      const allColors = variants
        .map((v) => v.color)
        .filter((c) => Boolean(c));
      const allSizes = [
        ...new Set(
          variants.flatMap((v) =>
            v.sizes
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          )
        ),
      ];

      if (allColors.length > 0) {
        productData.options.push({ name: 'Color', values: allColors });
      }
      if (allSizes.length > 0) {
        productData.options.push({ name: 'Size', values: allSizes });
      }

      variants.forEach((variant) => {
        const sizes = variant.sizes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        sizes.forEach((size) => {
          const newVariantPayload = {
            options: { Color: variant.color, Size: size },
            stock: parseInt(variant.stock[size] || '0', 10) || 0,
            price: parseFloat(variant.price || formData.basePrice) || 0,
            images: variant.images,
          };
          productData.variants.push(newVariantPayload);
        });
      });

      const productWithId = product as (Product & { _id?: string });
      const hasId = productWithId?._id !== undefined;
      const method = hasId ? 'PUT' : 'POST';
      const url = hasId
        ? `${API_BASE_URL}/api/products/${productWithId._id}`
        : `${API_BASE_URL}/api/products`;

      try {
        if (!token) {
          throw new Error('Authentication required');
        }

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        const result = await res.json();
        if (res.ok) {
          alert(`Product '${formData.name}' saved successfully!`);
          resetForm();
          onSave();
        } else {
          throw new Error(result.message || 'Failed to save product');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Error: ${message}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      clearForm: resetForm,
      isSubmitting,
    }));

    useEffect(() => {
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          brand: product.brand || '',
          category: product.category || '',
          tags: Array.isArray(product.tags)
            ? product.tags.join(', ')
            : '',
          basePrice: (product.basePrice ?? '').toString(),
        });

        if (product.variants && product.variants.length > 0) {
          const variantsArray = product.variants || [];

          // Group variants by color
          interface ColorGroup {
            color: string;
            sizes: Set<string>;
            price: string;
            stock: Record<string, string>;
            images: { url: string, publicId: string }[];
          }

          const colorGroups = variantsArray.reduce((groups: ColorGroup[], variant) => {
            const color = variant.options?.Color?.toString() || '';
            const existingGroup = groups.find(g => g.color === color);

            if (existingGroup) {
              existingGroup.sizes.add(variant.options?.Size?.toString() || '');
            } else {
              groups.push({
                color,
                sizes: new Set([variant.options?.Size?.toString() || '']),
                price: variant.price?.toString() || '',
                stock: {},
                images: product.images || [],
              });
            }
            return groups;
          }, [] as ColorGroup[]);

          // Convert Set to comma-separated string and build stock object
          const formattedVariants = colorGroups.map((group: ColorGroup) => {
            const sizesArray = Array.from(group.sizes).filter(Boolean);
            const stockObj: Record<string, string> = {};
            
            variantsArray.forEach((variant: Variant) => {
              if (variant.options?.Color === group.color && variant.options?.Size) {
                stockObj[variant.options.Size] = variant.stock?.toString() || '0';
              }
            });

            return {
              color: group.color,
              sizes: sizesArray.join(', '),
              price: group.price,
              stock: stockObj,
              images: group.images,
            };
          });

          setVariants(formattedVariants.length > 0 ? formattedVariants : [
            { color: '', sizes: '', price: '', stock: {}, images: [] },
          ]);
        } else {
          setVariants([
            { color: '', sizes: '', price: '', stock: {}, images: [] },
          ]);
        }
      }
    }, [product]);

    return (
      <div className={`space-y-6 ${inter.className}`}>
        {/* Cropper Modal */}
        {croppingImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
              <ImageCropper
                image={croppingImage.image}
                onCropComplete={handleCropComplete}
                onCancel={() => setCroppingImage(null)}
              />
            </div>
          </div>
        )}

        {/* --- SECTION 1: DETAILS --- */}
        <div className="bg-white p-8 border border-zinc-200 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-8 text-black border-b border-zinc-100 pb-4">
            Product Details
          </h2>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleProductChange}
                placeholder="e.g., Classic Denim Jacket"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-6">
              <TextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleProductChange}
                placeholder="Describe the fit, fabric, and details..."
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleProductChange}
                placeholder="e.g., DRYP Studios"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleProductChange}
                placeholder="e.g., Outerwear"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleProductChange}
                placeholder="e.g., Mens, Summer, Cotton"
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Base Price ($)"
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleProductChange}
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 2: VARIANTS --- */}
        <div className="space-y-10">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="bg-white p-8 border border-zinc-200 rounded-xl shadow-sm relative group"
            >
              <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
                <h3 className="text-lg font-bold text-zinc-900">
                  Variant Group {index + 1}
                </h3>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                  >
                    <X className="h-4 w-4" /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <Input
                    label="Color"
                    name="color"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, e as ChangeEvent<HTMLInputElement>)}
                    placeholder="e.g., Midnight Blue"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Sizes (comma-separated)"
                    name="sizes"
                    value={variant.sizes}
                    onChange={(e) => handleVariantChange(index, e as ChangeEvent<HTMLInputElement>)}
                    placeholder="e.g., S, M, L, XL"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Override Price (Optional)"
                    name="price"
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, e as ChangeEvent<HTMLInputElement>)}
                    placeholder="Leave empty for base price"
                    disabled={isSubmitting}
                  />
                </div>

                {/* STOCK MATRIX */}
                <div className="sm:col-span-6 bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-600 mb-5">
                    Inventory per Size
                  </h4>
                  {variant.sizes ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                      {Object.keys(variant.stock).map((size) => (
                        <div key={size}>
                          <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                            {size}
                          </label>
                          <input
                            type="number"
                            value={variant.stock[size]}
                            onChange={(e) =>
                              handleStockChange(
                                index,
                                size,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-base font-semibold text-zinc-900 focus:border-black focus:outline-none"
                            placeholder="0"
                            disabled={isSubmitting}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base text-zinc-500 italic">
                      Enter sizes above to configure stock levels.
                    </p>
                  )}
                </div>

                {/* IMAGE UPLOAD */}
                <div className="sm:col-span-6">
                  <label className="block text-sm font-bold uppercase tracking-wider text-zinc-600 mb-4">
                    Variant Images
                  </label>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-5">
                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 cursor-pointer hover:bg-zinc-100 hover:border-zinc-400 transition-all">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                      ) : (
                        <>
                          <UploadCloud className="h-6 w-6 text-zinc-400 mb-2" />
                          <span className="text-sm font-bold text-zinc-500 uppercase">
                            Upload
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleImageSelect(index, e)
                        }
                        className="hidden"
                        disabled={isSubmitting || isUploading}
                        accept="image/*"
                      />
                    </label>

                    {/* Image Previews */}
                    {variant.images.map((imgUrl, imgIndex) => (
                      <div
                        key={`${index}-${imgIndex}`}
                        className="relative aspect-[3/4] group/img"
                      >
                        <Image
                          src={imgUrl.url}
                          alt="preview"
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100px, 150px"
                          className="rounded-lg object-cover border border-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(index, imgIndex)
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-transparent py-5 text-base font-bold uppercase tracking-widest text-zinc-600 hover:border-black hover:text-black hover:bg-zinc-50 transition-all"
          disabled={isSubmitting}
        >
          <Plus className="h-5 w-5" />
          Add Another Color Variant
        </button>
      </div>
    );
  }
);

ProductForm.displayName = 'ProductForm';

export default ProductForm;