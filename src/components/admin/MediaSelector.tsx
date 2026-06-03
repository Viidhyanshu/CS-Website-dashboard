'use client';

import React, { useState, useEffect } from 'react';
import { listR2MediaFilesAction } from '@/lib/actions/media';
import { FolderOpen, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

interface MediaFile {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}

export default function MediaSelector({ value, onChange, label }: MediaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
  };

  useEffect(() => {
    if (open) {
      listR2MediaFilesAction('media')
        .then(res => {
          if (res.success) setFiles(res.files);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="flex gap-4 items-center">
        {value ? (
          <div className="relative w-24 h-16 rounded overflow-hidden border border-[#222] bg-black">
            <Image src={value} alt="Selected image" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-24 h-16 rounded border border-dashed border-[#333] flex items-center justify-center text-xs text-gray-600 bg-[#0c0c0c]">
            Empty
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://media.ieee-cs-muj.com/file.jpg"
            className="w-full bg-[#0c0c0c] border border-[#222] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#f9ba1f]"
          />
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-2 text-xs text-[#f9ba1f] hover:text-white font-medium transition-colors w-fit"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Pick from Media Library
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#1f1f1f] flex justify-between items-center bg-[#090909] rounded-t-xl">
              <h3 className="font-semibold text-white">Select Asset</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-black/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-[#f9ba1f] animate-spin" />
                  <p className="text-sm text-gray-500">Loading library files...</p>
                </div>
              ) : files.length === 0 ? (
                <p className="text-center text-gray-500 py-20 text-sm">No files uploaded. Go to Media Library to upload assets.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {files.map(file => (
                    <button
                      key={file.key}
                      onClick={() => {
                        onChange(file.url);
                        setOpen(false);
                      }}
                      className="group flex flex-col gap-2 p-2 rounded-lg border border-[#222] bg-[#0c0c0c] hover:border-[#f9ba1f] text-left transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black rounded overflow-hidden">
                        <Image src={file.url} alt={file.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-xs text-gray-400 truncate w-full font-mono">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
