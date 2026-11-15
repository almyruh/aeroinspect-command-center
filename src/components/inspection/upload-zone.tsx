import { useCallback, useRef, useState } from "react";
import { ImageUp, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/tiff"];

export function UploadZone({
  onFile,
  compact = false,
  accept = DEFAULT_ACCEPT,
  acceptLabel = "JPG, PNG, WEBP or TIFF",
  disabled = false,
}: {
  onFile: (file: File) => void;
  compact?: boolean;
  accept?: readonly string[];
  acceptLabel?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file || disabled) return;
      if (!accept.includes(file.type)) {
        setError(`Unsupported file. Use ${acceptLabel}.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError("File exceeds 25 MB limit.");
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile, accept, acceptLabel, disabled],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-dashed bg-blueprint transition-colors",
        compact ? "gap-4 px-5 py-4" : "flex-col gap-4 px-6 py-12 text-center",
        dragging ? "border-primary bg-primary/5 shadow-glow" : "border-border-strong hover:border-primary/60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary",
          compact ? "size-10" : "size-16",
        )}
      >
        {dragging ? <ImageUp className={compact ? "size-5" : "size-7"} /> : <UploadCloud className={compact ? "size-5" : "size-7"} />}
      </div>
      <div className={cn(compact ? "flex-1 text-left" : "")}>
        <p className={cn("font-display font-semibold", compact ? "text-base" : "text-xl")}>
          {dragging ? "Release to load component image" : "Drag & drop a component image"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {acceptLabel} up to 25 MB · Borescope, macro and hangar captures supported
        </p>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      </div>
      <Button
        variant={compact ? "panel" : "signal"}
        size={compact ? "sm" : "default"}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
    </div>
  );
}
