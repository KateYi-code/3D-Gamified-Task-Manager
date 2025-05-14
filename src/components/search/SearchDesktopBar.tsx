import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { useState, useEffect } from "react";
import { client } from "@/endpoints/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]); // Clear results when query is empty
      return;
    }
    const timeout = setTimeout(async () => {
      const users = await client.unauth.search(query);
      setResults(users);
    }, 300); // debounce 300ms

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (query.trim() && results.length > 0) {
      setShowDropdown(true);
    }
  }, [results, query]);

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setShowDropdown(true);
          }
        }}
        placeholder="Search ID, Name, or Email"
        className="w-full rounded-full text-sm px-4 py-2 pr-10"
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // delay to allow click on dropdown
      />
      <Button
        variant={"ghost"}
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground rounded-full"
      >
        <CiSearch size={20} />
      </Button>

      {showDropdown && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-background shadow-lg border rounded-md z-50">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex flex-col px-4 py-2 hover:bg-accent text-sm text-foreground"
              onMouseDown={(e) => e.preventDefault()} // prevent blur on input
            >
              <span className="font-medium">{user.name || "Unnamed User"}</span>
              <span className="text-xs">{user.email || "Undefined Email"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
