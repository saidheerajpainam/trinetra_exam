import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FiGrid,
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiChevronRight
} from "react-icons/fi";
import logo from "../assets/trinetra-logo.png";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FiGrid },
    { name: "Manage Exams", path: "/admin/exams", icon: FiBookOpen },
    { name: "Manage Questions", path: "/admin/questions", icon: FiHelpCircle },
    { name: "Manage Students", path: "/admin/students", icon: FiUsers },
    { name: "Results", path: "/admin/results", icon: FiFileText },
    { name: "Malpractice Report", path: "/admin/malpractice", icon: FiAlertTriangle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get active page name for header title
  const activeItem = menuItems.find((item) => item.path === location.pathname);
  const pageTitle = activeItem ? activeItem.name : "Admin Panel";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="bg-white h-16 flex md:hidden items-center px-4 border-b border-slate-200 z-50 justify-between w-full">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Trinetra" className="h-[30px]" />
          <span className="text-slate-400 text-xs font-bold px-2 border-l border-slate-200">Admin</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-650 hover:text-green-600 focus:outline-none text-2xl"
        >
          {isMobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed md:sticky top-0 h-screen z-40 transition-transform duration-300 transform md:transform-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Trinetra Logo" className="h-[28px] object-contain" />
            <div className="flex flex-col pl-2 border-l border-slate-200 leading-tight">
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-500 font-semibold">Panel</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 text-lg ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.name}
                </div>
                {isActive && <FiChevronRight className="text-white text-xs" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Capsule */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-red-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
              <FiShield className="text-base" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-850 text-xs text-slate-800 leading-none truncate max-w-[100px]">
                  {user?.name || "Trinetra Admin"}
                </span>
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-sm leading-none">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1 truncate">
                {user?.email || "admin@trinetra.com"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 w-full rounded-lg transition-all gap-2"
          >
            <FiLogOut className="text-sm" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white h-16 border-b border-slate-200 px-8 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Trinetra Logo" className="h-[28px] object-contain" />
            <span className="text-slate-300 text-sm">|</span>
            <span className="text-slate-500 font-bold text-sm">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-black rounded-lg">
              Admin
            </span>
            <span className="text-slate-700 font-bold text-sm">
              {user?.name || "Trinetra Admin"}
            </span>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 md:hidden"
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
