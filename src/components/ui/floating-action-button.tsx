
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(({ onClick, className }, ref) => {
  return (
    <Button
      ref={ref}
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hero-gradient",
        "md:hidden", // Only show on mobile
        className
      )}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";
