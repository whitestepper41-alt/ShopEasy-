import React from "react";
import { Star, ShoppingCart, Heart, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: any;
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-0.8 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
          {product.category}
        </span>

        {/* Wishlist Heart Button */}
        <button
          onClick={() => onToggleWishlist(product)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm backdrop-blur-xs"
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Content Meta panel */}
      <div className="flex flex-1 flex-col p-4">
        {/* Seller Info */}
        <div className="mb-1 flex items-center gap-1 text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
          <StoreTagIcon />
          <span className="truncate max-w-[120px]" title={product.sellerName}>
            {product.sellerName}
          </span>
          <span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onViewDetails(product)}
          className="mb-1.5 min-h-[40px] cursor-pointer text-sm font-semibold leading-tight text-neutral-800 line-clamp-2 hover:text-indigo-600 transition-colors"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Stars / Reviews panel */}
        <div className="mb-3 flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-gray-500">{product.averageRating.toFixed(1)}</span>
          <span className="text-[10px] font-medium text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Spacing alignment */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <div className="text-xs text-neutral-400 font-medium leading-none">Price</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-black text-indigo-600">MWK </span>
              <span className="text-xl font-black text-slate-900">{product.price.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Free Shipping</div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onViewDetails(product)}
              className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              title="View Specs & Reviews"
            >
              Details
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-sm font-bold"
              }`}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreTagIcon() {
  return (
    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
