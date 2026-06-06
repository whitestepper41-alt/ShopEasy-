import React, { useState } from "react";
import { 
  ShieldAlert, 
  Users, 
  Store, 
  Trash2, 
  Coins, 
  Check, 
  X, 
  Database,
  Ticket,
  Plus,
  TrendingUp,
  Award
} from "lucide-react";
import { Product, Order, UserProfile, DiscountCoupon } from "../types";

interface AdminDashboardProps {
  adminProfile: UserProfile;
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  coupons: DiscountCoupon[];
  onApproveSeller: (userId: string) => Promise<void>;
  onRejectSeller: (userId: string) => Promise<void>;
  onRemoveProduct: (productId: string) => Promise<void>;
  onSeedDefaultCatalog: () => Promise<void>;
  onAddCoupon: (couponCode: string, percent: number) => Promise<void>;
  onToggleCoupon: (couponId: string, active: boolean) => Promise<void>;
}

export default function AdminDashboard({
  adminProfile,
  users,
  products,
  orders,
  coupons,
  onApproveSeller,
  onRejectSeller,
  onRemoveProduct,
  onSeedDefaultCatalog,
  onAddCoupon,
  onToggleCoupon,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "vendors" | "products" | "coupons" | "users">("metrics");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPercent, setNewCouponPercent] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const pendingSellers = users.filter(u => u.role === "seller" && u.status === "pending_approval");
  const activeSellers = users.filter(u => u.role === "seller" && u.status === "active");
  const regularBuyers = users.filter(u => u.role === "buyer");

  const totalGrossVolume = orders
    .filter(o => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSeedClick = async () => {
    setIsSeeding(true);
    await onSeedDefaultCatalog();
    setIsSeeding(false);
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponPercent) return;
    const percent = parseInt(newCouponPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      alert("Please enter a valid percent discount between 1 and 100.");
      return;
    }
    await onAddCoupon(newCouponCode.toUpperCase().trim(), percent);
    setNewCouponCode("");
    setNewCouponPercent("");
    alert("Coupon added successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Admin banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-6.5 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              MARKETPLACE OWNER OPERATIONS
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">ShopEasy Admin Engine</h2>
          <p className="text-sm text-red-100 max-w-lg mt-1">
            System administration portal. Audit registered users, authorize sellers, issue vouchers, and seed catalogs.
          </p>
        </div>

        <button
          onClick={handleSeedClick}
          disabled={isSeeding}
          className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-red-700 transition shadow hover:bg-neutral-50 disabled:bg-gray-100 disabled:text-gray-400 active:scale-95"
        >
          <Database className={`h-4.5 w-4.5 ${isSeeding ? "animate-spin" : ""}`} />
          <span>{isSeeding ? "Syncing database items..." : "Seed Malawi Catalog (6 items)"}</span>
        </button>
      </div>

      {/* Admin navigation navigation bar tabs */}
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-xs">
        {(["metrics", "vendors", "products", "coupons", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold capitalize transition ${
              activeTab === tab
                ? "bg-red-600 text-white shadow"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab === "metrics" && "Overview Stats"}
            {tab === "vendors" && `Pending Stores (${pendingSellers.length})`}
            {tab === "products" && `All Listings (${products.length})`}
            {tab === "coupons" && `coupons (${coupons.length})`}
            {tab === "users" && `Users directory (${users.length})`}
          </button>
        ))}
      </div>

      {/* 1. METRICS OVERVIEW */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Gross Platform Volume</span>
                <span className="p-1 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">MWK {totalGrossVolume.toFixed(2)}</h3>
              <p className="text-[10px] text-green-600 font-semibold mt-1">All successful checkouts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Total User base</span>
                <span className="p-1 bg-blue-50 rounded-lg text-blue-600"><Users className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{users.length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">{activeSellers.length} sellers, {regularBuyers.length} buyers</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Global Listings</span>
                <span className="p-1 bg-violet-50 rounded-lg text-violet-600"><Store className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Live searchable items</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Under Authorization</span>
                <span className="p-1 bg-amber-50 rounded-lg text-amber-600"><ShieldAlert className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{pendingSellers.length}</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">Applications awaiting approval</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h3 className="text-sm font-black text-gray-800 mb-3.5">Global Sales Logbook</h3>
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No platform orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 font-semibold">
                      <th className="py-2">Order ID</th>
                      <th className="py-2">Buyer Email</th>
                      <th className="py-2">Sub-Items</th>
                      <th className="py-2">Charge Volume</th>
                      <th className="py-2">Payment</th>
                      <th className="py-2">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-mono">{o.id}</td>
                        <td className="py-2.5 text-gray-500">{o.buyerEmail}</td>
                        <td className="py-2.5 text-gray-600">
                          {o.items.map(i => `${i.name} (${i.quantity}x)`).join(", ")}
                        </td>
                        <td className="py-2.5 font-bold text-slate-900">MWK {o.totalAmount.toFixed(2)}</td>
                        <td className="py-2.5 uppercase text-[10px] font-bold">
                          <span className={o.paymentStatus === "paid" ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded" : "text-amber-600"}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 uppercase text-[10px] font-bold">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PENDING VENDOR APPROVAL QUEUE */}
      {activeTab === "vendors" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-4">Merchant Registration Inboxes</h3>
          {pendingSellers.length === 0 ? (
            <div className="text-center py-10">
              <Check className="mx-auto h-8 w-8 text-green-500 bg-green-50 rounded-full p-1.5 mb-2" />
              <p className="text-xs text-gray-400">All merchant authorization logs cleared! No pending applications.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingSellers.map((seller) => (
                <div key={seller.uid} className="border border-gray-100 rounded-xl p-4.5 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-neutral-900 text-sm">{seller.sellerName || "Proposed Storefront ID"}</h4>
                    <p className="text-gray-500">{seller.sellerDescription || "No registration bio submitted."}</p>
                    <div className="flex items-center gap-3 text-gray-400 font-medium">
                      <span>Email: {seller.email}</span>
                      <span>•</span>
                      <span>Owner: {seller.username}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 self-end">
                    <button
                      onClick={() => onRejectSeller(seller.uid)}
                      className="flex items-center gap-1 border border-gray-200 bg-white text-gray-500 font-semibold px-3 py-1.8 rounded-lg hover:text-red-600 hover:border-red-200 transition"
                    >
                      <X className="h-4 w-4" />
                      <span>Deny</span>
                    </button>
                    <button
                      onClick={() => onApproveSeller(seller.uid)}
                      className="flex items-center gap-1 bg-emerald-600 font-black text-white px-4.5 py-1.8 rounded-lg shadow-sm hover:bg-emerald-700 transition"
                    >
                      <Check className="h-4 w-4" />
                      <span>Authorize</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. FLAGGED PRODUCT LISTING AUDITS */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-3.5">Live Store Offerings</h3>
          {products.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No catalog items listed.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="py-2">Item Detail</th>
                    <th className="py-2">Vendor Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Price Label</th>
                    <th className="py-2">Rating Metrics</th>
                    <th className="py-2 text-right">Delete Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 flex items-center gap-2 max-w-[240px]">
                        <img src={p.imageUrls[0]} alt="" className="h-10 w-10 object-cover rounded border border-gray-100" />
                        <span className="truncate" title={p.name}>{p.name}</span>
                      </td>
                      <td className="py-3 text-gray-500">{p.sellerName}</td>
                      <td className="py-3 capitalize text-gray-400">{p.category}</td>
                      <td className="py-3 text-gray-800 font-bold">MWK {p.price.toFixed(2)}</td>
                      <td className="py-3 text-neutral-500">{p.averageRating.toFixed(1)} / 5 ({p.reviewCount})</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Authorize complete removal of compilation ${p.name}?`)) {
                              onRemoveProduct(p.id);
                            }
                          }}
                          className="p-1.5 border border-gray-200 hover:border-red-600 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition"
                          title="Purge product listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. DISCOUNT COUPONS */}
      {activeTab === "coupons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs h-fit">
            <h3 className="text-sm font-black text-gray-800 mb-3.5 flex items-center gap-1">
              <Ticket className="h-4 w-4 text-rose-500" />
              <span>Issue New Promo Code</span>
            </h3>

            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE20, ALI50"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2.5 outline-none focus:border-red-500 bg-gray-50 uppercase font-black"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Discount Percent (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  placeholder="e.g. 20"
                  value={newCouponPercent}
                  onChange={(e) => setNewCouponPercent(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 p-2.5 outline-none focus:border-red-500 bg-gray-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black hover:shadow text-xs transition"
              >
                Assemble Vouchers
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs lg:col-span-2">
            <h3 className="text-sm font-black text-gray-800 mb-3.5">Active Promo Discounts</h3>
            {coupons.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No discount coupons found in collection.</p>
            ) : (
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 pb-2">
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Percent Value</th>
                      <th className="pb-2">Eligibility Status</th>
                      <th className="pb-2 text-right">Switch toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 font-bold font-mono text-gray-900">{c.id}</td>
                        <td className="py-2.5 text-neutral-700 text-sm font-black text-red-600">{c.discountPercent}% Off</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-neutral-100 text-neutral-400"
                          }`}>
                            {c.active ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onToggleCoupon(c.id, !c.active)}
                            className={`rounded px-2 py-1 text-[10px] font-bold uppercase transition ${
                              c.active 
                                ? "border border-gray-200 text-gray-400 hover:bg-gray-50" 
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            {c.active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. USER REGISTRATION DATABASE */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-3.5">All registered users</h3>
          <div className="overflow-x-auto text-xs font-semibold">
            <table className="w-full text-left col-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2">User details</th>
                  <th className="pb-2">Role classification</th>
                  <th className="pb-2">Store name (Sellers Only)</th>
                  <th className="pb-2">Store Authorization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-neutral-700">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="py-2.5 space-y-0.5">
                      <div className="text-gray-950 font-bold">{user.username}</div>
                      <div className="text-gray-400 font-mono text-[10px]">{user.uid} • {user.email}</div>
                    </td>
                    <td className="py-2.5 capitalize">
                      <span className={`p-1 border text-[10px] rounded font-bold uppercase ${
                        user.role === "admin" ? "bg-red-50 border-red-200 text-red-600" :
                        user.role === "seller" ? "bg-violet-50 border-violet-200 text-violet-600" :
                        "bg-blue-50 border-blue-200 text-blue-600"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500 italic">
                      {user.role === "seller" ? (user.sellerName || "Proposed Vendor store") : "No Storefront"}
                    </td>
                    <td className="py-2.5 capitalize text-[10px] font-bold">
                      {user.role === "seller" ? (
                        <span className={
                          user.status === "active" ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" :
                          user.status === "pending_approval" ? "text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" :
                          "text-red-650"
                        }>
                          {user.status}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
