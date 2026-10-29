// src/lib/db/seeders/index.ts
import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import drizzleDB from "..";
import * as schema from "../schema";
import type {
    UserRole,
    EstadoUsuario,
    EstadoBicicleta,
    EstadoBateria,
} from "../schema";

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
    await drizzleDB.delete(schema.tarifas);
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
    estado?: EstadoUsuario;
}> = [
    // --- USUARIOS BASE INTACTOS ---
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
    // --- CLIENTES REALISTAS ADICIONALES (MEDELLÍN) ---
    {
        role: "cliente",
        name: "Camila Restrepo Gaviria",
        email: "camila.restrepo@email.com",
        telefono: "3104567890",
    },
    {
        role: "cliente",
        name: "Mateo Gómez Londoño",
        email: "mateo.gomez@email.com",
        telefono: "3112345678",
    },
    {
        role: "cliente",
        name: "Valentina Tobón Maya",
        email: "valentina.tobon@email.com",
        telefono: "3129876543",
    },
    {
        role: "cliente",
        name: "Santiago Ochoa Vélez",
        email: "santiago.ochoa@email.com",
        telefono: "3145678901",
    },
    {
        role: "cliente",
        name: "Mariana Arango Palacio",
        email: "mariana.arango@email.com",
        telefono: "3156789012",
    },
    {
        role: "cliente",
        name: "Alejandro Jaramillo Ruiz",
        email: "alejandro.jaramillo@email.com",
        telefono: "3167890123",
    },
    {
        role: "cliente",
        name: "Daniela Betancur Cano",
        email: "daniela.betancur@email.com",
        telefono: "3178901234",
    },
    {
        role: "cliente",
        name: "Sebastián Cardona Quintero",
        email: "sebastian.cardona@email.com",
        telefono: "3189012345",
    },
    {
        role: "cliente",
        name: "Laura Posada Echeverri",
        email: "laura.posada@email.com",
        telefono: "3190123456",
    },
    {
        role: "cliente",
        name: "Andrés Felipe Montoya",
        email: "andres.montoya@email.com",
        telefono: "3201234567",
        estado: "suspendido",
    },
];

async function seedUsers(): Promise<schema.UsersSelect[]> {
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
                estado: userData.estado ?? "activo",
                banned: userData.estado === "suspendido",
                banReason:
                    userData.estado === "suspendido"
                        ? "Mora en penalización por entrega fuera de estación"
                        : null,
                emailVerified: true,
            })
            .where(eq(schema.users.id, response.user.id));

        console.log(
            `  ✅ Created user: ${userData.name} (${userData.email}) [${userData.role}]`,
        );
    }

    const allUsers = await drizzleDB.select().from(schema.users);
    console.log(`🎉 ${allUsers.length} users seeded successfully!\n`);
    return allUsers;
}

