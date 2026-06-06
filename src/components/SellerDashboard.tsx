import React, { useState } from "react";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Truck, 
  AlertCircle,
  X,
  Upload,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Product, Order, UserProfile } from "../types";

interface SellerDashboardProps {
  sellerProfile: UserProfile;
  products: Product[];
  orders: Order[];
  onAddProduct: (productData: any) => Promise<void>;
  onEditProduct: (productId: string, productData: any) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  onUpdateSellerDetails: (details: { sellerName: string; sellerDescription: string }) => Promise<void>;
}

export default function SellerDashboard({
  sellerProfile,
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateSellerDetails,
}: SellerDashboardProps) {
  // Tabs: "overview", "listings", "orders", "settings"
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "listings" | "orders" | "settings">("overview");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states state
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("Electronics");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productDescription, setProductDescription] = useState("");

  // Seller profile fields settings
  const [storeNameState, setStoreNameState] = useState(sellerProfile.sellerName || "");
  const [storeDescriptionState, setStoreDescriptionState] = useState(sellerProfile.sellerDescription || "");

  // Filter products by seller
  const sellerProducts = products.filter(p => p.sellerId === sellerProfile.uid);

  // Filter orders containing items from this seller
  const sellerOrders = orders.filter(order => 
    order.items.some(item => item.sellerId === sellerProfile.uid)
  );

  const totalEarnings = sellerOrders
    .filter(order => order.paymentStatus === "paid")
    .reduce((sum, order) => {
      const sellerItemsTotal = order.items
        .filter(item => item.sellerId === sellerProfile.uid)
        .reduce((s, i) => s + (i.price * i.quantity), 0);
      return sum + sellerItemsTotal;
    }, 0);

  const pendingShipments = sellerOrders.filter(o => o.status === "paid" || o.status === "pending").length;

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productPrice || !productStock) return;

    const dataPayload = {
      name: productName,
      category: productCategory,
      price: parseFloat(productPrice),
      stock: parseInt(productStock, 10),
      imageUrls: [productImage || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop"],
      description: productDescription,
    };

    try {
      if (editingProduct) {
        await onEditProduct(editingProduct.id, dataPayload);
        setEditingProduct(null);
      } else {
        await onAddProduct(dataPayload);
      }
      // Reset form states
      setProductName("");
      setProductPrice("");
      setProductStock("");
      setProductImage("");
      setProductDescription("");
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setProductName(p.name);
    setProductCategory(p.category);
    setProductPrice(p.price.toString());
    setProductStock(p.stock.toString());
    setProductImage(p.imageUrls[0] || "");
    setProductDescription(p.description);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductStock("");
    setProductImage("");
    setProductDescription("");
    setShowAddForm(false);
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSellerDetails({
      sellerName: storeNameState,
      sellerDescription: storeDescriptionState
    });
    alert("Store Profile updated successfully!");
  };

  // Guard for approval status
  if (sellerProfile.status === "pending_approval") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center max-w-2xl mx-auto my-12 shadow-sm" id="seller-pending-banner">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-amber-900 mb-2">Vendor Account Pending Approval</h2>
        <p className="text-sm text-amber-700 leading-relaxed mb-6">
          Thank you for registering as a seller on ShopEasy! Our administrators are currently verifying your store details. You will gain listings capability as soon as your shop status is sets to <b>Active</b>.
        </p>
        <div className="bg-white p-4 rounded-xl border border-amber-100 text-left">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Your Store Application Detail</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>Proposed Store:</b> {sellerProfile.sellerName || "Unnamed Store"}</p>
            <p><b>Category Focus:</b> Smart Electronics & Accessories</p>
            <p><b>Associated Email:</b> {sellerProfile.email}</p>
          </div>
        </div>
      </div>
    );
  }

  if (sellerProfile.status === "rejected") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">Seller Registration Disapproved</h2>
        <p className="text-sm text-red-700 leading-relaxed">
          Your shop registration was not authorized in this instance. This could be due to incomplete application details or non-compliance. Please contact support to appeal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vendor banner heading */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-violet-600 to-indigo-700 rounded-2xl p-6.5 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              VERIFIED MERCHANDISE SELLER
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{sellerProfile.sellerName || "My Store storefront"}</h2>
          <p className="text-sm text-indigo-100/90 max-w-lg mt-1">{sellerProfile.sellerDescription || "E-commerce general listings center."}</p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddForm(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-indigo-700 transition shadow-sm hover:bg-neutral-50 active:scale-95"
          id="seller-add-product-btn"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Upload New Product</span>
        </button>
      </div>

      {/* Seller sub navigation tab keys */}
      <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-xs">
        {(["overview", "listings", "orders", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold capitalize transition ${
              activeSubTab === tab
                ? "bg-violet-600 text-white shadow"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab === "overview" && "Revenue Stats"}
            {tab === "listings" && `Products (${sellerProducts.length})`}
            {tab === "orders" && `Store Orders (${sellerOrders.length})`}
            {tab === "settings" && "Store Profile"}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW SCREEN */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Gross Earnings</span>
                <span className="p-1 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">MWK {totalEarnings.toFixed(2)}</h3>
              <p className="text-[10px] text-green-600 font-semibold mt-1">From paid checkouts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Listed</span>
                <span className="p-1 bg-violet-50 rounded-lg text-violet-600"><Package className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{sellerProducts.length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Products in catalog</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">All Channel Sales</span>
                <span className="p-1 bg-blue-50 rounded-lg text-blue-600"><ShoppingBag className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{sellerOrders.length}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Placed order counts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Pending Shipment</span>
                <span className="p-1 bg-amber-50 rounded-lg text-amber-600"><Truck className="h-4 w-4" /></span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{pendingShipments}</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">Requires seller actions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <h3 className="text-sm font-black text-neutral-900 mb-3">Recent Sales Activity</h3>
            {sellerOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No orders registered for your products yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 font-semibold">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Product</th>
                      <th className="py-2.5">Buyer</th>
                      <th className="py-2.5">Total Revenue</th>
                      <th className="py-2.5">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerOrders.slice(0, 5).map((order) => {
                      const itemDetails = order.items.filter(i => i.sellerId === sellerProfile.uid);
                      return (
                        <tr key={order.id} className="border-b border-gray-100 font-medium">
                          <td className="py-3 font-mono">{order.id.slice(0, 8)}...</td>
                          <td className="py-3 truncate max-w-[200px]" title={itemDetails.map(i => i.name).join(", ")}>
                            {itemDetails[0]?.name} {itemDetails.length > 1 && `+ ${itemDetails.length - 1} more`}
                          </td>
                          <td className="py-3 text-gray-500">{order.buyerEmail}</td>
                          <td className="py-3 font-bold text-slate-900">
                            MWK {itemDetails.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.status === "delivered" ? "bg-green-150 text-green-700" :
                              order.status === "shipped" ? "bg-blue-150 text-blue-700" :
                              order.status === "paid" ? "bg-indigo-50 text-indigo-700 animate-pulse" : "bg-neutral-150 text-neutral-700"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LISTINGS MANAGEMENT */}
      {activeSubTab === "listings" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-gray-800">My listed marketplace items</h3>
            <span className="text-xs text-gray-400">{sellerProducts.length} listings available</span>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-xs text-gray-400 mb-3">You do not have any listings yet. Create your first product post!</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="inline-flex text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-lg"
              >
                Create Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="py-2">Item</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Unit Price</th>
                    <th className="py-2">Stock Inventory</th>
                    <th className="py-2">Rating Metrics</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sellerProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 font-medium">
                      <td className="py-3 flex items-center gap-2 max-w-[240px]">
                        <img src={p.imageUrls[0]} alt="" className="h-10 w-10 oject-cover rounded border border-gray-100" />
                        <span className="truncate" title={p.name}>{p.name}</span>
                      </td>
                      <td className="py-3 text-gray-500 capitalize">{p.category}</td>
                      <td className="py-3 font-bold">MWK {p.price.toFixed(2)}</td>
                      <td className="py-3 font-mono">
                        {p.stock === 0 ? (
                          <span className="text-red-500 font-bold">SOLDOUT (0)</span>
                        ) : (
                          <span className={p.stock <= 5 ? "text-amber-500 font-bold" : "text-gray-700"}>{p.stock} units</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>{p.averageRating.toFixed(1)}</span>
                          <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
                        </div>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-1 px-2 border border-gray-200 hover:border-violet-600 hover:bg-violet-50 text-gray-600 hover:text-violet-600 rounded gap-1 transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this listing?")) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 border border-gray-200 hover:border-red-600 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-all"
                          title="Delete design"
                        >
                          <Trash2 className="h-3.8 w-3.8" />
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

      {/* 3. INBOUND STORE ORDERS */}
      {activeSubTab === "orders" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-3">Customer Purchases Queue</h3>
          {sellerOrders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No purchases recorded for your products yet.</p>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((order) => {
                const itemDetails = order.items.filter(i => i.sellerId === sellerProfile.uid);
                const sellerSubtotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                return (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-50 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-mono text-gray-400">ORDER_REF: <span className="text-gray-900 font-bold">{order.id}</span></div>
                        <div className="text-gray-400">Buyer: <span className="text-gray-700 font-semibold">{order.buyerEmail}</span></div>
                      </div>

                      <div className="flex flex-wrap gap-2.5 items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          Payment: {order.paymentStatus}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === "delivered" ? "bg-green-150 text-green-700" :
                          order.status === "shipped" ? "bg-blue-150 text-blue-700" :
                          order.status === "paid" ? "bg-indigo-55 text-indigo-700" : "bg-neutral-150 text-neutral-700"
                        }`}>
                          Status: {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="py-3 text-xs space-y-2">
                      <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Purchased Items ({itemDetails.length})</p>
                      {itemDetails.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span>MWK {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="bg-gray-50 p-2.5 rounded-lg text-xs flex justify-between items-center font-bold text-gray-800 mt-2.5">
                        <span>Your Revenue Share:</span>
                        <span className="text-indigo-600 text-sm font-black">MWK {sellerSubtotal.toFixed(2)}</span>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Order Updates trigger email logs</span>
                      
                      {/* Delivery and shipping workflow controls */}
                      <div className="flex gap-2">
                        {order.status === "paid" && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, "shipped")}
                            className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black px-4 py-1.8 rounded-lg shadow-sm transition"
                          >
                            Mark As Shipped
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, "delivered")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-1.8 rounded-lg shadow-sm transition"
                          >
                            Mark As Delivered
                          </button>
                        )}
                        {order.status === "pending" && (
                          <p className="text-xs font-semibold text-amber-600 italic">Awaiting payment verification before ship.</p>
                        )}
                        {order.status === "delivered" && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Sale Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS SECTION */}
      {activeSubTab === "settings" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs max-w-xl">
          <h3 className="text-sm font-black text-gray-800 mb-3">Merchant storefront Information</h3>
          <form onSubmit={handleUpdateStore} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-500 font-semibold mb-1">Proposed Storefront Display Name</label>
              <input
                type="text"
                required
                value={storeNameState}
                onChange={(e) => setStoreNameState(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50"
                placeholder="My Store LLC"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-semibold mb-1">Store Mini-Bio / Seller Description</label>
              <textarea
                required
                rows={4}
                value={storeDescriptionState}
                onChange={(e) => setStoreDescriptionState(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50 resize-y"
                placeholder="Brief summary introducing what your store sells, brand guarantees, and dispatch times."
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-black hover:shadow text-xs transition"
            >
              Update Storefront Bio
            </button>
          </form>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT FORM DRAWER */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6.5 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCancel}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-120 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-black text-neutral-900 mb-4" id="modal-product-title">
              {editingProduct ? "Modify Marketplace Listing" : "Upload New Marketplace Listing"}
            </h3>

            <form onSubmit={handleSubmitProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Leather Watch, Cyber Headphones"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50"
                  id="form-product-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">General Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50 text-xs font-semibold"
                  >
                    <option>Electronics</option>
                    <option>Audio</option>
                    <option>Wearables</option>
                    <option>Home & Living</option>
                    <option>Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-500 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 50"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-500 mb-1">Price Unit (MWK)</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    placeholder="e.g. 49.99"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-500 mb-1">Product Image URL</label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50"
                    placeholder="e.g. https://images.unsplash..."
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Description Specs</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail user specifications, dimensions, features, speed, shipping speeds..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2.5 outline-none focus:border-violet-500 bg-gray-50 resize-no"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-200 px-4.5 py-2.2 font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 hover:bg-violet-700 px-5 py-2.2 font-black text-white shadow transition"
                >
                  {editingProduct ? "Save Updates" : "Publish to Marketplace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
