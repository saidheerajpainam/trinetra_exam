import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FiGrid,
  FiBookOpen,
  FiAward,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";
import logo from "../assets/trinetra-logo.png";

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: FiGrid },
    { name: "Exams", path: "/exam-selection", icon: FiBookOpen },
    { name: "Results", path: "/results", icon: FiAward },
    { name: "Profile", path: "/profile", icon: FiUser },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* BRANDING LOGO (Fixed top-left) */}
      <div className="bg-white md:bg-transparent h-16 md:h-0 flex items-center px-4 border-b md:border-b-0 border-slate-200 z-50">
        <Link to="/dashboard">
          <img
            src={logo}
            alt="Trinetra Drones & Robotics"
            className="h-[36px] md:h-[60px] fixed top-3 left-4 md:top-4 md:left-6 z-50 transition-all duration-300"
          />
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="ml-auto md:hidden text-slate-600 hover:text-green-600 focus:outline-none text-2xl"
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
        {/* Spacer for the fixed logo height */}
        <div className="h-24 hidden md:block"></div>
        <div className="h-16 block md:hidden"></div>

        {/* User Info Capsule */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Profile</p>
          <p className="text-sm font-bold text-slate-800 truncate mt-1">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-green-600"
                }`}
              >
                <Icon className={`mr-3 text-lg ${isActive ? "text-white" : "text-slate-400 group-hover:text-green-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <FiLogOut className="mr-3 text-lg text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

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

export default StudentLayout;
