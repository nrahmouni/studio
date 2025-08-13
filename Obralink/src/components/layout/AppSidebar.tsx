
"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebarNav } from "./AppSidebarNav";

export function AppSidebar() {

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground print:hidden">
      <ScrollArea className="flex-1">
        <AppSidebarNav />
      </ScrollArea>
      <div className="p-4 border-t border-sidebar-border">
        {/* Footer content for sidebar, e.g., version number or quick links */}
        <p className="text-xs text-sidebar-muted-foreground text-center">
          ObraLink &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
