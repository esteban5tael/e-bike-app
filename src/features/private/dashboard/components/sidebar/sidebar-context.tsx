"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = "ebike_sidebar_collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        try {
            return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });

    const handleSetCollapsed = (collapsed: boolean | ((prev: boolean) => boolean)) => {
        setIsCollapsed((prev) => {
            const next = typeof collapsed === "function" ? collapsed(prev) : collapsed;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            } catch {
                // Ignore localStorage errors
            }
            return next;
        });
    };

    const toggleCollapsed = () => {
        handleSetCollapsed((prev) => !prev);
    };

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                setIsCollapsed: handleSetCollapsed,
                toggleCollapsed,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
