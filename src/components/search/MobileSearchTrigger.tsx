import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MobileSearchOverlay } from "@/components/search/MobileSearchOverlay";
import { Button } from "@/components/ui/button";

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button variant={"ghost"} onClick={() => setOpen(true)} className="md:hidden">
        <Search size={22} />
      </Button>

      {mounted &&
        open &&
        createPortal(<MobileSearchOverlay onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
