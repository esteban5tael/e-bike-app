// src/lib/db/seeders/index.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import drizzleDB from "..";
import * as schema from "../schema";
import type { UserRole } from "../schema";

// ==========================================
// 00. WIPE DATABASE
// ==========================================
// El orden respeta estrictamente las claves foráneas del modelo eBike + Better Auth:
// primero las tablas hoja (auditorías, energía, transacciones, mantenimientos),
// luego entidades intermedias (alquileres, métodos de pago, baterías, bicicletas, estaciones)
// y finalmente las tablas de autenticación (sessions, accounts, verifications -> users).
async function wipeDatabase() {
    console.log("🧹 Wiping database...\n");

    // 1. Módulo de auditoría y energía (hijas de baterías y estaciones)
    await drizzleDB.delete(schema.auditorias);
    await drizzleDB.delete(schema.registrosEnergia);
    await drizzleDB.delete(schema.alertasEnergia);
    await drizzleDB.delete(schema.historialCarga);

    // 2. Operación, pagos y mantenimientos (hijas de alquileres, bicis y users)
    await drizzleDB.delete(schema.transacciones);
    await drizzleDB.delete(schema.mantenimientos);
    await drizzleDB.delete(schema.alquileres);
    await drizzleDB.delete(schema.metodosPago);

    // 3. Flota e infraestructura (baterías -> bicicletas -> estaciones)
    await drizzleDB.delete(schema.baterias);
    await drizzleDB.delete(schema.bicicletas);
    await drizzleDB.delete(schema.estaciones);

    // 4. Better Auth (hijas de users -> users)
    await drizzleDB.delete(schema.verifications);
    await drizzleDB.delete(schema.accounts);
    await drizzleDB.delete(schema.sessions);
    await drizzleDB.delete(schema.users);

    console.log("✅ Database wiped.\n");
}

// ==========================================
// 01. USERS
// ==========================================
const SEED_PASSWORD = process.env.SEED_USERS_PASSWORD;

if (!SEED_PASSWORD) {
    throw new Error(
        "SEED_USERS_PASSWORD no está definida. Genera una con " +
            "`openssl rand -base64 18` y agrégala a tu .env local. " +
            "Nunca la commitees.",
    );
}

const WEAK_PASSWORDS = new Set([
    "password",
    "qwertyuiop",
    "adminadmin",
    "secretsecre",
]);

const isAllDigits = (value: string): boolean => /^\d+$/.test(value);

const hasWeakTerm = (value: string): boolean =>
    [...WEAK_PASSWORDS].some((weak) =>
        value.toLowerCase().includes(weak),
    );

if (
    SEED_PASSWORD.length < 16 ||
    isAllDigits(SEED_PASSWORD) ||
    hasWeakTerm(SEED_PASSWORD)
) {
    throw new Error(
        "SEED_USERS_PASSWORD es demasiado débil: el seeder crea una cuenta " +
            "con rol `superadministrador`, así que una contraseña adivinable equivale a un " +
            "administrador público. Usa `openssl rand -base64 18` (mínimo " +
            "16 caracteres, no solo dígitos) y no la reutilices en otros " +
            "ambientes.",
    );
}

const GENERAL_PASSWORD: string = SEED_PASSWORD;

// `UserRole` infiere directamente de `userRoleEnum`:
// "cliente" | "operador" | "administrador" | "superadministrador"
const usersToCreate: ReadonlyArray<{
    role: UserRole;
    name: string;
    email: string;
    telefono: string;
}> = [
    {
        role: "superadministrador",
        name: "Juan Esteban Benjumea Correa",
        email: "super@email.com",
        telefono: "3017990064",
    },
    {
        role: "administrador",
        name: "Administración eBike",
        email: "admin@email.com",
        telefono: "3001112233",
    },
    {
        role: "operador",
        name: "Operador de Campo 1",
        email: "operador1@email.com",
        telefono: "3002223344",
    },
    {
        role: "operador",
        name: "Operador Mantenimiento",
        email: "mantenimiento@email.com",
        telefono: "3003334455",
    },
    {
        role: "cliente",
        name: "Cliente Prueba 1",
        email: "cliente@email.com",
        telefono: "3004445566",
    },
    {
        role: "cliente",
        name: "Cliente Prueba 2",
        email: "usuario@email.com",
        telefono: "3005556677",
    },
];

async function seedUsers() {
    console.log("👤 Seeding users...");

    for (const userData of usersToCreate) {
        const [existing] = await drizzleDB
            .select({ id: schema.users.id })
            .from(schema.users)
            .where(eq(schema.users.email, userData.email))
            .limit(1);

        if (existing) {
            console.log(
                `  ⏭️  User ${userData.email} already exists, skipping.`,
            );
            continue;
        }

        const response = await auth.api.signUpEmail({
            body: {
                name: userData.name,
                email: userData.email,
                password: GENERAL_PASSWORD,
                telefono: userData.telefono,
                callbackURL:
                    process.env.PUBLIC_APP_URL ||
                    "http://localhost:3000",
            },
            headers: new Headers(),
        });

        // Como `databaseHooks.user.create.before` fuerza `role: "cliente"` por seguridad
        // en el registro público, actualizamos el rol real del seeder y marcamos
        // `emailVerified: true` directamente con Drizzle:
        await drizzleDB
            .update(schema.users)
            .set({
                role: userData.role,
                telefono: userData.telefono,
                estado: "activo",
                emailVerified: true,
            })
            .where(eq(schema.users.id, response.user.id));

        console.log(
            `  ✅ Created user: ${userData.name} (${userData.email}) [${userData.role}]`,
        );
    }
    console.log("🎉 Users seeded successfully!\n");
}

