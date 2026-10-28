import type { Metadata } from "next";
import {
    generateAsyncDescription,
    generateAsyncTitle,
    MetadataGeneratorProps,
} from "@/lib/seo/metadataGenerator";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Network } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { Badge } from "@/features/shared/components/ui/badge";

const pageData: MetadataGeneratorProps = {
    title: "Diagrama del Sistema | E-Bike",
    description: "Arquitectura técnica completa del sistema de movilidad y alquiler de bicicletas eléctricas.",
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: await generateAsyncTitle(pageData.title),
        description: await generateAsyncDescription(pageData.description),
    };
}

export default function DiagramaPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] w-full">
            {/* Barra superior de contexto de la arquitectura */}
            <div className="border-b bg-card/60 backdrop-blur-xs px-4 sm:px-8 py-4">
                <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Network className="w-3.5 h-3.5 text-primary" />
                                Archify v3.2
                            </Badge>
                            <span className="text-xs text-muted-foreground">Arquitectura MVP</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                            Diagrama de Arquitectura del Sistema
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Mapa interactivo de capas: Clientes, Next.js 16 App Router, Auth/Role Guards, Server Actions y PostgreSQL.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href="/" />}
                            className="gap-1.5"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Volver al Inicio</span>
                        </Button>
                        <Button
                            size="sm"
                            render={<a href="/diagrama-ebike.html" target="_blank" rel="noopener noreferrer" />}
                            className="gap-1.5"
                        >
                            <span>Pantalla Completa</span>
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Contenedor del visor del diagrama interactivo */}
            <div className="flex-1 w-full bg-muted/20 relative p-2 sm:p-4 md:p-6 flex flex-col items-center">
                <div className="w-full max-w-7xl h-187.5 md:h-205 rounded-2xl border border-border overflow-hidden bg-background shadow-lg relative">
                    <iframe
                        src="/diagrama-ebike.html"
                        title="Diagrama de Arquitectura Técnica E-Bike"
                        className="w-full h-full border-0"
                    />
                </div>
            </div>
        </div>
    );
}
