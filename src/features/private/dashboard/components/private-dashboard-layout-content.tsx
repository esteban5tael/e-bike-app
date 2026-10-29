"use client";

import { useSidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PrivateDashboardLayoutContent({
    children,
}: {
    children: ReactNode;
}) {
    const { isCollapsed } = useSidebar();

    return (
        <main
            className={cn(
                "flex-1 transition-all duration-300 flex flex-col min-w-0 w-full overflow-hidden",
                isCollapsed ? "md:pl-16" : "md:pl-64",
            )}
        >
            <div className="p-4 md:p-8 flex-1 min-w-0 w-full overflow-x-hidden">
                {children}
            </div>
        </main>
    );
}
