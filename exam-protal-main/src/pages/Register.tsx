import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/trinetra-logo.png";

function generateHallTicket(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "TRI-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const passwordChecks = [
  { label: "8–16 characters", test: (p: string) => p.length >= 8 && p.length <= 16 },
  { label: "Contains a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [idType, setIdType] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const hallTicket = useState(() => generateHallTicket())[0];

  const emailValid = /^[^\s@]+@gmail\.com$/i.test(email.trim());
  const mobileValid = /^[6-9]\d{9}$/.test(mobile.trim());
  const allPasswordChecksPass = passwordChecks.every((c) => c.test(password));

  const validate = (): string | null => {
    if (!name.trim()) return "Full name is required.";
    if (!emailValid) return "Enter valid Gmail.";
    if (!mobileValid) return "Enter valid 10-digit Indian mobile number.";
    if (!allPasswordChecksPass) return "Weak password.";
    if (!idType) return "Select ID type.";
    if (idType === "college" && !collegeId.trim()) return "Enter College ID.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      toast({ variant: "destructive", title: "Error", description: err });
      return;
    }

    try {
      setLoading(true);
      const data = await api.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        idType,
        collegeId: collegeId.trim(),
        hallTicket,
      });

      login(data.token, data.user);
      toast({ title: "Registered successfully", description: `Hall Ticket: ${hallTicket}` });
      navigate("/exam-selection");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-primary/5 px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Trinetra Logo" className="max-h-[90px]" />
          <p className="text-sm text-muted-foreground mt-2">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Fill all details. Duplicate email, mobile, hall ticket, or user ID is blocked.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Gmail</Label>
                <Input placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {passwordChecks.map((check) => {
                    const ok = check.test(password);
                    return (
                      <div key={check.label} className="flex items-center gap-2">
                        {ok ? <CheckCircle2 size={14} className="text-green-600" /> : <XCircle size={14} className="text-red-500" />}
                        <span>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID Type</Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger><SelectValue placeholder="Select ID Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="college">College ID</SelectItem>
                    <SelectItem value="hallTicket">Hall Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {idType === "college" && (
                <div className="space-y-2">
                  <Label>College ID</Label>
                  <Input placeholder="Enter College ID" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} />
                </div>
              )}

              <div className="rounded-lg bg-muted p-3 text-sm">
                Generated Hall Ticket: <b>{hallTicket}</b>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
