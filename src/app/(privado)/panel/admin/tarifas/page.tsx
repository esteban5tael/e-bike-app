import type { Metadata } from "next";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { ADMIN_USERS_ROLES } from "@/features/private/dashboard/admin/users/components/grid/admin-users-roles.constants";
import { redirect } from "next/navigation";
import { PrivateDashboardHeader } from "@/features/private/dashboard/components";
import { TariffManagementCard } from "@/features/private/dashboard/admin/tarifas/components";
import {
    generateAsyncTitle,
    generateAsyncDescription,
    type MetadataGeneratorProps,
} from "@/lib/seo";

const pageData: MetadataGeneratorProps = {
    title: "Gestión de Tarifas - e-Bike",
    description: "Configuración centralizada de tarifas base y por minuto del servicio",
};

export async function generateMetadata(): Promise<Metadata> {
    const dynamicTitle = await generateAsyncTitle(pageData.title);
    const dynamicDescription = await generateAsyncDescription(pageData.description);

    return {
        title: dynamicTitle,
        description: dynamicDescription,
    };
}

export default async function AdminTarifasPage() {
    const { isAuthenticated, userRole } = await getSessionDetails();

    if (!isAuthenticated || !hasRequiredRole(userRole, ADMIN_USERS_ROLES)) {
        return redirect("/panel");
    }

    return (
        <section className="space-y-6">
            <PrivateDashboardHeader
                title="Tarifas del Servicio"
                subtitle="Configura los valores oficiales de desbloqueo base y costo por minuto en pesos colombianos (COP)."
            />

            <TariffManagementCard />
        </section>
    );
}
