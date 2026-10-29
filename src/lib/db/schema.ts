// src/lib/db/schemas.ts
import {
    InferSelectModel,
    InferInsertModel,
    defineRelations,
    sql,
} from "drizzle-orm";
import {
    pgTable,
    serial,
    text,
    varchar,
    boolean,
    timestamp,
    date,
    integer,
    numeric,
    jsonb,
    index,
    uuid,
    pgEnum,
    check,
} from "drizzle-orm/pg-core";

// =====================================================================
// 1. ENUMS DEL SISTEMA (Roles y Estados)
// =====================================================================

// Reemplaza la tabla 'roles' del SQL por un pgEnum limpio
export const userRoleEnum = pgEnum("user_role", [
    "cliente",
    "operador",
    "administrador",
    "superadministrador",
]);

export const estadoUsuarioEnum = pgEnum("estado_usuario", [
    "activo",
    "inactivo",
    "suspendido",
]);

export const estadoEstacionEnum = pgEnum("estado_estacion", [
    "operativa",
    "mantenimiento",
    "inactiva",
]);

export const estadoBicicletaEnum = pgEnum("estado_bicicleta", [
    "disponible",
    "en_uso",
    "mantenimiento",
    "baja",
]);

export const estadoBateriaEnum = pgEnum("estado_bateria", [
    "disponible",
    "cargando",
    "cargada",
    "baja",
    "dañada",
]);

export const estadoAlquilerEnum = pgEnum("estado_alquiler", [
    "activo",
    "completado",
    "cancelado",
    "incidencia",
]);

export const tipoMetodoPagoEnum = pgEnum("tipo_metodo_pago", [
    "tarjeta_credito",
    "tarjeta_debito",
    "transferencia",
    "billetera_digital",
]);

export const estadoPagoEnum = pgEnum("estado_pago", [
    "aprobado",
    "rechazado",
    "pendiente",
    "reembolsado",
]);

export const estadoMantenimientoEnum = pgEnum(
    "estado_mantenimiento",
    ["reportado", "en_mantenimiento", "finalizado"],
);

export const nivelPrioridadAlertaEnum = pgEnum(
    "nivel_prioridad_alerta",
    ["baja", "media", "alta", "critica"],
);

export const estadoAlertaEnum = pgEnum("estado_alerta", [
    "pendiente",
    "revisada",
    "resuelta",
]);

export const estadoRegistroEnergiaEnum = pgEnum(
    "estado_registro_energia",
    ["valido", "invalido", "ajustado"],
);

// =====================================================================
// 2. TABLAS DE BETTER AUTH (Intactas + telefono/estado del negocio)
// =====================================================================

export const users = pgTable(
    "users",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        email: text("email").notNull().unique(),
        emailVerified: boolean("email_verified")
            .default(false)
            .notNull(),
        image: text("image"),
        role: userRoleEnum("role").default("cliente").notNull(),
        telefono: varchar("telefono", { length: 20 }),
        estado: estadoUsuarioEnum("estado")
            .default("activo")
            .notNull(),
        banned: boolean("banned").default(false),
        banReason: text("ban_reason"),
        banExpires: timestamp("ban_expires", { mode: "date" }),
        isActive: boolean("is_active").default(true),
        tenantId: text("tenant_id"),
        createdAt: timestamp("created_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "date" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("idx_usuarios_email").on(table.email)],
);

export const sessions = pgTable(
    "sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        expiresAt: timestamp("expires_at", {
            mode: "date",
        }).notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "date" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        impersonatedBy: text("impersonated_by"),
    },
    (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
    "accounts",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", {
            mode: "date",
        }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
            mode: "date",
        }),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "date" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
    "verifications",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at", {
            mode: "date",
        }).notNull(),
        createdAt: timestamp("created_at", { mode: "date" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "date" })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("verifications_identifier_idx").on(table.identifier),
    ],
);

// =====================================================================
// 3. ESTACIONES
// =====================================================================

