import {
    MetadataGeneratorProps,
    generateAsyncTitle,
    generateAsyncDescription,
} from "@/lib/seo";
import type { Metadata } from "next";
import { getSessionDetails } from "@/lib/auth/session-details";
import { ClientMyRentalsView } from "@/features/private/client-rental/components";
import { redirect } from "next/navigation";

const pageData: MetadataGeneratorProps = {
    title: "Mis Alquileres",
    description: "Historial de alquileres y viajes del usuario",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(
            pageData.description,
        ),
    };
}

export default async function ClientRentalsPage() {
    const { isAuthenticated } = await getSessionDetails();

    if (!isAuthenticated) {
        redirect("/iniciar-sesion");
    }

    return <ClientMyRentalsView />;
}
