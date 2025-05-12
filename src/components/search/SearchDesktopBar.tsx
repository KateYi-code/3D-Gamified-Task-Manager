import { CiSearch } from "react-icons/ci"
import Link from "next/link"
import { useState, useEffect } from "react"
import { client } from "@/endpoints/client";

export function SearchBox() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!query) return
    const timeout = setTimeout(async () => {
      const users = await client.unauth.search(query)
      setResults(users)
    }, 300) // debounce 300ms

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    setShowDropdown(!!query.trim())
  }, [query])

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ID, Name, or Email"
        className="w-full rounded-full bg-gray-100 text-sm px-4 py-2 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // delay to allow click on dropdown
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
      >
        <CiSearch size={20} />
      </button>

      {showDropdown && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white shadow-lg border rounded-md z-50">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex flex-col px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              onMouseDown={(e) => e.preventDefault()} // prevent blur on input
            >
              <span className="font-medium">{user.name || "Unnamed User"}</span>
              <span className="text-xs text-gray-500">{user.email || "Undefined Email"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}