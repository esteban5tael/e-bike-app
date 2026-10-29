//  import { generateAsyncTitle,generateAsyncDescription } from "@/lib/seo";

export interface MetadataGeneratorProps {
    title: string;
    description: string;
}
export const APP_NAME = "E-Bike App { JEBC-DeV }";
export const APP_DESCRIPTION =
    "Aplicación de gestión de movilidad, alquiler y ventas de bicicletas eléctricas.";
export const APP_URL = "https://e-bike-app.vercel.app";
export const APP_DEFAULT_IMAGE = `${APP_URL}/logo.png`;

const generateTitle = (title?: string) => {
    return title ? `${title} | ${APP_NAME}` : APP_NAME;
};

const generateDescription = (description?: string) => {
    return description || APP_DESCRIPTION;
};

const generateAsyncTitle = async (
    title?: string,
): Promise<string> => {
    return title ? `${title} | ${APP_NAME}` : APP_NAME;
};

const generateAsyncDescription = async (
    description?: string,
): Promise<string> => {
    return description || APP_DESCRIPTION;
};

export {
    generateTitle,
    generateDescription,
    generateAsyncTitle,
    generateAsyncDescription,
};
