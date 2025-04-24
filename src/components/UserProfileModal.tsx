
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { shortenAddress } from "@/services/api";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  name?: string;
  stats?: {
    transactions?: number;
    totalValue?: number;
    preferredToken?: string;
    change?: number;
  };
}

const UserProfileModal = ({
  open,
  onOpenChange,
  address,
  name,
  stats,
}: UserProfileModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{name || shortenAddress(address)}</DialogTitle>
      </DialogHeader>
      <div className="space-y-2 pt-2">
        <div className="text-xs text-muted-foreground">Address: {shortenAddress(address)}</div>
        {stats && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k}>
                <b>{k}:</b> {typeof v === "number" ? v.toLocaleString() : v}
              </div>
            ))}
          </div>
        )}
        <div className="pt-4 text-xs text-muted-foreground italic">
          (User profile details coming soon)
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default UserProfileModal;
