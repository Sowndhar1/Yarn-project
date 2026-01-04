import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";
import Storefront from "./pages/Storefront.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Favorites from "./pages/Favorites.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StockManagement from "./pages/StockManagement.jsx";
import PurchaseEntry from "./pages/PurchaseEntry.jsx";
import SalesEntry from "./pages/SalesEntry.jsx";
import About from "./pages/About.jsx";
import Login from "./pages/Login.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import CustomerLogin from "./pages/CustomerLogin.jsx";
import CustomerRegister from "./pages/CustomerRegister.jsx";
import MyAccount from "./pages/customer/MyAccount.jsx";
import OrderHistory from "./pages/customer/OrderHistory.jsx";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails.jsx";
import LoginSecurity from "./pages/customer/LoginSecurity.jsx";
import YourAddresses from "./pages/customer/YourAddresses.jsx";
import TrackPackage from "./pages/customer/TrackPackage.jsx";
import SalesDashboard from "./pages/sales/SalesDashboard.jsx";
import InventoryDashboard from "./pages/inventory/InventoryDashboard.jsx";
import ProductManagement from "./pages/inventory/ProductManagement.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-loomGray">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div
        className={`flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? "ml-[300px]" : "ml-0"
          }`}
      >
        <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-grow px-4 pb-16 pt-6 sm:px-8">
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute roles={["customer", "admin", "sales_staff", "inventory_staff"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={["customer", "admin", "sales_staff", "inventory_staff"]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout/success/:id"
              element={
                <ProtectedRoute roles={["customer", "admin", "sales_staff", "inventory_staff"]}>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute roles={["customer", "admin", "sales_staff", "inventory_staff"]}>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Sales Staff Routes */}
            <Route
              path="/sales/*"
              element={
                <ProtectedRoute roles={["admin", "sales_staff"]}>
                  <SalesDashboard />
                </ProtectedRoute>
              }
            />

            {/* Inventory Staff Routes */}
            <Route
              path="/inventory/products"
              element={
                <ProtectedRoute roles={["admin", "inventory_staff"]}>
                  <ProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/products/edit/:id"
              element={
                <ProtectedRoute roles={["admin", "inventory_staff"]}>
                  <ProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/*"
              element={
                <ProtectedRoute roles={["admin", "inventory_staff"]}>
                  <InventoryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/my-account"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account/orders"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account/orders/:id"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerOrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account/track/:id"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <TrackPackage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account/security"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <LoginSecurity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-account/addresses"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <YourAddresses />
                </ProtectedRoute>
              }
            />

            {/* Legacy Staff Routes (to be deprecated) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["admin", "sales_staff"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute roles={["admin", "inventory_staff"]}>
                  <StockManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases/new"
              element={
                <ProtectedRoute roles={["admin", "inventory_staff"]}>
                  <PurchaseEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales/new"
              element={
                <ProtectedRoute roles={["admin", "sales_staff"]}>
                  <SalesEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/account"
              element={
                <ProtectedRoute roles={["admin", "sales_staff", "inventory_staff"]}>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
