import { betterAuth, User } from "better-auth";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import drizzleDB from "../db";
import * as schema from "@/lib/db/schema";
import { randomUUID } from "crypto";
import {
    sendResetPassword as sendResetPasswordMessage,
    sendVerificationEmail as sendVerificationEmailMessage,
} from "@/lib/emails";

const ac = createAccessControl(defaultStatements);

const roles = {
    cliente: ac.newRole({ user: [], session: [] }),
    operador: ac.newRole({
        user: ["get", "list"],
        session: [],
    }),
    administrador: ac.newRole(adminAc.statements),
    superadministrador: ac.newRole(adminAc.statements),
};

const auth = betterAuth({
    database: drizzleAdapter(drizzleDB, {
        provider: "pg",
        schema: {
            ...schema,
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
        },
    }),
    advanced: {
        database: {
            generateId: () => randomUUID(),
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        autoSignIn: true,

        sendResetPassword: async ({ user, token }) => {
            await sendResetPasswordMessage({ user, token });
        },

        revokeSessionsOnPasswordReset: true,
        resetPasswordTokenExpiresIn: 60 * 60,
    },

    emailVerification: {
        sendVerificationEmail: async ({ user, token }) => {
            await sendVerificationEmailMessage({ user, token });
        },
        sendOnSignUp: true,
    },

    session: {
        expiresIn: 60 * 60 * 8,
        updateAge: 60 * 60,
    },

    user: {
        additionalFields: {
            role: {
                // Tipado estricto con los valores del pgEnum
                type: [
                    "cliente",
                    "operador",
                    "administrador",
                    "superadministrador",
                ],
                required: false,
                defaultValue: "cliente",
                input: false, // No permitir que el cliente se asigne rol desde el frontend
            },
            telefono: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true, // Permitir enviarlo al registrarse o actualizar perfil
            },
            estado: {
                type: ["activo", "inactivo", "suspendido"],
                required: false,
                defaultValue: "activo",
                input: false, // Solo modificable por backend / administradores
            },
            isActive: {
                type: "boolean",
                required: false,
                defaultValue: true,
                input: false,
            },
            tenantId: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
        },

        changeEmail: { enabled: true },
    },

    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    return {
                        data: {
                            ...user,
                            // Forzar siempre valores seguros por defecto compatibles con los pgEnum
                            role: "cliente",
                            estado: "activo",
                            isActive: true,
                        },
                    };
                },
            },
        },
    },

    plugins: [
        admin({
            defaultRole: "cliente",
            adminRoles: ["administrador", "superadministrador"],
            roles,
        }),
        nextCookies(),
    ],
});

export { auth, type User };