"use client";

import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react";
import { CopyButton } from "./copy-button";

interface TerminalBlockProps {
  command?: string;
  output?: string;
  title?: string;
}

export function TerminalBlock({
  command,
  output,
  title = "Terminal",
}: TerminalBlockProps) {
  const copyText = [command ? `$ ${command}` : "", output].filter(Boolean).join("\n");

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-[#28283a] bg-[#1a1a22]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[#28283a] bg-[#121218] px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#8a8a9a]" />
          <span className="text-xs font-medium text-[#8a8a9a]">{title}</span>
        </div>
        <CopyButton
          text={copyText}
          className="opacity-0 group-hover:opacity-100"
        />
      </div>

      {/* Terminal content */}
      <pre className="overflow-x-auto border-0 bg-transparent p-4 m-0 rounded-none">
        <code className="text-sm leading-relaxed text-[#e8e6e3]">
          {command && (
            <div>
              <span className="text-[#5cb870] font-bold select-none">$ </span>
              <span className="text-[#e8e6e3]">{command}</span>
            </div>
          )}
          {output && (
            <div className={cn("text-[#8a8a9a]", command && "mt-1")}>
              {output}
            </div>
          )}
        </code>
      </pre>
    </div>
  );
}