// ==========================================
// 02. INFRAESTRUCTURA EBIKE (Estaciones, Bicis y Baterías)
// ==========================================
async function seedEbikeInfrastructure() {
    console.log("🚲 Seeding Medellín eBike stations, fleet & batteries...");

    // 1. Insertar 12 estaciones reales en el Valle de Aburrá (Medellín y área metropolitana)
    const estacionesInsertadas = await drizzleDB
        .insert(schema.estaciones)
        .values([
            {
                codigo: "EST-BEL-01",
                nombre: "Estación Parque de Belén",
                direccion: "Cra. 76 #30A-12, Belén, Medellín",
                latitud: "6.2318400",
                longitud: "-75.6038900",
                capacidad: 16,
                estado: "operativa",
            },
            {
                codigo: "EST-POB-01",
                nombre: "Estación Ciudad del Río",
                direccion: "Cl. 20 #43G-50, El Poblado, Medellín",
                latitud: "6.2238900",
                longitud: "-75.5744400",
                capacidad: 22,
                estado: "operativa",
            },
            {
                codigo: "EST-LAU-01",
                nombre: "Estación Primer Parque de Laureles",
                direccion: "Cra. 73 #Circular 1, Laureles, Medellín",
                latitud: "6.2452800",
                longitud: "-75.5916700",
                capacidad: 15,
                estado: "operativa",
            },
            {
                codigo: "EST-RUN-01",
                nombre: "Estación Ruta N - UdeA",
                direccion: "Cl. 67 #52-20, Sevilla, Medellín",
                latitud: "6.2649100",
                longitud: "-75.5665300",
                capacidad: 25,
                estado: "operativa",
            },
            {
                codigo: "EST-POB-02",
                nombre: "Estación Parque Lleras - Provenza",
                direccion: "Cl. 9A #37-16, El Poblado, Medellín",
                latitud: "6.2089200",
                longitud: "-75.5678100",
                capacidad: 18,
                estado: "operativa",
            },
            {
                codigo: "EST-LAU-02",
                nombre: "Estación Campus UPB",
                direccion: "Cq. 1 #70-01, Laureles, Medellín",
                latitud: "6.2423100",
                longitud: "-75.5892100",
                capacidad: 20,
                estado: "operativa",
            },
            {
                codigo: "EST-EST-01",
                nombre: "Estación Unidad Deportiva Atanasio Girardot",
                direccion: "Cl. 48 #73-10, Estadio, Medellín",
                latitud: "6.2568400",
                longitud: "-75.5901300",
                capacidad: 24,
                estado: "operativa",
            },
            {
                codigo: "EST-PRQ-01",
                nombre: "Estación Parques del Río - Conquistadores",
                direccion: "Cra. 62 #42-15, Conquistadores, Medellín",
                latitud: "6.2441200",
                longitud: "-75.5791800",
                capacidad: 20,
                estado: "operativa",
            },
            {
                codigo: "EST-FLO-01",
                nombre: "Estación Metro Floresta",
                direccion: "Cra. 80 #47A-95, La Floresta, Medellín",
                latitud: "6.2587400",
                longitud: "-75.5978200",
                capacidad: 14,
                estado: "operativa",
            },
            {
                codigo: "EST-PED-01",
                nombre: "Estación SENA Complejo Norte - Pedregal",
                direccion: "Cra. 65 #104-32, Pedregal, Medellín",
                latitud: "6.2981200",
                longitud: "-75.5682100",
                capacidad: 18,
                estado: "operativa",
            },
            {
                codigo: "EST-ENV-01",
                nombre: "Estación Parque Principal de Envigado",
                direccion: "Cl. 38 Sur #41-10, Centro, Envigado",
                latitud: "6.1701400",
                longitud: "-75.5872100",
                capacidad: 16,
                estado: "mantenimiento",
            },
            {
                codigo: "EST-SAB-01",
                nombre: "Estación Parque de Sabaneta",
                direccion: "Cra. 45 #70 Sur-24, Sabaneta",
                latitud: "6.1515300",
                longitud: "-75.6163400",
                capacidad: 12,
                estado: "inactiva",
            },
        ])
        .returning();

    // Filtramos estaciones operativas y de mantenimiento para ubicar flota
    const estacionesActivas = estacionesInsertadas.filter(
        (e) => e.estado === "operativa",
    );
    const estMantenimiento =
        estacionesInsertadas.find((e) => e.estado === "mantenimiento") ??
        estacionesInsertadas[0];

    // 2. Construir flota de 36 bicicletas con modelos, estados y telemetría realistas
    const modelosCatalogo = [
        {
            nombre: "UrbanPro X1",
            prefijoSn: "UPX1",
            capacidadWh: "500.00",
            vidaUtilBase: 1000,
        },
        {
            nombre: "CityGlide E2",
            prefijoSn: "CGE2",
            capacidadWh: "450.00",
            vidaUtilBase: 900,
        },
        {
            nombre: "AndesClimber Pro",
            prefijoSn: "ACPR",
            capacidadWh: "650.00",
            vidaUtilBase: 1200,
        },
        {
            nombre: "MetroFold S1",
            prefijoSn: "MFS1",
            capacidadWh: "400.00",
            vidaUtilBase: 800,
        },
    ];

    const configuracionFlota: Array<{
        estadoBici: EstadoBicicleta;
        estadoBat: EstadoBateria;
        bateriaPct: string;
        tempC: string;
        km: string;
        estacionIdx: number | null; // null cuando está en la calle ("en_uso")
        ultMant: string;
        proxMant: string;
    }> = [
        // 25 Bicicletas disponibles repartidas por las 10 estaciones operativas
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "100.00", tempC: "23.40", km: "14.20", estacionIdx: 0, ultMant: "2026-10-01", proxMant: "2026-12-01" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "88.50", tempC: "24.10", km: "62.80", estacionIdx: 0, ultMant: "2026-10-04", proxMant: "2026-12-04" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "76.00", tempC: "25.00", km: "145.30", estacionIdx: 0, ultMant: "2026-09-20", proxMant: "2026-11-20" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "99.00", tempC: "22.80", km: "38.90", estacionIdx: 1, ultMant: "2026-10-10", proxMant: "2026-12-10" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "91.20", tempC: "24.60", km: "210.40", estacionIdx: 1, ultMant: "2026-09-28", proxMant: "2026-11-28" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "68.40", tempC: "26.10", km: "412.70", estacionIdx: 1, ultMant: "2026-09-12", proxMant: "2026-11-12" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "100.00", tempC: "23.10", km: "19.50", estacionIdx: 2, ultMant: "2026-10-15", proxMant: "2026-12-15" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "82.00", tempC: "24.90", km: "184.00", estacionIdx: 2, ultMant: "2026-09-25", proxMant: "2026-11-25" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "73.50", tempC: "25.30", km: "295.60", estacionIdx: 2, ultMant: "2026-09-18", proxMant: "2026-11-18" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "97.50", tempC: "23.70", km: "88.10", estacionIdx: 3, ultMant: "2026-10-08", proxMant: "2026-12-08" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "84.00", tempC: "24.40", km: "320.20", estacionIdx: 3, ultMant: "2026-09-22", proxMant: "2026-11-22" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "64.00", tempC: "26.50", km: "510.80", estacionIdx: 3, ultMant: "2026-09-05", proxMant: "2026-11-05" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "100.00", tempC: "22.90", km: "27.40", estacionIdx: 4, ultMant: "2026-10-18", proxMant: "2026-12-18" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "79.80", tempC: "25.20", km: "167.90", estacionIdx: 4, ultMant: "2026-10-02", proxMant: "2026-12-02" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "95.00", tempC: "23.80", km: "94.60", estacionIdx: 5, ultMant: "2026-10-12", proxMant: "2026-12-12" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "86.30", tempC: "24.70", km: "248.10", estacionIdx: 5, ultMant: "2026-09-30", proxMant: "2026-11-30" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "71.00", tempC: "25.80", km: "389.00", estacionIdx: 6, ultMant: "2026-09-14", proxMant: "2026-11-14" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "98.00", tempC: "23.20", km: "53.70", estacionIdx: 6, ultMant: "2026-10-19", proxMant: "2026-12-19" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "89.40", tempC: "24.20", km: "176.50", estacionIdx: 7, ultMant: "2026-10-06", proxMant: "2026-12-06" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "66.50", tempC: "26.00", km: "442.30", estacionIdx: 7, ultMant: "2026-09-10", proxMant: "2026-11-10" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "100.00", tempC: "23.00", km: "31.20", estacionIdx: 8, ultMant: "2026-10-20", proxMant: "2026-12-20" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "77.20", tempC: "25.10", km: "205.80", estacionIdx: 8, ultMant: "2026-09-27", proxMant: "2026-11-27" },
        { estadoBici: "disponible", estadoBat: "cargada", bateriaPct: "96.00", tempC: "23.50", km: "72.40", estacionIdx: 9, ultMant: "2026-10-14", proxMant: "2026-12-14" },
        { estadoBici: "disponible", estadoBat: "disponible", bateriaPct: "81.50", tempC: "24.80", km: "264.90", estacionIdx: 9, ultMant: "2026-09-29", proxMant: "2026-11-29" },
        { estadoBici: "disponible", estadoBat: "cargando", bateriaPct: "38.00", tempC: "29.40", km: "340.10", estacionIdx: 9, ultMant: "2026-09-16", proxMant: "2026-11-16" },

        // 5 Bicicletas actualmente "en_uso" (rodando por Medellín, sin estación actual)
        { estadoBici: "en_uso", estadoBat: "disponible", bateriaPct: "74.00", tempC: "31.20", km: "198.40", estacionIdx: null, ultMant: "2026-10-03", proxMant: "2026-12-03" },
        { estadoBici: "en_uso", estadoBat: "disponible", bateriaPct: "62.50", tempC: "32.80", km: "287.60", estacionIdx: null, ultMant: "2026-09-24", proxMant: "2026-11-24" },
        { estadoBici: "en_uso", estadoBat: "disponible", bateriaPct: "55.00", tempC: "33.50", km: "415.20", estacionIdx: null, ultMant: "2026-09-19", proxMant: "2026-11-19" },
        { estadoBici: "en_uso", estadoBat: "disponible", bateriaPct: "83.00", tempC: "30.40", km: "112.00", estacionIdx: null, ultMant: "2026-10-11", proxMant: "2026-12-11" },
        { estadoBici: "en_uso", estadoBat: "baja", bateriaPct: "18.50", tempC: "35.10", km: "534.70", estacionIdx: null, ultMant: "2026-09-08", proxMant: "2026-11-08" },

        // 4 Bicicletas en "mantenimiento"
        { estadoBici: "mantenimiento", estadoBat: "cargando", bateriaPct: "42.00", tempC: "28.10", km: "610.00", estacionIdx: 1, ultMant: "2026-08-15", proxMant: "2026-10-25" },
        { estadoBici: "mantenimiento", estadoBat: "baja", bateriaPct: "12.00", tempC: "27.50", km: "785.40", estacionIdx: 3, ultMant: "2026-08-20", proxMant: "2026-10-26" },
        { estadoBici: "mantenimiento", estadoBat: "dañada", bateriaPct: "5.00", tempC: "41.80", km: "920.30", estacionIdx: 6, ultMant: "2026-08-10", proxMant: "2026-10-20" },
        { estadoBici: "mantenimiento", estadoBat: "cargando", bateriaPct: "31.00", tempC: "28.90", km: "498.20", estacionIdx: 0, ultMant: "2026-09-01", proxMant: "2026-11-01" },

        // 2 Bicicletas de "baja"
        { estadoBici: "baja", estadoBat: "dañada", bateriaPct: "0.00", tempC: "22.00", km: "1450.80", estacionIdx: 10, ultMant: "2026-06-15", proxMant: "2026-08-15" },
        { estadoBici: "baja", estadoBat: "baja", bateriaPct: "8.00", tempC: "22.50", km: "1280.00", estacionIdx: 10, ultMant: "2026-07-01", proxMant: "2026-09-01" },
    ];

    const valoresBicicletas: schema.BicicletasInsert[] = configuracionFlota.map(
        (cfg, index) => {
            const num = String(index + 1).padStart(4, "0");
            const numSerie = String(index + 1).padStart(3, "0");
            const modeloInfo = modelosCatalogo[index % modelosCatalogo.length];

            let idEstacionActual: number | null = null;
            if (cfg.estacionIdx !== null) {
                if (cfg.estacionIdx === 10) {
                    idEstacionActual = estMantenimiento.idEstacion;
                } else {
                    idEstacionActual =
                        estacionesActivas[
                            cfg.estacionIdx % estacionesActivas.length
                        ].idEstacion;
                }
            }

            return {
                idEstacionActual,
                codigoQr: `QR-EBIKE-${num}`,
                modelo: modeloInfo.nombre,
                numeroSerie: `SN-${modeloInfo.prefijoSn}-2026-${numSerie}`,
                nivelBateria: cfg.bateriaPct,
                estado: cfg.estadoBici,
                kilometraje: cfg.km,
                fechaUltMant: cfg.ultMant,
                fechaProxMant: cfg.proxMant,
            };
        },
    );

    const bicicletasInsertadas = await drizzleDB
        .insert(schema.bicicletas)
        .values(valoresBicicletas)
        .returning();

    // 3. Insertar baterías sincronizadas con cada bicicleta
    const valoresBaterias: schema.BateriasInsert[] = bicicletasInsertadas.map(
        (bici, index) => {
            const cfg = configuracionFlota[index];
            const modeloInfo = modelosCatalogo[index % modelosCatalogo.length];
            const num = String(index + 1).padStart(4, "0");

            return {
                codigoBateria: `BAT-LI-${num}`,
                capacidadWh: modeloInfo.capacidadWh,
                nivelCarga: cfg.bateriaPct,
                temperatura: cfg.tempC,
                estado: cfg.estadoBat,
                fechaInstalacion:
                    index % 3 === 0 ? "2026-07-15" : "2026-09-01",
                vidaUtil:
                    cfg.estadoBat === "dañada"
                        ? 420
                        : modeloInfo.vidaUtilBase - index * 5,
                idBicicleta: bici.idBicicleta,
            };
        },
    );

    const bateriasInsertadas = await drizzleDB
        .insert(schema.baterias)
        .values(valoresBaterias)
        .returning();

    console.log(
        `  ✅ Created ${estacionesInsertadas.length} stations, ${bicicletasInsertadas.length} bikes & ${bateriasInsertadas.length} batteries.\n`,
    );

    return {
        estaciones: estacionesInsertadas,
        bicicletas: bicicletasInsertadas,
        baterias: bateriasInsertadas,
    };
}

