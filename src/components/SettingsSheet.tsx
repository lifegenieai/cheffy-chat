import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif">Settings</SheetTitle>
        </SheetHeader>

        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-lg">Settings coming soon</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
