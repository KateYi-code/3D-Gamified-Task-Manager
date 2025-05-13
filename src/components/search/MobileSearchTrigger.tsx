import { CiSearch } from "react-icons/ci";
import { useState } from "react";
import { MobileSearchOverlay } from "@/components/search/MobileSearchOverlay";

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-gray-600 md:hidden">
        <CiSearch size={22} />
      </button>

      {open && <MobileSearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}