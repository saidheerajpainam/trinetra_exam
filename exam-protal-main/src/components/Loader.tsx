import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default Loader;
