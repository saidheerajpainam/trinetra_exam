import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

// 👉 IMPORT YOUR TRINETRA LOGO
import logo from "@/assets/trinetra-logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirects back to login page
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      
      {/* LEFT SIDE: Logo and Title */}
      {/* 🔴 FIXED: Now correctly links to /exam-selection */}
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/exam-selection")}>
        <img 
          src={logo} 
          alt="Trinetra Logo" 
          className="h-10 object-contain" 
        />
        <span className="font-bold text-lg text-slate-800 hidden sm:block tracking-tight">
          Trinetra Exam Portal
        </span>
      </div>

      {/* RIGHT SIDE: User Profile and Logout */}
      <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <User size={18} className="text-slate-400" />
          <span className="capitalize">{user?.name || "Student"}</span>
        </div>
        
        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div> {/* Subtle divider line */}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-red-600 transition-colors duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

    </nav>
  );
}