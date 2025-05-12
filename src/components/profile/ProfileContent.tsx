import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

// example data
const posts = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  title: "Good Morning☀️",
  image: "/subway-photo.png",
  likes: 1234,
}));

export default function ProfileContent() {
  return (
    <div className="max-w-5xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <Image
            src={post.image}
            alt="post"
            width={500}
            height={200}
            className="w-full h-48 object-cover"
          />
          <CardContent className="p-2">
            <div className="text-sm font-semibold">{post.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">❤️ {post.likes}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
