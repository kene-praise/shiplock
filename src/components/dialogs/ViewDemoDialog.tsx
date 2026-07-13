"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  videoUrl: string;
  onCloseUrl: string;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Loom
  if (url.includes("loom.com/share/")) {
    const parts = url.split("loom.com/share/");
    const id = parts[1]?.split("?")[0];
    if (id) return `https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true&hide_title=true&hide_embed_sign_up=true`;
  }
  
  // YouTube
  if (url.includes("youtube.com/watch")) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7]?.length === 11) return `https://www.youtube.com/embed/${match[7]}`;
  }
  if (url.includes("youtu.be/")) {
    const parts = url.split("youtu.be/");
    const id = parts[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }
  
  return url;
}

export function ViewDemoDialog({ title, videoUrl, onCloseUrl }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push(onCloseUrl);
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <AppDialog open={open} onClose={handleClose} title={title} width="lg">
      <DialogBody className="p-0 overflow-hidden flex flex-col bg-black">
        {embedUrl ? (
          <div className="relative w-full aspect-video">
            <iframe
              src={embedUrl}
              frameBorder="0"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="p-10 text-center text-white">
            <p className="text-sm">Video URL is invalid or unsupported for direct playback.</p>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline mt-2 inline-block">
              Open link in new tab
            </a>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <button type="button" onClick={handleClose} className="btn-secondary">
          Close
        </button>
      </DialogFooter>
    </AppDialog>
  );
}
