import { Suspense } from "react";
import { getSessionDetails } from "@/lib/auth/session-details";
import {
    generateAsyncTitle,
    generateAsyncDescription,
} from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { ADMIN_ROLES } from "@/lib/auth/roles.constants";
import { PrivateDashboardHeader } from "@/features/private/dashboard/components";
import { AdminAuditsGrid } from "@/features/private/dashboard/admin/auditoria/components";

const pageData = {
    title: "Auditoría del Sistema",
    description: "Registro cronológico y trazabilidad de eventos sobre los datos del sistema",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(pageData.description),
    };
}

export default async function AdminAuditsPage() {
    const { currentUser, userRole } = await getSessionDetails();

    if (!currentUser) {
        return redirect("/iniciar-sesion");
    }

    // ⚠️ La auditoría del sistema requiere rol exclusivo de administrador
    if (!hasRequiredRole(userRole, ADMIN_ROLES)) {
        return redirect("/panel");
    }

    return (
        <div className="space-y-6">
            <PrivateDashboardHeader
                title={pageData.title}
                subtitle={pageData.description}
            />

            <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-lg bg-muted/60" />}>
                <AdminAuditsGrid />
            </Suspense>
        </div>
    );
}
