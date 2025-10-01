import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { User, Key, Settings, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenResetPassword: () => void;
  onOpenSettings: () => void;
}

export function ProfileSheet({ 
  open, 
  onOpenChange,
  onOpenResetPassword,
  onOpenSettings 
}: ProfileSheetProps) {
  const { user } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif">Profile</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center mt-8 mb-8">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-lg text-foreground font-medium">{user?.email}</p>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <button
            onClick={onOpenResetPassword}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Reset Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
