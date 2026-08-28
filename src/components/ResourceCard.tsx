import React from "react";
import { Resource } from "../types";
import { ExternalLink, BookOpen, Video, FileCode, Wrench, Bookmark } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark
}) => {
  const typeIcon = {
    course: Video,
    article: BookOpen,
    repository: FileCode,
    tool: Wrench,
    book: BookOpen,
  }[resource.type || "course"] || BookOpen;

  const Icon = typeIcon;

  return (
    <div className="group bg-[#141927] hover:bg-[#181f30] border border-[#2A2F3C] hover:border-[#03A9F4]/50 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-[#03A9F4]/10 text-[#03A9F4] border border-[#03A9F4]/30 rounded">
            {resource.type}
          </span>
          <div className="flex items-center gap-2">
            {resource.cost && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                resource.cost === "free" ? "text-[#4CAF50] bg-[#4CAF50]/10" : "text-[#FFC107] bg-[#FFC107]/10"
              }`}>
                {resource.cost === "free" ? "Gratuito" : resource.cost}
              </span>
            )}
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(resource.id)}
                className={`p-1 rounded hover:bg-[#2A2F3C] transition-colors ${
                  isBookmarked ? "text-[#FFC107]" : "text-[#9FA7B8]"
                }`}
                title="Guardar marcador"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h4 className="font-bold text-sm text-[#ECEFF4] group-hover:text-[#03A9F4] transition-colors mb-1.5 line-clamp-2">
          {resource.title}
        </h4>

        {resource.description && (
          <p className="text-xs text-[#9FA7B8] line-clamp-2 mb-3 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#2A2F3C] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#9FA7B8]">
          {resource.language ? resource.language.toUpperCase() : "ES/EN"}
        </span>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#03A9F4] hover:text-[#38bdf8] transition-colors"
        >
          <span>Abrir</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
