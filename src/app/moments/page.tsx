"use client";

import { useAuth } from "@/providers/auth-provider";
import SinglePost from "@/components/moment/singlePost";
import { useQuery } from "@/hooks/useQuery";

import { useEffect } from "react";

export default function MomentsPage() {
  const { user, loading } = useAuth();
  
  const { data: targets } = useQuery("getMyFollowingMoments");
  console.log("targets", targets);

  // sample data — replace with your real posts
  // const posts = [
  //   { id: 1, date: "1 Jan 2025", time: "10:33" },
  //   { id: 2, date: "2 Jan 2025", time: "14:45" },
  //   { id: 3, date: "3 Jan 2025", time: "09:12" },
  // ];
  var userPosts = targets

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Please log in to see your moments timeline.</h2>
      </div>
    );
  }

  return (

    
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Moments Timeline</h1>
      <div style={{display:"flex"}}>

      <div className="w-1/3 pr-4">
        {/* 1) border-l creates the vertical line */}
      <ul className="relative border-l-2 border-gray-300">
  {userPosts?.map((entry, idx) =>
    entry.posts.map((post, i) => (
      <li key={`${idx}-${i}`} className="relative pl-2 mb-2">
        <div className="absolute -left-2 top-0 flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full z-10" />
          <span className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="mt-8 pt-6">
          <SinglePost
            onClick={() => alert("clicked!")}
            className="hover:bg-gray-100 cursor-pointer"
            post={{
              ...post,
              user: entry.user, // ensure SinglePost sees author info
            }}
          />
        </div>
      </li>
    ))
  )}
</ul>
      </div>
      <div className="w-2/3">
      </div>
      </div>

    </div>
    
    // <div className="container mx-auto px-4 py-8">
    //   <h1 className="text-2xl font-bold mb-6">Moments</h1>
    //   <div className="bg-white rounded-lg shadow p-6">
    //     {loading ? (
    //       <div className="text-center py-8">
    //         <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
    //         <p className="mt-2 text-gray-600">Loading...</p>
    //       </div>
    //     ) : user ? (
    //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //         {/* Placeholder content for moments page */}
    //         {[1, 2, 3, 4, 5, 6].map((item) => (
    //           <div key={item} className="bg-gray-50 rounded-lg p-4 shadow-sm">
    //             <div className="w-full h-40 bg-gray-200 rounded-md mb-3"></div>
    //             <h3 className="text-lg font-medium text-gray-800">Moment Title {item}</h3>
    //             <p className="text-gray-600 text-sm mt-1">This is a placeholder for a moment card.</p>
    //             <div className="flex justify-between items-center mt-4">
    //               <span className="text-xs text-gray-500">2 hours ago</span>
    //               <button className="text-blue-600 text-sm hover:text-blue-800">View Details</button>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     ) : (
    //       <div className="text-center py-8">
    //         <h2 className="text-xl font-semibold text-gray-800 mb-2">Moments Timeline</h2>
    //         <p className="text-gray-600 mb-4">Please log in to see your moments timeline.</p>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
}