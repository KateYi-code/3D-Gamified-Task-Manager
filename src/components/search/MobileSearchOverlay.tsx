import { useState, useEffect } from "react";
import { client } from "@/endpoints/client";
import Link from "next/link";

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-4">
      {/* top input and return */}
      <div className="flex items-center mb-4">
        <button
          onClick={onClose}
          className="text-gray-500 text-lg mr-4"
        >
          ←
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ID, Name, or Email"
          className="flex-1 rounded-full bg-gray-100 text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          autoFocus
        />
      </div>

      {/* show result */}
      <div className="flex-1 overflow-y-auto">
        {results.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="block px-4 py-3 border-b hover:bg-gray-100"
            onClick={onClose}
          >
            <div className="font-medium">{user.name || "Unnamed User"}</div>
            <div className="text-sm text-gray-500">{user.email || "Undefined Email"}</div>
          </Link>
        ))}

        {!results.length && query && (
          <div className="text-center text-sm text-gray-400 mt-8">No results found</div>
        )}
      </div>
    </div>
  );
}