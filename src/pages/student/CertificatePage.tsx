import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Certificate } from "@/services/api";
import logo from "@/assets/trinetra-logo.png";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCert() {
      try {
        if (!id) return;
        const data = await api.getCertificate(id);
        setCert(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load certificate");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!cert) return null;

  const formattedDate = new Date(cert.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center justify-center font-serif">
      {/* Stylesheet injection for A4 Landscape Printing isolation */}
      <style>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .non-printable {
            display: none !important;
          }
          .printable-certificate {
            width: 100% !important;
            height: 100% !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            border: 15px double #16a34a !important;
            box-shadow: none !important;
            background-color: white !important;
            box-sizing: border-box !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Buttons Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 non-printable font-sans">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-green-600 transition-colors"
        >
          <FiArrowLeft className="text-sm" />
          Back to Dashboard
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-md shadow-green-600/10 transition-all"
        >
          <FiDownload />
          Download PDF / Print
        </button>
      </div>

      {/* Certificate Sheet (A4 Landscape aspect ratio: ~1.41) */}
      <div className="printable-certificate w-full max-w-4xl bg-white border-[16px] border-double border-green-600 p-8 md:p-14 shadow-2xl rounded-sm text-center relative flex flex-col justify-between aspect-[1.41] select-none bg-radial from-white to-slate-50/50">
        
        {/* Decorative corner borders */}
        <div className="absolute top-4 left-4 right-4 bottom-4 border border-green-200 pointer-events-none"></div>

        {/* Certificate Header branding */}
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="Trinetra Logo"
            className="h-[50px] md:h-[65px] object-contain mb-4 filter drop-shadow-xs"
          />
          <span className="text-[10px] md:text-xs font-bold text-green-700 tracking-[0.25em] uppercase font-sans">
            Trinetra Drones & Robotics
          </span>
        </div>

        {/* Certificate Core Text */}
        <div className="space-y-6 my-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-wide uppercase font-serif">
            Certificate of Achievement
          </h2>
          <p className="text-slate-500 italic text-sm md:text-base">This certifies that</p>
          <h3 className="text-2xl md:text-4xl font-extrabold text-green-800 underline underline-offset-8 decoration-green-600/35 tracking-wide capitalize">
            {cert.user?.name}
          </h3>
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            has successfully completed the online exam in
            <span className="font-extrabold text-slate-800 capitalize italic block text-base md:text-lg mt-1.5">
              "{cert.subject}"
            </span>
            conducted by Trinetra Drones & Robotics, showcasing proficient theoretical and technical skills.
          </p>
        </div>

        {/* Certificate Footer */}
        <div className="grid grid-cols-3 gap-6 items-end mt-6 font-sans">
          {/* Left: Cert Code */}
          <div className="text-left">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
              Certificate Number
            </span>
            <span className="text-[11px] text-slate-700 font-extrabold font-mono mt-1 block">
              {cert.certificateNo}
            </span>
          </div>

          {/* Center: Score Card */}
          <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-2 max-w-[140px] mx-auto">
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
              Grade Score
            </span>
            <span className="text-[13px] text-green-700 font-black mt-0.5 block">
              {cert.percentage ? `${cert.percentage}% Pass` : "Passed"}
            </span>
          </div>

          {/* Right: Signature area */}
          <div className="text-right flex flex-col items-end">
            <div className="text-green-700 italic font-cursive text-lg pr-4 font-extrabold select-none select-none">
              Trinetra Drones
            </div>
            <div className="w-36 border-t border-slate-300 mt-1"></div>
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mt-1 pr-6">
              Authorized Signatory
            </span>
            <span className="text-[9px] text-slate-300 font-semibold block mt-0.5 pr-8">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
