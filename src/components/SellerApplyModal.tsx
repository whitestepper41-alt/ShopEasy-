import React, { useState } from "react";
import { X, Store, Smartphone, ShieldCheck, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SellerApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    sellerName: string;
    sellerDescription: string;
    sellerWhatsApp: string;
    sellerPayChanguPublicKey: string;
  }) => Promise<void>;
}

export default function SellerApplyModal({ isOpen, onClose, onSubmit }: SellerApplyModalProps) {
  const [sellerName, setSellerName] = useState("");
  const [sellerDescription, setSellerDescription] = useState("");
  const [sellerWhatsApp, setSellerWhatsApp] = useState("");
  const [sellerPayChanguPublicKey, setSellerPayChanguPublicKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!sellerName.trim() || !sellerDescription.trim() || !sellerWhatsApp.trim() || !sellerPayChanguPublicKey.trim()) {
      setErrorMsg("Please fill in all the required fields.");
      return;
    }

    // Validate WhatsApp number format (at least 9 digits, typically starts with country code like 265 for Malawi)
    const phoneClean = sellerWhatsApp.replace(/\D/g, "");
    if (phoneClean.length < 9) {
      setErrorMsg("Please enter a valid WhatsApp number (e.g. 265888123456).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        sellerName: sellerName.trim(),
        sellerDescription: sellerDescription.trim(),
        sellerWhatsApp: phoneClean,
        sellerPayChanguPublicKey: sellerPayChanguPublicKey.trim(),
      });
      // Clear form form
      setSellerName("");
      setSellerDescription("");
      setSellerWhatsApp("");
      setSellerPayChanguPublicKey("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4" id="seller-apply-modal-wrapper">
          {/* Animated Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
            id="seller-apply-modal-backdrop"
          />

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 z-10 overflow-hidden"
            id="seller-apply-modal"
          >
            {/* Header Header */}
            <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                  <Store className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-900">Apply for a Merchant Storefront</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Join Malawi's digital commerce sandbox</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-lg transition"
                id="close-apply-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-600 font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-500 font-bold mb-1.5">
                  Business / Storefront Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malawi Tech Solutions"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500 bg-gray-50/50 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5">
                  Storefront Biography / Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief summary introducing what your store sells, brand guarantees, and dispatch times."
                  value={sellerDescription}
                  onChange={(e) => setSellerDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500 bg-gray-50/50 transition font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  Store WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 265888123456"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500 bg-gray-50/50 transition font-mono font-medium"
                />
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  We'll route real-time WhatsApp purchase order notifications here matching your customer sales.
                </p>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                  PayChangu Public checkout Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pub-test-..."
                  value={sellerPayChanguPublicKey}
                  onChange={(e) => setSellerPayChanguPublicKey(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-3 outline-none focus:border-violet-500 bg-gray-50/50 transition font-mono font-medium"
                />
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  Use your PayChangu test/live public key so buyers pay directly into your merchant configuration.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-100 flex items-start gap-2.5 text-[10px] text-violet-700 leading-normal mb-1">
                <span className="mt-0.5 font-bold">💡 Note:</span>
                <p className="font-semibold text-violet-600">
                  By submitting, your storefront request is sent immediately to the system Administrator. Upon verification and authorization, your products and shop dashboard will go live!
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50 text-[11px] transition font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[11px] transition font-black shadow-md shadow-violet-100 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Store className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
