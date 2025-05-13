import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import { MobileSearchOverlay } from "@/components/search/MobileSearchOverlay";
import { Button } from "@/components/ui/button";

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={"ghost"} onClick={() => setOpen(true)} className="md:hidden">
        <CiSearch size={22} />
      </Button>

      {open && <MobileSearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