export const estaciones = pgTable(
    "estaciones",
    {
        idEstacion: serial("id_estacion").primaryKey(),
        codigo: varchar("codigo", { length: 50 }).notNull().unique(),
        nombre: varchar("nombre", { length: 100 }).notNull(),
        direccion: varchar("direccion", { length: 255 }),
        latitud: numeric("latitud", {
            precision: 10,
            scale: 7,
        }).notNull(),
        longitud: numeric("longitud", {
            precision: 10,
            scale: 7,
        }).notNull(),
        capacidad: integer("capacidad").notNull(),
        estado: estadoEstacionEnum("estado")
            .default("operativa")
            .notNull(),
        fechaCreacion: timestamp("fecha_creacion", { mode: "date" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        check(
            "chk_estaciones_capacidad",
            sql`${table.capacidad} > 0`,
        ),
    ],
);

// =====================================================================
// 4. BICICLETAS
// =====================================================================

export const bicicletas = pgTable(
    "bicicletas",
    {
        idBicicleta: serial("id_bicicleta").primaryKey(),
        idEstacionActual: integer("id_estacion_actual").references(
            () => estaciones.idEstacion,
        ),
        codigoQr: varchar("codigo_qr", { length: 100 })
            .notNull()
            .unique(),
        modelo: varchar("modelo", { length: 100 }),
        numeroSerie: varchar("numero_serie", { length: 100 })
            .notNull()
            .unique(),
        nivelBateria: numeric("nivel_bateria", {
            precision: 5,
            scale: 2,
        })
            .default("100.00")
            .notNull(),
        estado: estadoBicicletaEnum("estado")
            .default("disponible")
            .notNull(),
        kilometraje: numeric("kilometraje", {
            precision: 10,
            scale: 2,
        })
            .default("0.00")
            .notNull(),
        fechaUltMant: date("fecha_ult_mant"),
        fechaProxMant: date("fecha_prox_mant"),
    },
    (table) => [
        index("idx_bicicletas_estado").on(table.estado),
        index("idx_bicicletas_estacion").on(table.idEstacionActual),
        check(
            "chk_bicicletas_nivel_bateria",
            sql`${table.nivelBateria} BETWEEN 0 AND 100`,
        ),
    ],
);

// =====================================================================
// 5. BATERIAS
// =====================================================================

export const baterias = pgTable(
    "baterias",
    {
        idBateria: serial("id_bateria").primaryKey(),
        codigoBateria: varchar("codigo_bateria", { length: 100 })
            .notNull()
            .unique(),
        capacidadWh: numeric("capacidad_wh", {
            precision: 10,
            scale: 2,
        }).notNull(),
        nivelCarga: numeric("nivel_carga", { precision: 5, scale: 2 })
            .default("100.00")
            .notNull(),
        temperatura: numeric("temperatura", {
            precision: 5,
            scale: 2,
        }),
        estado: estadoBateriaEnum("estado")
            .default("disponible")
            .notNull(),
        fechaInstalacion: date("fecha_instalacion").notNull(),
        vidaUtil: integer("vida_util"),
        idBicicleta: integer("id_bicicleta")
            .notNull()
            .references(() => bicicletas.idBicicleta),
    },
    (table) => [
        index("idx_baterias_bicicleta").on(table.idBicicleta),
        check(
            "chk_baterias_nivel_carga",
            sql`${table.nivelCarga} BETWEEN 0 AND 100`,
        ),
    ],
);

// =====================================================================
// 6. ALQUILERES
// =====================================================================

export const alquileres = pgTable(
    "alquileres",
    {
        idAlquiler: serial("id_alquiler").primaryKey(),
        // Apunta a users.id (UUID de Better Auth)
        idUsuario: uuid("id_usuario")
            .notNull()
            .references(() => users.id),
        idBicicleta: integer("id_bicicleta")
            .notNull()
            .references(() => bicicletas.idBicicleta),
        idEstacionOrigen: integer("id_estacion_origen")
            .notNull()
            .references(() => estaciones.idEstacion),
        idEstacionDestino: integer("id_estacion_destino").references(
            () => estaciones.idEstacion,
        ),
        uuidAlquiler: uuid("uuid_alquiler").defaultRandom().notNull(),
        fechaInicio: timestamp("fecha_inicio", {
            mode: "date",
        }).notNull(),
        fechaFin: timestamp("fecha_fin", { mode: "date" }),
        costoTotal: numeric("costo_total", {
            precision: 10,
            scale: 2,
        }),
        estado: estadoAlquilerEnum("estado")
            .default("activo")
            .notNull(),
    },
    (table) => [
        index("idx_alquileres_usuario").on(table.idUsuario),
        index("idx_alquileres_bicicleta").on(table.idBicicleta),
        index("idx_alquileres_estado").on(table.estado),
        index("idx_alquileres_fecha_inicio").on(table.fechaInicio),
        check(
            "chk_alquileres_fechas",
            sql`${table.fechaFin} IS NULL OR ${table.fechaFin} > ${table.fechaInicio}`,
        ),
    ],
);

// =====================================================================
// 7. METODOS_PAGO
// =====================================================================

export const metodosPago = pgTable("metodos_pago", {
    idMetodo: serial("id_metodo").primaryKey(),
    idUsuario: uuid("id_usuario")
        .notNull()
        .references(() => users.id),
    tipo: tipoMetodoPagoEnum("tipo").notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    activo: boolean("activo").default(true).notNull(),
    fechaCreacion: timestamp("fecha_creacion", { mode: "date" })
        .defaultNow()
        .notNull(),
});

// =====================================================================
// 8. TRANSACCIONES
// =====================================================================

export const transacciones = pgTable(
    "transacciones",
    {
        idTransaccion: serial("id_transaccion").primaryKey(),
        idAlquiler: integer("id_alquiler")
            .notNull()
            .unique()
            .references(() => alquileres.idAlquiler),
        idMetodoPago: integer("id_metodo_pago")
            .notNull()
            .references(() => metodosPago.idMetodo),
        monto: numeric("monto", {
            precision: 10,
            scale: 2,
        }).notNull(),
        estadoPago: estadoPagoEnum("estado_pago")
            .default("pendiente")
            .notNull(),
        referenciaExterna: varchar("referencia_externa", {
            length: 255,
        }),
        fechaProcesamiento: timestamp("fecha_procesamiento", {
            mode: "date",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("idx_transacciones_estado").on(table.estadoPago),
    ],
);

// =====================================================================
// 9. MANTENIMIENTOS
// =====================================================================

export const mantenimientos = pgTable(
    "mantenimientos",
    {
        idMantenimiento: serial("id_mantenimiento").primaryKey(),
        idBicicleta: integer("id_bicicleta")
            .notNull()
            .references(() => bicicletas.idBicicleta),
        // Operador apunta a users.id (UUID)
        idOperador: uuid("id_operador")
            .notNull()
            .references(() => users.id),
        tipoManten: varchar("tipo_manten", { length: 100 }),
        descripcion: text("descripcion"),
        tecnico: varchar("tecnico", { length: 150 }),
        actividad: text("actividad"),
        fechaInicio: timestamp("fecha_inicio", {
            mode: "date",
        }).notNull(),
        fechaFin: timestamp("fecha_fin", { mode: "date" }),
        costo: numeric("costo", { precision: 10, scale: 2 }),
        estado: estadoMantenimientoEnum("estado")
            .default("reportado")
            .notNull(),
    },
    (table) => [
        index("idx_mantenimientos_bicicleta").on(table.idBicicleta),
        check(
            "chk_mantenimientos_fechas",
            sql`${table.fechaFin} IS NULL OR ${table.fechaFin} >= ${table.fechaInicio}`,
        ),
    ],
);

// =====================================================================
// 10. HISTORIAL_CARGA (Módulo Energía)
// =====================================================================

export const historialCarga = pgTable(
    "historial_carga",
    {
        idHistorial: serial("id_historial").primaryKey(),
        idBateria: integer("id_bateria")
            .notNull()
            .references(() => baterias.idBateria),
        idEstacion: integer("id_estacion").references(
            () => estaciones.idEstacion,
        ),
        porcentajeInicial: numeric("porcentaje_inicial", {
            precision: 5,
            scale: 2,
        }).notNull(),
        porcentajeFinal: numeric("porcentaje_final", {
            precision: 5,
            scale: 2,
        }).notNull(),
        fechaInicio: timestamp("fecha_inicio", {
            mode: "date",
        }).notNull(),
        fechaFin: timestamp("fecha_fin", { mode: "date" }),
        tiempoCargaMin: integer("tiempo_carga_min"),
        energiaConsumida: numeric("energia_consumida", {
            precision: 10,
            scale: 3,
        }),
    },
    (table) => [
        check(
            "chk_historial_porcentaje_inicial",
            sql`${table.porcentajeInicial} BETWEEN 0 AND 100`,
        ),
        check(
            "chk_historial_porcentaje_final",
            sql`${table.porcentajeFinal} BETWEEN 0 AND 100`,
        ),
    ],
);

// =====================================================================
// 11. ALERTAS_ENERGIA (Módulo Energía)
// =====================================================================

export const alertasEnergia = pgTable("alertas_energia", {
    idAlerta: serial("id_alerta").primaryKey(),
    idBateria: integer("id_bateria")
        .notNull()
        .references(() => baterias.idBateria),
    tipoAlerta: varchar("tipo_alerta", { length: 100 }).notNull(),
    descripcion: text("descripcion"),
    nivelPrioridad: nivelPrioridadAlertaEnum("nivel_prioridad")
        .default("media")
        .notNull(),
    fechaAlerta: timestamp("fecha_alerta", { mode: "date" })
        .defaultNow()
        .notNull(),
    estadoAlerta: estadoAlertaEnum("estado_alerta")
        .default("pendiente")
        .notNull(),
});

// =====================================================================
// 12. REGISTROS_ENERGIA (Módulo Energía)
// =====================================================================

export const registrosEnergia = pgTable(
    "registros_energia",
    {
        idRegistro: serial("id_registro").primaryKey(),
        idEstacion: integer("id_estacion")
            .notNull()
            .references(() => estaciones.idEstacion),
        cantidadKwh: numeric("cantidad_kwh", {
            precision: 10,
            scale: 3,
        }).notNull(),
        costoKwh: numeric("costo_kwh", {
            precision: 10,
            scale: 2,
        }).notNull(),
        totalCosto: numeric("total_costo", {
            precision: 10,
            scale: 2,
        }).generatedAlwaysAs(sql`cantidad_kwh * costo_kwh`),
        fechaRegistro: timestamp("fecha_registro", { mode: "date" })
            .defaultNow()
            .notNull(),
        estadoRegistro: estadoRegistroEnergiaEnum("estado_registro")
            .default("valido")
            .notNull(),
        descripcion: text("descripcion"),
    },
    (table) => [
        index("idx_registros_energia_estacion").on(table.idEstacion),
    ],
);

// =====================================================================
// 13. AUDITORIAS (Mantenibilidad)
// =====================================================================

export const auditorias = pgTable("auditorias", {
    idAuditoria: serial("id_auditoria").primaryKey(),
    tablaAfectada: varchar("tabla_afectada", {
        length: 100,
    }).notNull(),
    operacion: varchar("operacion", { length: 20 }).notNull(),
    idRegistro: integer("id_registro"),
    // UUID porque el usuario autenticado viene de users.id
    idUsuario: uuid("id_usuario"),
    datosAnteriores: jsonb("datos_anteriores"),
    datosNuevos: jsonb("datos_nuevos"),
    fechaEvento: timestamp("fecha_evento", { mode: "date" })
        .defaultNow()
        .notNull(),
});

// =====================================================================
// 14. TARIFAS (Gestión de Precios)
// =====================================================================

export const tarifas = pgTable("tarifas", {
    idTarifa: serial("id_tarifa").primaryKey(),
    nombre: varchar("nombre", { length: 100 }).notNull(),
    tarifaBase: numeric("tarifa_base", {
        precision: 10,
        scale: 2,
    }).notNull(),
    tarifaMinuto: numeric("tarifa_minuto", {
        precision: 10,
        scale: 2,
    }).notNull(),
    descripcion: text("descripcion"),
    esActiva: boolean("es_activa").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// =====================================================================
// RELACIONES (defineRelations v2 - Drizzle 1.0.0-rc.4)
// =====================================================================

export const relations = defineRelations(
    {
        users,
        sessions,
        accounts,
        verifications,
        estaciones,
        bicicletas,
        baterias,
        alquileres,
        metodosPago,
        transacciones,
        mantenimientos,
        historialCarga,
        alertasEnergia,
        registrosEnergia,
        auditorias,
        tarifas,
    },
    (r) => ({
        users: {
            sessions: r.many.sessions({
                from: r.users.id,
                to: r.sessions.userId,
            }),
            accounts: r.many.accounts({
                from: r.users.id,
                to: r.accounts.userId,
            }),
            alquileres: r.many.alquileres({
                from: r.users.id,
                to: r.alquileres.idUsuario,
            }),
            metodosPago: r.many.metodosPago({
                from: r.users.id,
                to: r.metodosPago.idUsuario,
            }),
            mantenimientos: r.many.mantenimientos({
                from: r.users.id,
                to: r.mantenimientos.idOperador,
            }),
        },
        sessions: {
            user: r.one.users({
                from: r.sessions.userId,
                to: r.users.id,
            }),
        },
        accounts: {
            user: r.one.users({
                from: r.accounts.userId,
                to: r.users.id,
            }),
        },
        estaciones: {
            bicicletasActuales: r.many.bicicletas({
                from: r.estaciones.idEstacion,
                to: r.bicicletas.idEstacionActual,
            }),
            alquileresOrigen: r.many.alquileres({
                from: r.estaciones.idEstacion,
                to: r.alquileres.idEstacionOrigen,
                alias: "estacion_origen",
            }),
            alquileresDestino: r.many.alquileres({
                from: r.estaciones.idEstacion,
                to: r.alquileres.idEstacionDestino,
                alias: "estacion_destino",
            }),
            historialCargas: r.many.historialCarga({
                from: r.estaciones.idEstacion,
                to: r.historialCarga.idEstacion,
            }),
            registrosEnergia: r.many.registrosEnergia({
                from: r.estaciones.idEstacion,
                to: r.registrosEnergia.idEstacion,
            }),
        },
        bicicletas: {
            estacionActual: r.one.estaciones({
                from: r.bicicletas.idEstacionActual,
                to: r.estaciones.idEstacion,
            }),
            baterias: r.many.baterias({
                from: r.bicicletas.idBicicleta,
                to: r.baterias.idBicicleta,
            }),
            alquileres: r.many.alquileres({
                from: r.bicicletas.idBicicleta,
                to: r.alquileres.idBicicleta,
            }),
            mantenimientos: r.many.mantenimientos({
                from: r.bicicletas.idBicicleta,
                to: r.mantenimientos.idBicicleta,
            }),
        },
        baterias: {
            bicicleta: r.one.bicicletas({
                from: r.baterias.idBicicleta,
                to: r.bicicletas.idBicicleta,
            }),
            historialCargas: r.many.historialCarga({
                from: r.baterias.idBateria,
                to: r.historialCarga.idBateria,
            }),
            alertasEnergia: r.many.alertasEnergia({
                from: r.baterias.idBateria,
                to: r.alertasEnergia.idBateria,
            }),
        },
        alquileres: {
            usuario: r.one.users({
                from: r.alquileres.idUsuario,
                to: r.users.id,
            }),
            bicicleta: r.one.bicicletas({
                from: r.alquileres.idBicicleta,
                to: r.bicicletas.idBicicleta,
            }),
            estacionOrigen: r.one.estaciones({
                from: r.alquileres.idEstacionOrigen,
                to: r.estaciones.idEstacion,
                alias: "estacion_origen",
            }),
            estacionDestino: r.one.estaciones({
                from: r.alquileres.idEstacionDestino,
                to: r.estaciones.idEstacion,
                alias: "estacion_destino",
            }),
            transaccion: r.one.transacciones({
                from: r.alquileres.idAlquiler,
                to: r.transacciones.idAlquiler,
            }),
        },
        metodosPago: {
            usuario: r.one.users({
                from: r.metodosPago.idUsuario,
                to: r.users.id,
            }),
            transacciones: r.many.transacciones({
                from: r.metodosPago.idMetodo,
                to: r.transacciones.idMetodoPago,
            }),
        },
        transacciones: {
            alquiler: r.one.alquileres({
                from: r.transacciones.idAlquiler,
                to: r.alquileres.idAlquiler,
            }),
            metodoPago: r.one.metodosPago({
                from: r.transacciones.idMetodoPago,
                to: r.metodosPago.idMetodo,
            }),
        },
        mantenimientos: {
            bicicleta: r.one.bicicletas({
                from: r.mantenimientos.idBicicleta,
                to: r.bicicletas.idBicicleta,
            }),
            operador: r.one.users({
                from: r.mantenimientos.idOperador,
                to: r.users.id,
            }),
        },
        historialCarga: {
            bateria: r.one.baterias({
                from: r.historialCarga.idBateria,
                to: r.baterias.idBateria,
            }),
            estacion: r.one.estaciones({
                from: r.historialCarga.idEstacion,
                to: r.estaciones.idEstacion,
            }),
        },
        alertasEnergia: {
            bateria: r.one.baterias({
                from: r.alertasEnergia.idBateria,
                to: r.baterias.idBateria,
            }),
        },
        registrosEnergia: {
            estacion: r.one.estaciones({
                from: r.registrosEnergia.idEstacion,
                to: r.estaciones.idEstacion,
            }),
        },
    }),
);

// =====================================================================
// TIPOS INFERIDOS
// =====================================================================

// Auth
export type UsersSelect = InferSelectModel<typeof users>;
export type UsersInsert = InferInsertModel<typeof users>;
export type SessionsSelect = InferSelectModel<typeof sessions>;
export type SessionsInsert = InferInsertModel<typeof sessions>;
export type AccountsSelect = InferSelectModel<typeof accounts>;
export type AccountsInsert = InferInsertModel<typeof accounts>;
export type VerificationsSelect = InferSelectModel<
    typeof verifications
>;
export type VerificationsInsert = InferInsertModel<
    typeof verifications
>;

export type UserWithSessions = UsersSelect & {
    sessions: SessionsSelect[];
};

export type UserWithAccounts = UsersSelect & {
    accounts: AccountsSelect[];
};

export type FullUser = UsersSelect & {
    sessions: SessionsSelect[];
    accounts: AccountsSelect[];
};

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type EstadoUsuario =
    (typeof estadoUsuarioEnum.enumValues)[number];

// Dominio eBike
export type EstacionesSelect = InferSelectModel<typeof estaciones>;
export type EstacionesInsert = InferInsertModel<typeof estaciones>;

export type BicicletasSelect = InferSelectModel<typeof bicicletas>;
export type BicicletasInsert = InferInsertModel<typeof bicicletas>;

export type BateriasSelect = InferSelectModel<typeof baterias>;
export type BateriasInsert = InferInsertModel<typeof baterias>;

export type AlquileresSelect = InferSelectModel<typeof alquileres>;
export type AlquileresInsert = InferInsertModel<typeof alquileres>;

export type MetodosPagoSelect = InferSelectModel<typeof metodosPago>;
export type MetodosPagoInsert = InferInsertModel<typeof metodosPago>;

export type TransaccionesSelect = InferSelectModel<
    typeof transacciones
>;
export type TransaccionesInsert = InferInsertModel<
    typeof transacciones
>;

export type MantenimientosSelect = InferSelectModel<
    typeof mantenimientos
>;
export type MantenimientosInsert = InferInsertModel<
    typeof mantenimientos
>;

export type HistorialCargaSelect = InferSelectModel<
    typeof historialCarga
>;
export type HistorialCargaInsert = InferInsertModel<
    typeof historialCarga
>;

export type AlertasEnergiaSelect = InferSelectModel<
    typeof alertasEnergia
>;
export type AlertasEnergiaInsert = InferInsertModel<
    typeof alertasEnergia
>;

export type RegistrosEnergiaSelect = InferSelectModel<
    typeof registrosEnergia
>;
export type RegistrosEnergiaInsert = InferInsertModel<
    typeof registrosEnergia
>;

export type AuditoriasSelect = InferSelectModel<typeof auditorias>;
export type AuditoriasInsert = InferInsertModel<typeof auditorias>;

export type Tarifa = InferSelectModel<typeof tarifas>;
export type NewTarifa = InferInsertModel<typeof tarifas>;

export type EstadoEstacion =
    (typeof estadoEstacionEnum.enumValues)[number];
export type EstadoBicicleta =
    (typeof estadoBicicletaEnum.enumValues)[number];
export type EstadoBateria =
    (typeof estadoBateriaEnum.enumValues)[number];
export type EstadoAlquiler =
    (typeof estadoAlquilerEnum.enumValues)[number];
export type TipoMetodoPago =
    (typeof tipoMetodoPagoEnum.enumValues)[number];
export type EstadoPago = (typeof estadoPagoEnum.enumValues)[number];
export type EstadoMantenimiento =
    (typeof estadoMantenimientoEnum.enumValues)[number];
export type NivelPrioridadAlerta =
    (typeof nivelPrioridadAlertaEnum.enumValues)[number];
export type EstadoAlerta =
    (typeof estadoAlertaEnum.enumValues)[number];
export type EstadoRegistroEnergia =
    (typeof estadoRegistroEnergiaEnum.enumValues)[number];
