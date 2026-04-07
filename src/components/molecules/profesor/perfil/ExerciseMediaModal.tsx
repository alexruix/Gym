import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayCircle, Image as ImageIcon, X } from "lucide-react";

interface ExerciseMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mediaUrl: string | null;
}

export function ExerciseMediaModal({ isOpen, onClose, title, mediaUrl }: ExerciseMediaModalProps) {
  if (!mediaUrl) return null;

  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/) || mediaUrl.includes("youtube") || mediaUrl.includes("vimeo");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-zinc-950 border-zinc-800 rounded-[2rem] shadow-2xl">
        <DialogHeader className="p-6 bg-zinc-900/50 border-b border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              {isVideo ? (
                <PlayCircle className="w-5 h-5 text-lime-400" />
              ) : (
                <ImageIcon className="w-5 h-5 text-lime-400" />
              )}
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight text-white uppercase italic">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="aspect-video w-full bg-black flex items-center justify-center relative group">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={title}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="p-4 bg-zinc-900/30 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Técnica y Ejecución â€¢ MiGym AI Engine
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
