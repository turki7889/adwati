"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
}

export default function UploadArea({
  onFileSelect,
  accept = "image/*",
  label = "اسحب وأفلت الصورة هنا",
  hint = "أو اضغط للاختيار",
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center
        transition-all duration-200
        ${
          isDragging
            ? "border-primary bg-primary-bg scale-[1.02]"
            : "border-border bg-bg-main hover:border-primary/50 hover:bg-bg-surface"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-5xl mb-4 opacity-30">📁</div>
      <p className="text-lg text-text-secondary font-medium mb-1">{label}</p>
      <p className="text-sm text-text-muted">{hint}</p>
    </div>
  );
}
