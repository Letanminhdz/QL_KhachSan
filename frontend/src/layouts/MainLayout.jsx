import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 relative">
      <Navbar />
      <Outlet />
      <Footer />
      <ChatWidget />
    </div>
  );
}