// ==========================================
// 03. OPERACIÓN COMERCIAL (Métodos de Pago, Alquileres y Transacciones)
// ==========================================
async function seedOperationsAndPayments(
    allUsers: schema.UsersSelect[],
    estaciones: schema.EstacionesSelect[],
    bicicletas: schema.BicicletasSelect[],
) {
    console.log("💳 Seeding payment methods, rentals & transactions...");

    const clientes = allUsers.filter((u) => u.role === "cliente");
    const estacionesOperativas = estaciones.filter(
        (e) => e.estado === "operativa",
    );
    const bicisDisponibles = bicicletas.filter(
        (b) => b.estado === "disponible",
    );
    const bicisEnUso = bicicletas.filter((b) => b.estado === "en_uso");

    // 1. Crear métodos de pago para cada cliente
    const tiposPago: schema.TipoMetodoPago[] = [
        "billetera_digital",
        "tarjeta_credito",
        "tarjeta_debito",
        "transferencia",
    ];

    const valoresMetodosPago: schema.MetodosPagoInsert[] = [];
    for (let i = 0; i < clientes.length; i++) {
        const cliente = clientes[i];
        // Método principal activo
        valoresMetodosPago.push({
            idUsuario: cliente.id,
            tipo: tiposPago[i % tiposPago.length],
            tokenHash: `tok_med_${cliente.id.slice(0, 8)}_primary_${1000 + i}`,
            activo: true,
        });

        // Segundo método de respaldo para la mitad de los clientes
        if (i % 2 === 0) {
            valoresMetodosPago.push({
                idUsuario: cliente.id,
                tipo: tiposPago[(i + 1) % tiposPago.length],
                tokenHash: `tok_med_${cliente.id.slice(0, 8)}_backup_${2000 + i}`,
                activo: true,
            });
        }
    }

    const metodosInsertados = await drizzleDB
        .insert(schema.metodosPago)
        .values(valoresMetodosPago)
        .returning();

    // Mapa rápido: idUsuario -> primer idMetodo
    const metodoPorUsuario = new Map<string, number>();
    for (const m of metodosInsertados) {
        if (!metodoPorUsuario.has(m.idUsuario)) {
            metodoPorUsuario.set(m.idUsuario, m.idMetodo);
        }
    }

    // 2. Crear Alquileres (Históricos completados, activos en curso, incidencias y cancelados)
    // Nota: `chk_alquileres_fechas` exige `fechaFin IS NULL OR fechaFin > fechaInicio`
    const valoresAlquileres: schema.AlquileresInsert[] = [
        // --- 10 ALQUILERES COMPLETADOS (Octubre 2026) ---
        {
            idUsuario: clientes[0].id,
            idBicicleta: bicisDisponibles[0].idBicicleta,
            idEstacionOrigen: estacionesOperativas[0].idEstacion, // Belén
            idEstacionDestino: estacionesOperativas[2].idEstacion, // Laureles
            fechaInicio: new Date("2026-10-18T07:15:00-05:00"),
            fechaFin: new Date("2026-10-18T07:42:00-05:00"),
            costoTotal: "6800.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[1].id,
            idBicicleta: bicisDisponibles[1].idBicicleta,
            idEstacionOrigen: estacionesOperativas[1].idEstacion, // Ciudad del Río
            idEstacionDestino: estacionesOperativas[4].idEstacion, // Provenza
            fechaInicio: new Date("2026-10-19T12:10:00-05:00"),
            fechaFin: new Date("2026-10-19T12:38:00-05:00"),
            costoTotal: "7200.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[2].id,
            idBicicleta: bicisDisponibles[3].idBicicleta,
            idEstacionOrigen: estacionesOperativas[5].idEstacion, // UPB
            idEstacionDestino: estacionesOperativas[6].idEstacion, // Estadio
            fechaInicio: new Date("2026-10-20T08:00:00-05:00"),
            fechaFin: new Date("2026-10-20T08:22:00-05:00"),
            costoTotal: "5500.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[3].id,
            idBicicleta: bicisDisponibles[5].idBicicleta,
            idEstacionOrigen: estacionesOperativas[9].idEstacion, // SENA Pedregal
            idEstacionDestino: estacionesOperativas[3].idEstacion, // Ruta N
            fechaInicio: new Date("2026-10-21T17:30:00-05:00"),
            fechaFin: new Date("2026-10-21T18:15:00-05:00"),
            costoTotal: "11250.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[4].id,
            idBicicleta: bicisDisponibles[6].idBicicleta,
            idEstacionOrigen: estacionesOperativas[7].idEstacion, // Parques del Río
            idEstacionDestino: estacionesOperativas[0].idEstacion, // Belén
            fechaInicio: new Date("2026-10-22T14:00:00-05:00"),
            fechaFin: new Date("2026-10-22T14:35:00-05:00"),
            costoTotal: "8750.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[5].id,
            idBicicleta: bicisDisponibles[8].idBicicleta,
            idEstacionOrigen: estacionesOperativas[8].idEstacion, // Metro Floresta
            idEstacionDestino: estacionesOperativas[5].idEstacion, // UPB
            fechaInicio: new Date("2026-10-23T09:10:00-05:00"),
            fechaFin: new Date("2026-10-23T09:30:00-05:00"),
            costoTotal: "5000.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[6].id,
            idBicicleta: bicisDisponibles[10].idBicicleta,
            idEstacionOrigen: estacionesOperativas[3].idEstacion, // Ruta N
            idEstacionDestino: estacionesOperativas[7].idEstacion, // Parques del Río
            fechaInicio: new Date("2026-10-24T16:20:00-05:00"),
            fechaFin: new Date("2026-10-24T16:55:00-05:00"),
            costoTotal: "8900.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[7].id,
            idBicicleta: bicisDisponibles[12].idBicicleta,
            idEstacionOrigen: estacionesOperativas[4].idEstacion, // Provenza
            idEstacionDestino: estacionesOperativas[1].idEstacion, // Ciudad del Río
            fechaInicio: new Date("2026-10-25T19:00:00-05:00"),
            fechaFin: new Date("2026-10-25T19:28:00-05:00"),
            costoTotal: "7000.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[8].id,
            idBicicleta: bicisDisponibles[14].idBicicleta,
            idEstacionOrigen: estacionesOperativas[2].idEstacion, // Laureles
            idEstacionDestino: estacionesOperativas[8].idEstacion, // Floresta
            fechaInicio: new Date("2026-10-26T10:05:00-05:00"),
            fechaFin: new Date("2026-10-26T10:25:00-05:00"),
            costoTotal: "5200.00",
            estado: "completado",
        },
        {
            idUsuario: clientes[0].id,
            idBicicleta: bicisDisponibles[15].idBicicleta,
            idEstacionOrigen: estacionesOperativas[6].idEstacion, // Estadio
            idEstacionDestino: estacionesOperativas[0].idEstacion, // Belén
            fechaInicio: new Date("2026-10-27T18:10:00-05:00"),
            fechaFin: new Date("2026-10-27T18:48:00-05:00"),
            costoTotal: "9500.00",
            estado: "completado",
        },

        // --- 5 ALQUILERES ACTIVOS (En curso hoy, usando las 5 bicicletas `en_uso`) ---
        {
            idUsuario: clientes[2].id,
            idBicicleta: bicisEnUso[0].idBicicleta,
            idEstacionOrigen: estacionesOperativas[0].idEstacion, // Salida desde Belén
            idEstacionDestino: null,
            fechaInicio: new Date("2026-10-28T17:10:00-05:00"),
            fechaFin: null,
            costoTotal: null,
            estado: "activo",
        },
        {
            idUsuario: clientes[3].id,
            idBicicleta: bicisEnUso[1].idBicicleta,
            idEstacionOrigen: estacionesOperativas[3].idEstacion, // Salida desde Ruta N
            idEstacionDestino: null,
            fechaInicio: new Date("2026-10-28T17:25:00-05:00"),
            fechaFin: null,
            costoTotal: null,
            estado: "activo",
        },
        {
            idUsuario: clientes[4].id,
            idBicicleta: bicisEnUso[2].idBicicleta,
            idEstacionOrigen: estacionesOperativas[1].idEstacion, // Salida desde Ciudad del Río
            idEstacionDestino: null,
            fechaInicio: new Date("2026-10-28T17:40:00-05:00"),
            fechaFin: null,
            costoTotal: null,
            estado: "activo",
        },
        {
            idUsuario: clientes[6].id,
            idBicicleta: bicisEnUso[3].idBicicleta,
            idEstacionOrigen: estacionesOperativas[5].idEstacion, // Salida desde UPB
            idEstacionDestino: null,
            fechaInicio: new Date("2026-10-28T17:50:00-05:00"),
            fechaFin: null,
            costoTotal: null,
            estado: "activo",
        },
        {
            idUsuario: clientes[9].id,
            idBicicleta: bicisEnUso[4].idBicicleta,
            idEstacionOrigen: estacionesOperativas[9].idEstacion, // Salida desde SENA Pedregal
            idEstacionDestino: null,
            fechaInicio: new Date("2026-10-28T17:55:00-05:00"),
            fechaFin: null,
            costoTotal: null,
            estado: "activo",
        },

        // --- 2 ALQUILERES CON INCIDENCIA ---
        {
            idUsuario: clientes[11].id, // Usuario suspendido
            idBicicleta: bicisDisponibles[18].idBicicleta,
            idEstacionOrigen: estacionesOperativas[4].idEstacion,
            idEstacionDestino: estacionesOperativas[7].idEstacion,
            fechaInicio: new Date("2026-10-23T20:00:00-05:00"),
            fechaFin: new Date("2026-10-23T23:45:00-05:00"),
            costoTotal: "45000.00",
            estado: "incidencia",
        },
        {
            idUsuario: clientes[10].id,
            idBicicleta: bicisDisponibles[19].idBicicleta,
            idEstacionOrigen: estacionesOperativas[2].idEstacion,
            idEstacionDestino: estacionesOperativas[2].idEstacion,
            fechaInicio: new Date("2026-10-25T11:00:00-05:00"),
            fechaFin: new Date("2026-10-25T11:12:00-05:00"),
            costoTotal: "3500.00",
            estado: "incidencia",
        },

        // --- 1 ALQUILER CANCELADO ---
        {
            idUsuario: clientes[5].id,
            idBicicleta: bicisDisponibles[20].idBicicleta,
            idEstacionOrigen: estacionesOperativas[0].idEstacion,
            idEstacionDestino: estacionesOperativas[0].idEstacion,
            fechaInicio: new Date("2026-10-26T15:00:00-05:00"),
            fechaFin: new Date("2026-10-26T15:03:00-05:00"),
            costoTotal: "0.00",
            estado: "cancelado",
        },
    ];

    const alquileresInsertados = await drizzleDB
        .insert(schema.alquileres)
        .values(valoresAlquileres)
        .returning();

    // 3. Crear Transacciones para los alquileres finalizados (1 a 1 con idAlquiler unique)
    const alquileresConCobro = alquileresInsertados.filter(
        (a) =>
            a.estado === "completado" ||
            a.estado === "incidencia" ||
            a.estado === "cancelado",
    );

    const valoresTransacciones: schema.TransaccionesInsert[] =
        alquileresConCobro.map((alq, idx) => {
            const idMetodo =
                metodoPorUsuario.get(alq.idUsuario) ??
                metodosInsertados[0].idMetodo;

            let estadoPago: schema.EstadoPago = "aprobado";
            if (alq.estado === "incidencia" && idx % 2 === 0) {
                estadoPago = "rechazado";
            } else if (alq.estado === "incidencia") {
                estadoPago = "pendiente";
            } else if (alq.estado === "cancelado") {
                estadoPago = "reembolsado";
            }

            return {
                idAlquiler: alq.idAlquiler,
                idMetodoPago: idMetodo,
                monto: alq.costoTotal ?? "0.00",
                estadoPago,
                referenciaExterna: `WOMPI-MED-202610-${String(alq.idAlquiler).padStart(5, "0")}`,
                fechaProcesamiento: alq.fechaFin ?? new Date(),
            };
        });

    const transaccionesInsertadas = await drizzleDB
        .insert(schema.transacciones)
        .values(valoresTransacciones)
        .returning();

    console.log(
        `  ✅ Created ${metodosInsertados.length} payment methods, ${alquileresInsertados.length} rentals & ${transaccionesInsertadas.length} transactions.\n`,
    );

    return { alquileres: alquileresInsertados };
}

