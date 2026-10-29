import type { Metadata } from "next";
import { getSessionDetails } from "@/lib/auth/session-details";
import {
    generateAsyncTitle,
    generateAsyncDescription,
    type MetadataGeneratorProps,
} from "@/lib/seo";
import {
    PrivateDashboardSidebar,
    SidebarProvider,
    PrivateDashboardLayoutContent,
} from "@/features/private/dashboard/components";
import { redirect } from "next/navigation";

const pageData: MetadataGeneratorProps = {
    title: "Panel",
    description: "Panel del Sistema",
};

export async function generateMetadata(): Promise<Metadata> {
    const dynamicTitle = await generateAsyncTitle(pageData.title);
    const dynamicDescription = await generateAsyncDescription(pageData.description);

    return {
        title: dynamicTitle,
        description: dynamicDescription,
    };
}

export default async function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, userRole } = await getSessionDetails();
    if (!currentUser) {
        return redirect("/iniciar-sesion");
    }

    return (
        <SidebarProvider>
            <div className="flex flex-1 min-h-[calc(100vh-4rem)] bg-background text-foreground">
                <PrivateDashboardSidebar userRole={userRole} />
                <PrivateDashboardLayoutContent>
                    {children}
                </PrivateDashboardLayoutContent>
            </div>
        </SidebarProvider>
    );
}
