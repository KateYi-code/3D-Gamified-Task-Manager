import { useEffect, useState } from "react";
import { client } from "@/endpoints/client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
}

export function MobileSearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(async () => {
      const users = await client.unauth.search(query);
      setResults(users);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col p-4">
      {/* top input and return */}
      <div className="flex items-center mb-4">
        <Button onClick={onClose} variant={"ghost"} className="text-lg mr-4">
          ←
        </Button>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ID, Name, or Email"
          className="flex-1 rounded-full text-sm px-4 py-2"
          autoFocus
        />
      </div>

      {/* show result */}
      <div className="flex-1 overflow-y-auto">
        {results.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="block px-4 py-3 border-b hover:bg-accent"
            onClick={onClose}
          >
            <div className="font-medium">{user.name || "Unnamed User"}</div>
            <div className="text-sm text-accent-foreground">{user.email || "Undefined Email"}</div>
          </Link>
        ))}

        {!results.length && query && (
          <div className="text-center text-sm text-accent-foreground mt-8">No results found</div>
        )}
      </div>
    </div>
  );
}
