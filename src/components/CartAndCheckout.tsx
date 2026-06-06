import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ShieldCheck, 
  Ticket,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { CartItem, DiscountCoupon } from "../types";

interface CartAndCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  coupons: DiscountCoupon[];
  onCheckout: (shippingAddress: string, couponCode: string, totalAmount: number) => Promise<void>;
}

export default function CartAndCheckout({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  coupons,
  onCheckout,
}: CartAndCheckoutProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // Stripe Sim fields fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = (rawSubtotal * appliedCoupon.discountPercent) / 100;
  }
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyCoupon = () => {
    setCouponError("");
    const matched = coupons.find(c => c.id.toUpperCase() === couponInput.toUpperCase().trim());
    if (!matched) {
      setCouponError("Invalid promo coupon code.");
      setAppliedCoupon(null);
    } else if (!matched.active) {
      setCouponError("Promo code is no longer active.");
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(matched);
      setCouponError("");
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!shippingAddress) {
      alert("Please provide a valid delivery address.");
      return;
    }
    if (!cardNumber || !cardExpiry || !cardCVC || !cardHolder) {
      alert("Please configure all credit card details to authorize payment.");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate Stripe 1s handshakes
      await new Promise(resolve => setTimeout(resolve, 1200));
      await onCheckout(shippingAddress, appliedCoupon?.id || "", finalTotal);
      
      // Reset forms
      setShippingAddress("");
      setCouponInput("");
      setAppliedCoupon(null);
      setCardNumber("");
      setCardExpiry("");
      setCardCVC("");
      setCardHolder("");
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-slideover-container">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-4.5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <h2 className="text-sm font-black text-gray-900">Your Checkout Basket</h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} items
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 px-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Cart item listing container */}
          <div className="flex-1 overflow-y-auto p-4.5 space-y-4 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-xs text-gray-500 font-semibold mb-6">Your shopping cart basket is empty.</p>
                <button 
                  onClick={onClose}
                  className="inline-flex text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pb-3 border-b border-gray-50 text-xs font-semibold text-neutral-800">
                    <img 
                      src={item.product.imageUrls[0]} 
                      alt="" 
                      className="h-14 w-14 object-cover rounded-lg border border-gray-100" 
                    />
                    
                    <div className="flex-1 space-y-0.8">
                      <h4 className="font-bold text-gray-900 line-clamp-1 truncate" title={item.product.name}>{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase truncate" title={item.product.sellerName}>Seller: {item.product.sellerName}</p>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-slate-900">${item.product.price.toFixed(2)}</span>
                        
                        {/* Quantity counters */}
                        <div className="flex items-center gap-1 rounded-lg border border-gray-150 p-0.5 bg-gray-50">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-[11px] font-bold font-mono">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-300 hover:text-red-500 self-start p-1 bg-gray-50 rounded"
                    >
                      <Trash2 className="h-3.8 w-3.8" />
                    </button>
                  </div>
                ))}

                {/* Promo Code section */}
                <div className="pt-2">
                  <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1.5">Apply promo code coupon</span>
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 outline-none focus:border-indigo-500 rounded-lg font-bold bg-gray-50"
                      placeholder="e.g. SAVE10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-[10px] text-green-600 font-bold mt-1">
                      Success: Applied <strong>{appliedCoupon.id}</strong> ({appliedCoupon.discountPercent}% off subtotal)
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Checkout forms */}
                <form onSubmit={handleCheckoutSubmit} className="pt-4 border-t border-gray-100 space-y-4 text-xs">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-black mb-1.5">Shipping Address Details</span>
                    <textarea
                      required
                      placeholder="Input complete shipping delivery details (Apt, Street number, Zip Code, Country)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      rows={2.5}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-gray-50 resize-y"
                    />
                  </div>

                  {/* Stripe fields simulation panel */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-150 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-1">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4 text-neutral-500" />
                        <span>Stripe Payment Sandbox</span>
                      </span>
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Cardholder Name (Any)</label>
                      <input
                        type="text"
                        required
                        placeholder="Johnathan Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 p-1.8 bg-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Credit Card Number (Simulated)</label>
                      <input
                        type="text"
                        required
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 p-1.8 bg-white outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Expiry MM/YY</label>
                        <input
                          type="text"
                          required
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 p-1.8 bg-white outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-0.5">CVC CVV</label>
                        <input
                          type="text"
                          required
                          placeholder="311"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 p-1.8 bg-white outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="bg-gray-50/75 p-3.5 rounded-lg text-xs space-y-1.5 font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span>${rawSubtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Savings:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-800">
                      <span>Shipping Fees:</span>
                      <span className="text-emerald-600 font-bold">FREE Global Shipping</span>
                    </div>
                    <div className="flex justify-between text-[13px] font-black text-gray-900 border-t border-gray-250 pt-2 mt-2">
                      <span>Grand Total:</span>
                      <span className="text-indigo-600 text-base font-black">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit checkout */}
                  <button
                    type="submit"
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full py-3.2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-sm transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    id="submit-payment-btn"
                  >
                    <span>{isProcessing ? "Authenticating Stripe..." : `Authorize Payment $${finalTotal.toFixed(2)}`}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
