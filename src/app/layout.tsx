import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import {
    APP_NAME,
    APP_URL,
    APP_DEFAULT_IMAGE,
    generateAsyncDescription,
    generateAsyncTitle,
    MetadataGeneratorProps,
} from "@/lib/seo/metadataGenerator";
import TanStackQueryProvider from "@/features/shared/components/ui/tanstack-query-provider";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/features/shared/components/ui";
import { PublicHeader } from "@/features/public/components/public-header";
import { getSessionDetails } from "@/lib/auth/session-details";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const pageData: MetadataGeneratorProps = {
    title: "Inicio",
    description: "Inicio de el Sistema",
};

export async function generateMetadata(): Promise<Metadata> {
    const title = await generateAsyncTitle(pageData.title);
    const description = await generateAsyncDescription(pageData.description);

    return {
        metadataBase: new URL(APP_URL),
        title: {
            default: title,
            template: `%s | ${APP_NAME}`,
        },
        description,
        applicationName: APP_NAME,
        openGraph: {
            type: "website",
            locale: "es_CO",
            url: APP_URL,
            siteName: APP_NAME,
            title,
            description,
            images: [
                {
                    url: APP_DEFAULT_IMAGE,
                    width: 1200,
                    height: 630,
                    alt: APP_NAME,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [APP_DEFAULT_IMAGE],
        },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser, userRole } = await getSessionDetails();
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                inter.variable,
            )}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TanStackQueryProvider>
                        <TooltipProvider>
                            <PublicHeader
                                currentUser={currentUser}
                                role={userRole}
                            />
                            <Toaster
                                duration={3000}
                                position="top-right"
                                richColors
                                theme="system" // 👈 así el toast respeta el tema
                                closeButton
                            />
                            <div className="flex flex-1 flex-col">
                                {children}
                            </div>
                        </TooltipProvider>
                    </TanStackQueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
