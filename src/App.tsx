import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import TemplatePage from "@/pages/TemplatePage";
import Account from "@/pages/Account";
import About from "@/pages/About";
import Jobs from "@/pages/Jobs";
import Contact from "@/pages/Contact";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCanceled from "@/pages/PaymentCanceled";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import Governance from "@/pages/Governance";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTemplates from "@/pages/admin/AdminTemplates";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminConversion from "@/pages/admin/AdminConversion";
import AdminPerformance from "@/pages/admin/AdminPerformance";
import AdminSales from "@/pages/admin/AdminSales";
import AdminMessages from "@/pages/admin/AdminMessages";
import AdminGuard from "@/components/features/AdminGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes — protected by password */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="conversion" element={<AdminConversion />} />
          <Route path="performance" element={<AdminPerformance />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-background font-body" dir="rtl">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/template/:id" element={<TemplatePage />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-canceled" element={<PaymentCanceled />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/governance/:size" element={<Governance />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
