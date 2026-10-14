"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { categories, tools } from "@/config/tools-registry";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ToolIcon } from "@/components/shared/ToolIcon";
import { useAppStore } from "@/lib/store";
import { useState } from "react";

export function CommandMenu() {
  const open = useAppStore((state) => state.commandOpen);
  const setOpen = useAppStore((state) => state.setCommandOpen);
  const recent = useAppStore((state) => state.recent);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useAppStore.getState().toggleCommand();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const recentTools = mounted
    ? recent.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool) => tool !== undefined)
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search tools</DialogTitle>
        <DialogDescription className="sr-only">Search every Gen Z Tools utility and jump to it.</DialogDescription>
        <Command label="Search tools" className="bg-popover text-popover-foreground">
          <Command.Input
            ref={inputRef}
            placeholder="Search tools, like PDF to Word or JSON…"
            className="h-12 w-full border-b bg-transparent px-4 pr-10 text-sm outline-none"
          />
          <Command.List className="max-h-[min(24rem,60dvh)] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching tools.
            </Command.Empty>
            {recentTools.length > 0 ? (
              <Command.Group heading="Recent">
                {recentTools.map((tool) => (
                  <Command.Item
                    key={`recent-${tool.slug}`}
                    value={`recent ${tool.name} ${tool.keywords.join(" ")}`}
                    onSelect={() => go(tool.href)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
                  >
                    <ToolIcon name={tool.icon} className="size-4 text-muted-foreground" />
                    {tool.name}
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
            {categories.map((category) => (
              <Command.Group key={category.slug} heading={category.name}>
                {tools
                  .filter((tool) => tool.category === category.slug)
                  .map((tool) => (
                    <Command.Item
                      key={tool.slug}
                      value={`${tool.name} ${category.name} ${tool.keywords.join(" ")}`}
                      onSelect={() => go(tool.href)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
                    >
                      <ToolIcon name={tool.icon} className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{tool.name}</span>
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
