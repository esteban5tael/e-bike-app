import {
    MetadataGeneratorProps,
    generateAsyncTitle,
    generateAsyncDescription,
} from "@/lib/seo";
import type { Metadata } from "next";
import { getSessionDetails } from "@/lib/auth/session-details";
import { ClientRentBikesView } from "@/features/private/client-rental/components";
import { redirect } from "next/navigation";

const pageData: MetadataGeneratorProps = {
    title: "Rentar Bicicleta",
    description: "Estaciones y bicicletas eléctricas disponibles para alquiler",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(
            pageData.description,
        ),
    };
}

export default async function ClientRentPage() {
    const { isAuthenticated } = await getSessionDetails();

    if (!isAuthenticated) {
        redirect("/iniciar-sesion");
    }

    return <ClientRentBikesView />;
}
