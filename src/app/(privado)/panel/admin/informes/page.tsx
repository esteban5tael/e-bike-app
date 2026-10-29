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
import { OperationalReportsView } from "@/features/private/dashboard/admin/informes/components";

const pageData = {
    title: "Informes Operativos",
    description:
        "Reportes analíticos de flota, baterías críticas, alquileres prolongados y rotación",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(pageData.description),
    };
}

export default async function AdminOperationalReportsPage() {
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

            <Suspense
                fallback={
                    <div className="h-48 w-full animate-pulse rounded-2xl bg-muted/60" />
                }
            >
                <OperationalReportsView />
            </Suspense>
        </div>
    );
}