// ==========================================
// 04. MANTENIMIENTOS, ENERGÍA Y AUDITORÍAS
// ==========================================
async function seedMaintenanceEnergyAndAudits(
    allUsers: schema.UsersSelect[],
    estaciones: schema.EstacionesSelect[],
    bicicletas: schema.BicicletasSelect[],
    baterias: schema.BateriasSelect[],
) {
    console.log("🔧⚡ Seeding maintenance tickets, energy logs & audits...");

    const operadores = allUsers.filter((u) => u.role === "operador");
    const opCampo = operadores[0] ?? allUsers[0];
    const opTaller = operadores[1] ?? opCampo;
    const adminUser =
        allUsers.find((u) => u.role === "superadministrador") ?? allUsers[0];

    const bicisMantenimiento = bicicletas.filter(
        (b) => b.estado === "mantenimiento",
    );
    const bicisDisponibles = bicicletas.filter(
        (b) => b.estado === "disponible",
    );

    // 1. Mantenimientos (Respeta `chk_mantenimientos_fechas`: fechaFin >= fechaInicio)
    const valoresMantenimientos: schema.MantenimientosInsert[] = [
        {
            idBicicleta: bicisMantenimiento[0].idBicicleta,
            idOperador: opTaller.id,
            tipoManten: "Correctivo - Sistema de Frenos",
            descripcion:
                "Desgaste severo en pastillas de freno hidráulico delantero tras descensos en El Poblado.",
            tecnico: "Carlos Mario Restrepo",
            actividad:
                "Cambio de pastillas Shimano, purga de línea hidráulica y calibración de disco.",
            fechaInicio: new Date("2026-10-26T08:30:00-05:00"),
            fechaFin: null,
            costo: "85000.00",
            estado: "en_mantenimiento",
        },
        {
            idBicicleta: bicisMantenimiento[1].idBicicleta,
            idOperador: opTaller.id,
            tipoManten: "Correctivo - Motor Hub y Controladora",
            descripcion:
                "Código de error E07 en display; pérdida intermitente de asistencia en pendiente.",
            tecnico: "Jorge Iván Zapata",
            actividad:
                "Revisión de sensores Hall y reemplazo de conector impermeable del motor trasero.",
            fechaInicio: new Date("2026-10-27T09:00:00-05:00"),
            fechaFin: null,
            costo: "145000.00",
            estado: "en_mantenimiento",
        },
        {
            idBicicleta: bicisMantenimiento[2].idBicicleta,
            idOperador: opCampo.id,
            tipoManten: "Diagnóstico - BMS de Batería",
            descripcion:
                "Alerta térmica reportada en estación Estadio. La batería no recibe carga.",
            tecnico: "Carlos Mario Restrepo",
            actividad: "Aislamiento de pack de litio para inspección de celdas.",
            fechaInicio: new Date("2026-10-28T07:45:00-05:00"),
            fechaFin: null,
            costo: "190000.00",
            estado: "reportado",
        },
        {
            idBicicleta: bicisMantenimiento[3].idBicicleta,
            idOperador: opCampo.id,
            tipoManten: "Preventivo - Transmisión y Llantas",
            descripcion:
                "Mantenimiento programado de los 500 km en estación Parque de Belén.",
            tecnico: "Jorge Iván Zapata",
            actividad:
                "Lubricación de cadena, ajuste de tensión de radios y cambio de coraza trasera antipinchazos.",
            fechaInicio: new Date("2026-10-28T10:00:00-05:00"),
            fechaFin: null,
            costo: "95000.00",
            estado: "reportado",
        },
        // Mantenimientos ya finalizados en bicicletas que hoy están operativas
        {
            idBicicleta: bicisDisponibles[0].idBicicleta,
            idOperador: opTaller.id,
            tipoManten: "Preventivo General",
            descripcion: "Inspección mensual multipunto y actualización de firmware IoT.",
            tecnico: "Carlos Mario Restrepo",
            actividad: "Ajuste de torque en tornillería, limpieza de contactos y test QR.",
            fechaInicio: new Date("2026-10-01T08:00:00-05:00"),
            fechaFin: new Date("2026-10-01T11:30:00-05:00"),
            costo: "45000.00",
            estado: "finalizado",
        },
        {
            idBicicleta: bicisDisponibles[4].idBicicleta,
            idOperador: opTaller.id,
            tipoManten: "Correctivo - Llanta Pinchada",
            descripcion: "Reporte de cliente por baja presión al llegar a Ciudad del Río.",
            tecnico: "Jorge Iván Zapata",
            actividad: "Cambio de neumático interno reforzado y sellante líquido.",
            fechaInicio: new Date("2026-10-12T14:00:00-05:00"),
            fechaFin: new Date("2026-10-12T15:20:00-05:00"),
            costo: "38000.00",
            estado: "finalizado",
        },
    ];

    await drizzleDB.insert(schema.mantenimientos).values(valoresMantenimientos);

    // 2. Historial de Carga (Módulo Energía)
    const valoresHistorialCarga: schema.HistorialCargaInsert[] = [
        {
            idBateria: baterias[0].idBateria,
            idEstacion: estaciones[0].idEstacion, // Belén
            porcentajeInicial: "22.50",
            porcentajeFinal: "100.00",
            fechaInicio: new Date("2026-10-27T21:00:00-05:00"),
            fechaFin: new Date("2026-10-27T23:15:00-05:00"),
            tiempoCargaMin: 135,
            energiaConsumida: "0.425",
        },
        {
            idBateria: baterias[3].idBateria,
            idEstacion: estaciones[1].idEstacion, // Ciudad del Río
            porcentajeInicial: "18.00",
            porcentajeFinal: "99.00",
            fechaInicio: new Date("2026-10-27T22:00:00-05:00"),
            fechaFin: new Date("2026-10-28T00:25:00-05:00"),
            tiempoCargaMin: 145,
            energiaConsumida: "0.450",
        },
        {
            idBateria: baterias[6].idBateria,
            idEstacion: estaciones[2].idEstacion, // Laureles
            porcentajeInicial: "35.00",
            porcentajeFinal: "100.00",
            fechaInicio: new Date("2026-10-28T01:10:00-05:00"),
            fechaFin: new Date("2026-10-28T02:55:00-05:00"),
            tiempoCargaMin: 105,
            energiaConsumida: "0.360",
        },
        {
            idBateria: baterias[9].idBateria,
            idEstacion: estaciones[3].idEstacion, // Ruta N
            porcentajeInicial: "14.50",
            porcentajeFinal: "97.50",
            fechaInicio: new Date("2026-10-28T03:00:00-05:00"),
            fechaFin: new Date("2026-10-28T05:30:00-05:00"),
            tiempoCargaMin: 150,
            energiaConsumida: "0.540",
        },
        {
            idBateria: baterias[12].idBateria,
            idEstacion: estaciones[4].idEstacion, // Provenza
            porcentajeInicial: "29.00",
            porcentajeFinal: "100.00",
            fechaInicio: new Date("2026-10-28T04:00:00-05:00"),
            fechaFin: new Date("2026-10-28T05:50:00-05:00"),
            tiempoCargaMin: 110,
            energiaConsumida: "0.390",
        },
        {
            idBateria: baterias[24].idBateria, // Actualmente cargando en SENA Pedregal
            idEstacion: estaciones[9].idEstacion,
            porcentajeInicial: "10.00",
            porcentajeFinal: "38.00",
            fechaInicio: new Date("2026-10-28T17:15:00-05:00"),
            fechaFin: null,
            tiempoCargaMin: 45,
            energiaConsumida: "0.155",
        },
    ];

    await drizzleDB.insert(schema.historialCarga).values(valoresHistorialCarga);

    // 3. Alertas de Energía
    const valoresAlertas: schema.AlertasEnergiaInsert[] = [
        {
            idBateria: baterias[32].idBateria, // Batería dañada a 41.8°C
            tipoAlerta: "Sobrecalentamiento Crítico de Celdas",
            descripcion:
                "El sensor NTC del BMS reportó 41.8°C durante intento de carga en Estación Estadio. Puerto bloqueado preventivamente.",
            nivelPrioridad: "critica",
            estadoAlerta: "pendiente",
        },
        {
            idBateria: baterias[34].idBateria, // Batería de baja
            tipoAlerta: "Degradación de Vida Útil (SOH < 50%)",
            descripcion:
                "La capacidad efectiva cayó por debajo del umbral operativo tras superar 420 ciclos profundos.",
            nivelPrioridad: "alta",
            estadoAlerta: "revisada",
        },
        {
            idBateria: baterias[29].idBateria, // Batería en uso con 18.5%
            tipoAlerta: "Nivel de Carga Bajo en Ruta",
            descripcion:
                "Bicicleta en uso activo descendió del 20% de carga. Notificación enviada al usuario para retorno a estación cercana.",
            nivelPrioridad: "media",
            estadoAlerta: "pendiente",
        },
        {
            idBateria: baterias[31].idBateria,
            tipoAlerta: "Descarga Profunda en Estación",
            descripcion:
                "Batería permaneció en 12% sin iniciar ciclo automático en dock #4 de Ruta N.",
            nivelPrioridad: "baja",
            estadoAlerta: "resuelta",
        },
    ];

    await drizzleDB.insert(schema.alertasEnergia).values(valoresAlertas);

    // 4. Registros de Energía por Estación (Tarifa comercial EPM Medellín ~ $920.50 COP/kWh)
    // Nota: `totalCosto` es `generatedAlwaysAs`, Drizzle lo omite automáticamente en el insert.
    const valoresRegistrosEnergia: schema.RegistrosEnergiaInsert[] =
        estaciones.slice(0, 10).map((est, index) => ({
            idEstacion: est.idEstacion,
            cantidadKwh: (115.4 + index * 18.75).toFixed(3),
            costoKwh: "920.50",
            estadoRegistro: index === 8 ? "ajustado" : "valido",
            descripcion: `Corte mensual de telemedición de consumo energético - ${est.nombre} (Octubre 2026).`,
        }));

    await drizzleDB
        .insert(schema.registrosEnergia)
        .values(valoresRegistrosEnergia);

    // 5. Auditorías del Sistema
    const valoresAuditorias: schema.AuditoriasInsert[] = [
        {
            tablaAfectada: "estaciones",
            operacion: "UPDATE",
            idRegistro: estaciones[10].idEstacion,
            idUsuario: adminUser.id,
            datosAnteriores: { estado: "operativa" },
            datosNuevos: {
                estado: "mantenimiento",
                motivo: "Actualización de tótems de carga solar en Envigado",
            },
        },
        {
            tablaAfectada: "users",
            operacion: "UPDATE",
            idRegistro: 16,
            idUsuario: adminUser.id,
            datosAnteriores: { estado: "activo", banned: false },
            datosNuevos: {
                estado: "suspendido",
                banned: true,
                banReason: "Mora en penalización por entrega fuera de estación",
            },
        },
        {
            tablaAfectada: "bicicletas",
            operacion: "UPDATE",
            idRegistro: bicisMantenimiento[2].idBicicleta,
            idUsuario: opCampo.id,
            datosAnteriores: { estado: "disponible" },
            datosNuevos: {
                estado: "mantenimiento",
                alertaAsociada: "Sobrecalentamiento Crítico de Celdas",
            },
        },
    ];

    await drizzleDB.insert(schema.auditorias).values(valoresAuditorias);

    console.log(
        `  ✅ Created ${valoresMantenimientos.length} maintenances, ${valoresHistorialCarga.length} charge logs, ${valoresAlertas.length} energy alerts, ${valoresRegistrosEnergia.length} station energy bills & ${valoresAuditorias.length} audit logs.\n`,
    );
}

