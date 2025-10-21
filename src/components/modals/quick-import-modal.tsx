import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickImportModal({ open, onOpenChange }: QuickImportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Import Candidate</DialogTitle>
          <DialogDescription>
            Quick import functionality will be implemented here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Quick Import</h3>
            <p className="text-gray-500 mt-2">Resume upload and candidate form will be displayed here</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>
            Import Candidate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}