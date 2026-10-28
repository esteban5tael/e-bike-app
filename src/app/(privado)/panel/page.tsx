import {
    MetadataGeneratorProps,
    generateAsyncTitle,
    generateAsyncDescription,
} from "@/lib/seo";
import type { Metadata } from "next";
import { getSessionDetails } from "@/lib/auth/session-details";
import { ClientDashboardOverview } from "@/features/private/client-rental/components";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { redirect } from "next/navigation";

const pageData: MetadataGeneratorProps = {
    title: "Panel",
    description: "Panel de Gestión y Movilidad",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(
            pageData.description,
        ),
    };
}

export default async function PrivateDashboardPage() {
    const { userRole } = await getSessionDetails();

    // Si es personal administrativo u operativo, redirigir a la vista de operaciones o estaciones
    if (hasRequiredRole(userRole, STAFF_ROLES)) {
        redirect("/panel/admin/estaciones");
    }

    // Para clientes y usuarios estándar, renderizar la vista de resumen con accesos directos
    return <ClientDashboardOverview />;
}