// ==========================================
// RUNNER
// ==========================================

// ==========================================
// 05. TARIFAS
// ==========================================
async function seedTarifas() {
    console.log("🌱 Seeding tarifas...");
    await drizzleDB.insert(schema.tarifas).values([
        {
            nombre: "Tarifa Estándar e-Bike",
            tarifaBase: "2000.00",
            tarifaMinuto: "300.00",
            descripcion: "Tarifa activa general del sistema: $2.000 COP base de desbloqueo y $300 COP por minuto de uso.",
            esActiva: true,
        },
    ]);
    console.log("  ✅ Created active standard tariff (.000 COP base, 00 COP / min).");
}

async function main() {
    await wipeDatabase();
    await seedTarifas();
    const allUsers = await seedUsers();
    const { estaciones, bicicletas, baterias } =
        await seedEbikeInfrastructure();
    await seedOperationsAndPayments(allUsers, estaciones, bicicletas);
    await seedMaintenanceEnergyAndAudits(
        allUsers,
        estaciones,
        bicicletas,
        baterias,
    );
}

main().then(
    () => {
        console.log("\n✅ Seed completo de eBike Medellín ejecutado con éxito.");
        process.exit(0);
    },
    (error: unknown) => {
        console.error("\n❌ Seed falló:", error);
        process.exit(1);
    },
);