import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvalidateQuery } from "@/hooks/useQuery";
import { client } from "@/endpoints/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@/hooks/useQuery";
import { fileToBase64 } from "../../lib/utils";


export const createPostModal = ({ open, onOpenChange }) => {
  const invalidate = useInvalidateQuery();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [taskId, setTaskId] = useState("");
  const { data: tasks = [] } = useQuery("getMyTasks");
  const onFileChange = (e) => {
    if (e.target.files) setImages(Array.from(e.target.files));
  };
  console.log(tasks)
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1) upload images (example endpoint—adjust to your backend)
      const form = new FormData();
      form.append("description", description);
      images.forEach((img) => form.append("images", img));

      const base64Images = await Promise.all(images.map((img) => fileToBase64(img)));
      const data = await client.authed.createNewPost({ taskId, description, images: base64Images });
      alert("Post liked successfully");
      console.log("this is data", data);


      // 2) re-fetch your feed
      await invalidate("getMyFollowingMoments");

      // 3) close
      onOpenChange(false);
      setDescription("");
      setImages([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Moment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell your followers what’s up…"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Related Task</label>
            <select
              value={taskId}
              onChange={(e) => { setTaskId(e.target.value); console.log(e.target.value) }}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">— none —</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>

            <div
              className="
            relative 
            border-2 border-dashed border-gray-300 
            rounded-md 
            h-32
            flex items-center justify-center
            cursor-pointer
            hover:border-gray-400
            "
            >
              {/* Native input covers the entire box, but invisible */}
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {/* Custom placeholder / file count */}
              {images.length > 0 ? (
                <span className="text-gray-700">
                  {images.length} file{images.length > 1 ? "s" : ""} selected
                </span>
              ) : (
                <span className="text-gray-400">
                  Click or drag files here
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Posting…" : "Post Moment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