// ==========================================
// 02. INFRAESTRUCTURA EBIKE (Estaciones, Bicis y Baterías)
// ==========================================
async function seedEbikeBase() {
    console.log("🚲 Seeding eBike stations, bikes & batteries...");

    // 1. Insertar estaciones base
    const estacionesInsertadas = await drizzleDB
        .insert(schema.estaciones)
        .values([
            {
                codigo: "EST-BEL-01",
                nombre: "Estación Parque de Belén",
                direccion: "Cra. 76 #30A-12, Medellín",
                latitud: "6.2318400",
                longitud: "-75.6038900",
                capacidad: 15,
                estado: "operativa",
            },
            {
                codigo: "EST-POB-01",
                nombre: "Estación Ciudad del Río",
                direccion: "Cl. 20 #43G-50, Medellín",
                latitud: "6.2238900",
                longitud: "-75.5744400",
                capacidad: 20,
                estado: "operativa",
            },
            {
                codigo: "EST-LAU-01",
                nombre: "Estación Primer Parque de Laureles",
                direccion: "Cra. 73 #Circular 1, Medellín",
                latitud: "6.2452800",
                longitud: "-75.5916700",
                capacidad: 12,
                estado: "mantenimiento",
            },
        ])
        .returning();

    const [estBelen, estCiudadRio] = estacionesInsertadas;

    // 2. Insertar bicicletas asociadas a las estaciones operativas
    const bicicletasInsertadas = await drizzleDB
        .insert(schema.bicicletas)
        .values([
            {
                idEstacionActual: estBelen.idEstacion,
                codigoQr: "QR-EBIKE-0001",
                modelo: "UrbanPro X1",
                numeroSerie: "SN-UPX1-2026-001",
                nivelBateria: "100.00",
                estado: "disponible",
                kilometraje: "12.50",
                fechaUltMant: "2026-10-01",
                fechaProxMant: "2026-12-01",
            },
            {
                idEstacionActual: estBelen.idEstacion,
                codigoQr: "QR-EBIKE-0002",
                modelo: "UrbanPro X1",
                numeroSerie: "SN-UPX1-2026-002",
                nivelBateria: "85.50",
                estado: "disponible",
                kilometraje: "48.20",
                fechaUltMant: "2026-10-05",
                fechaProxMant: "2026-12-05",
            },
            {
                idEstacionActual: estCiudadRio.idEstacion,
                codigoQr: "QR-EBIKE-0003",
                modelo: "CityGlide E2",
                numeroSerie: "SN-CGE2-2026-003",
                nivelBateria: "42.00",
                estado: "mantenimiento",
                kilometraje: "310.00",
                fechaUltMant: "2026-09-15",
                fechaProxMant: "2026-11-15",
            },
        ])
        .returning();

    // 3. Insertar baterías para cada bicicleta
    await drizzleDB.insert(schema.baterias).values([
        {
            codigoBateria: "BAT-LI-0001",
            capacidadWh: "500.00",
            nivelCarga: "100.00",
            temperatura: "24.50",
            estado: "cargada",
            fechaInstalacion: "2026-09-01",
            vidaUtil: 1000,
            idBicicleta: bicicletasInsertadas[0].idBicicleta,
        },
        {
            codigoBateria: "BAT-LI-0002",
            capacidadWh: "500.00",
            nivelCarga: "85.50",
            temperatura: "25.00",
            estado: "disponible",
            fechaInstalacion: "2026-09-01",
            vidaUtil: 1000,
            idBicicleta: bicicletasInsertadas[1].idBicicleta,
        },
        {
            codigoBateria: "BAT-LI-0003",
            capacidadWh: "450.00",
            nivelCarga: "42.00",
            temperatura: "28.10",
            estado: "cargando",
            fechaInstalacion: "2026-08-15",
            vidaUtil: 850,
            idBicicleta: bicicletasInsertadas[2].idBicicleta,
        },
    ]);

    console.log(
        `  ✅ Created ${estacionesInsertadas.length} stations, ${bicicletasInsertadas.length} bikes & 3 batteries.`,
    );
    console.log("🎉 eBike infrastructure seeded successfully!");
}

// ==========================================
// RUNNER
// ==========================================
async function main() {
    await wipeDatabase();
    await seedUsers();
    await seedEbikeBase();
}

main().then(
    () => {
        console.log("\n✅ Seed completado.");
        process.exit(0);
    },
    (error: unknown) => {
        console.error("\n❌ Seed falló:", error);
        process.exit(1);
    },
);