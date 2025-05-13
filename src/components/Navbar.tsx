"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchBox } from "@/components/search/SearchDesktopBar";
import { MobileSearchTrigger } from "@/components/search/MobileSearchTrigger";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  // const [searchOpen, setSearchOpen] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Planet",
      path: "/planet",
      icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    },
    {
      name: "Moments",
      path: "/moments",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      name: "CountDownClock",
      path: "/countdownclock",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50 top-0 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-10">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/globe.svg" alt="Planet Logo" width={32} height={32} />
                <span className="text-xl font-bold text-blue-600">Planet</span>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.path
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            {/* Middle - Search bar */}
            <div className="flex-1 max-w-md mx-4 relative hidden md:flex items-center">
              <SearchBox />
            </div>

            {/*/!* Middle - Search bar *!/*/}
            {/*<div className="flex-1 max-w-md mx-4 relative hidden md:flex items-center">*/}
            {/*  <input*/}
            {/*    type="text"*/}
            {/*    placeholder="Search ID, Name, or Email"*/}
            {/*    className="w-full rounded-full bg-gray-100 text-sm px-4 py-2 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"*/}
            {/*  />*/}
            {/*  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500">*/}
            {/*    <CiSearch size={20} />*/}
            {/*  </button>*/}
            {/*</div>*/}

            {/* Right side - User section */}
            <div className="flex items-center">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span>My Profile</span>
                  </button>

                  {/* Profile dropdown */}
                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href={`/profile/${user.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white shadow-md fixed w-full z-50 top-0 h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/globe.svg" alt="Planet Logo" width={28} height={28} />
          <span className="text-lg font-bold text-blue-600">Planet</span>
        </Link>

        {/* Mobile Search Bar */}
        {/*  <button onClick={() => setSearchOpen(true)} className="text-gray-600">*/}
        <MobileSearchTrigger />

        {!loading && user && (
          <button onClick={() => setProfileOpen(!profileOpen)} className="focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>

            {/* Mobile Profile dropdown */}
            {profileOpen && (
              <div className="origin-top-right absolute right-4 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link
                    href={`/profile/${user.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    // className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    className="block text-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </button>
        )}

        {!loading && !user && (
          <Link
            href="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white shadow-lg fixed bottom-0 w-full z-50 border-t border-gray-200">
        <div className="flex flex-row justify-evenly">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-3 ${
                pathname === item.path ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={pathname === item.path ? "2" : "1.5"}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
