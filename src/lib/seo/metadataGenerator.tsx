//  import { generateAsyncTitle,generateAsyncDescription } from "@/lib/seo";

export interface MetadataGeneratorProps {
    title: string;
    description: string;
}
export const APP_NAME = "E-Bike App { JEBC-DeV }";
export const APP_DESCRIPTION =
    "Aplicación de gestión de ventas y compras de bicicletas eléctricas.";

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
