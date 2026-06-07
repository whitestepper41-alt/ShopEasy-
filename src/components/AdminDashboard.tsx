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
  Award,
  Activity,
  Wifi,
  Terminal,
  Server
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
  onDeleteUser: (userId: string) => Promise<void>;
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
  onDeleteUser,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "vendors" | "products" | "coupons" | "users" | "diagnostics">("metrics");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponPercent, setNewCouponPercent] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Real-time integration diagnostic states
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [latencyLogs, setLatencyLogs] = useState<string[]>([]);
  const [latencies, setLatencies] = useState<{write: number; read: number; delete: number} | null>(null);

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

  const runFirebaseCRUDTest = async () => {
    setTestStatus("running");
    setTestResult(null);
    setLatencies(null);
    setLatencyLogs([]);
    const logs: string[] = [];
    const addLog = (m: string) => {
      console.log(m);
      logs.push(`[${new Date().toLocaleTimeString()}] ${m}`);
      setLatencyLogs([...logs]);
    };

    try {
      addLog("Initializing secure ShopEasy Firebase live diagnostics check...");
      
      const firestoreModule = await import("firebase/firestore");
      const { db } = await import("../firebase");
      
      const targetProjId = db.app.options.projectId || "shopeasy-146d3";
      addLog(`✓ Central module parsed. Linked Project: "${targetProjId}"`);
      addLog("Preparing testing payload at /test_operations/diagnostics_crud_token...");

      const testDocRef = firestoreModule.doc(db, "test_operations", `diag_${Date.now()}`);
      
      // Phase A: Create / Write
      addLog("Firing CRUD phase 1/3 (Write Payload)...");
      const writeStart = performance.now();
      await firestoreModule.setDoc(testDocRef, {
        testerProfile: "Admin Systems Operator",
        projectTarget: targetProjId,
        testTimestamp: firestoreModule.serverTimestamp(),
        flag: "temporary-network-audit"
      });
      const writeEnd = performance.now();
      const writeTime = parseFloat((writeEnd - writeStart).toFixed(1));
      addLog(`✓ CREATE: Write operation completed in ${writeTime}ms.`);

      // Phase B: Read via getDocFromServer (Direct fetch bypassing local cache completely)
      addLog("Firing CRUD phase 2/3 (Direct Server Read-back)...");
      const readStart = performance.now();
      const docSnap = await firestoreModule.getDocFromServer(testDocRef);
      const readEnd = performance.now();
      const readTime = parseFloat((readEnd - readStart).toFixed(1));
      
      if (docSnap.exists()) {
        addLog(`✓ READ: Verified document state. Target payload found (flag: "${docSnap.data().flag}").`);
        addLog(`✓ READ: Read operation completed in ${readTime}ms.`);
      } else {
        throw new Error("Created document was written but returned null snapshot during remote fetching!");
      }

      // Phase C: Delete
      addLog("Firing CRUD phase 3/3 (Database Cleanup / Delete)...");
      const deleteStart = performance.now();
      await firestoreModule.deleteDoc(testDocRef);
      const deleteEnd = performance.now();
      const deleteTime = parseFloat((deleteEnd - deleteStart).toFixed(1));
      addLog(`✓ DELETE: Document purged successfully in ${deleteTime}ms.`);

      setLatencies({ write: writeTime, read: readTime, delete: deleteTime });
      addLog(`★ Entire loop completed successfully with combined O(n) round-trip delay: ${(writeTime + readTime + deleteTime).toFixed(1)}ms!`);
      setTestStatus("success");
      setTestResult("Firestore database and ShopEasy website are fully connected, authenticated, and ready!");
    } catch (err: any) {
      console.error(err);
      addLog(`❌ INTEGRATION GAP DETECTED: ${err.message || err}`);
      setTestStatus("failed");
      setTestResult(err.message || String(err));
    }
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
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-xs overflow-x-auto no-scrollbar">
        {(["metrics", "vendors", "products", "coupons", "users", "diagnostics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-2.5 px-3 rounded-lg text-xs font-bold capitalize transition whitespace-nowrap ${
              activeTab === tab
                ? "bg-red-600 text-white shadow"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab === "metrics" && "Overview Stats"}
            {tab === "vendors" && `Pending (${pendingSellers.length})`}
            {tab === "products" && `All Listings (${products.length})`}
            {tab === "coupons" && `Coupons (${coupons.length})`}
            {tab === "users" && `Users Directory (${users.length})`}
            {tab === "diagnostics" && "🔌 Firebase Diagnostics"}
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
                  <th className="pb-2 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-neutral-700">
                {users.length === 0 || (users.length === 1 && users[0].uid === adminProfile.uid) ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500 bg-gray-50/50 rounded-xl">
                      <div className="max-w-md mx-auto space-y-2 p-4">
                        <Users className="mx-auto h-8 w-8 text-neutral-400 mb-1" />
                        <p className="text-neutral-900 font-black text-xs">No foreign buyer or seller accounts in database directory yet.</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          Your account is currently the sole registered profile. Deleting yourself is disabled to prevent admin lockout.
                          <br />
                          To see and manage the <b className="text-red-600 uppercase font-bold">Delete Account</b> controls, other registered users must be present in the directory.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
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
                      <td className="py-2.5 text-right">
                        {user.uid !== adminProfile.uid ? (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you absolutely sure you want to permanently delete user "${user.username}" (${user.email})? This action cannot be undone.`)) {
                                onDeleteUser(user.uid);
                              }
                            }}
                            className="px-2 py-1 text-[10px] text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-lg transition font-black font-sans uppercase tracking-tight cursor-pointer"
                          >
                            Delete Account
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Main Admin (Self)</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SYSTEM INTEGRATION & CONNECTION DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Connection Overview Column */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs h-fit space-y-4">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-1">
              <Server className="h-4.5 w-4.5 text-neutral-700" />
              <span>Project Configuration</span>
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-neutral-600">
              <div className="bg-neutral-50 rounded-xl p-3 border border-gray-150 space-y-2">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold">Active Project Identity</p>
                  <p className="text-xs text-neutral-900 font-mono font-bold">shopeasy-146d3</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold">Firestore Endpoint Node</p>
                  <p className="text-xs text-neutral-900 font-mono font-bold">(default) Instance</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold">Google Web Application Client ID</p>
                  <p className="text-xs text-neutral-900 font-mono font-bold tracking-tight">1:851735771591:web:ab702813dd2...</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold">Obfuscated Security Token</p>
                  <p className="text-xs text-indigo-600 font-mono font-bold">AIzaSyAgg1ca********3Jg7rxjk4zkglE</p>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-100 rounded-xl space-y-1.5">
                <div className="flex gap-1.5 items-center text-red-700">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="font-extrabold uppercase text-[9px] tracking-wider">Access Security Rules</p>
                </div>
                <p className="text-[11px] text-red-650 leading-relaxed font-medium">
                  The database collections currently have **Developer Sandbox Rules** deployed. Reads and writes are authorized across products, users, reviews, and messages for high compatibility.
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostics Test Action Column */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-neutral-700" />
                  <span>Real-time Connection & Latency Tester</span>
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">Measure exact write, read and cleanup roundtrip delay with your live Google Cloud cluster.</p>
              </div>

              <button
                onClick={runFirebaseCRUDTest}
                disabled={testStatus === "running"}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-indigo-600 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                <Wifi className={`h-4 w-4 ${testStatus === "running" ? "animate-pulse" : ""}`} />
                <span>{testStatus === "running" ? "Testing Nodes..." : "Inbound Test"}</span>
              </button>
            </div>

            {/* Test results indicator */}
            {testStatus !== "idle" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Latency diagram stats */}
                <div className="border border-gray-100 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Operational Delay (ms)</p>
                  
                  {latencies ? (
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Write Payload (CREATE)</span>
                          <span className="font-mono text-neutral-900">{latencies.write}ms</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (latencies.write / 300) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Fetch Bypass Cache (READ)</span>
                          <span className="font-mono text-neutral-900">{latencies.read}ms</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (latencies.read / 300) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Clean Up Payload (DELETE)</span>
                          <span className="font-mono text-neutral-900">{latencies.delete}ms</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, (latencies.delete / 300) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-6 text-xs text-gray-400 font-bold animate-pulse">
                      Pending remote round-trip logs...
                    </div>
                  )}

                  {testResult && (
                    <div className={`p-3 rounded-lg text-xs font-bold ${
                      testStatus === "success" 
                        ? "bg-emerald-50 border border-emerald-150 text-emerald-700" 
                        : "bg-red-50 border border-red-150 text-red-700"
                    }`}>
                      {testResult}
                    </div>
                  )}
                </div>

                {/* Console latency logs */}
                <div className="bg-neutral-950 font-mono text-[10px] text-green-400 p-3.5 rounded-xl border border-neutral-900 overflow-y-auto max-h-[160px] space-y-1.5 no-scrollbar flex flex-col">
                  <div className="flex items-center gap-1.5 text-[8px] text-gray-500 uppercase tracking-widest border-b border-neutral-900 pb-1.5 mb-1 font-bold">
                    <Terminal className="h-3 w-3 text-indigo-400" />
                    <span>Real-time System Output</span>
                  </div>
                  {latencyLogs.map((log, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed truncate">{log}</div>
                  ))}
                  {latencyLogs.length === 0 && (
                    <div className="text-gray-600 italic py-4 text-center">Execute loop to fetch logs.</div>
                  )}
                </div>

              </div>
            )}

            {testStatus === "idle" && (
              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center space-y-2">
                <Wifi className="h-10 w-10 text-gray-300 mx-auto animate-pulse" />
                <h4 className="font-extrabold text-neutral-700 text-xs">Diagnostic Suite Stand-By</h4>
                <p className="text-gray-400 font-medium text-[11px] max-w-sm mx-auto">
                  Click the **Inbound Test** button to trigger a live multi-phase CRUD loop. This writes a transient document, queries it directly from the primary Google server, measurements delays, and wipes it clean.
                </p>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
