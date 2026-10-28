import type { Metadata } from "next";
import {
    generateAsyncDescription,
    generateAsyncTitle,
    MetadataGeneratorProps,
} from "@/lib/seo/metadataGenerator";
import {
    HeroSection,
    AboutSection,
    StationsPreviewSection,
    FleetPreviewSection,
    HowItWorksSection,
    PublicFooter,
} from "@/features/public/components/landing";

const pageData: MetadataGeneratorProps = {
    title: "Inicio | Movilidad Eléctrica Urbana",
    description: "Red de bicicletas eléctricas compartidas para desplazamientos sostenibles y limpios por la ciudad.",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(pageData.description),
    };
}

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <HeroSection />
                <AboutSection />
                <StationsPreviewSection />
                <FleetPreviewSection />
                <HowItWorksSection />
            </main>
            <PublicFooter />
        </div>
    );
}
