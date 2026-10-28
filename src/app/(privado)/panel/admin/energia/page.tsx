import { Suspense } from "react";
import { getSessionDetails } from "@/lib/auth/session-details";
import {
    generateAsyncTitle,
    generateAsyncDescription,
} from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { PrivateDashboardHeader } from "@/features/private/dashboard/components";
import { AdminEnergyGrid } from "@/features/private/dashboard/admin/auditoria/components";

const pageData = {
    title: "Monitoreo Energético",
    description: "Supervisión de telemetría de baterías y consumo eléctrico de estaciones",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(pageData.description),
    };
}

export default async function AdminEnergyPage() {
    const { currentUser, userRole } = await getSessionDetails();

    if (!currentUser) {
        return redirect("/iniciar-sesion");
    }

    if (!hasRequiredRole(userRole, STAFF_ROLES)) {
        return redirect("/panel");
    }

    return (
        <div className="space-y-6">
            <PrivateDashboardHeader
                title={pageData.title}
                subtitle={pageData.description}
            />

            <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-lg bg-muted/60" />}>
                <AdminEnergyGrid />
            </Suspense>
        </div>
    );
}
