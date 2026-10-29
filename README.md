# ⚡ E-Bike App — Plataforma de Gestión y Alquiler de Bicicletas Eléctricas Inteligentes

> **Muestra Integral de Frontend & Bases de Datos Relacionales Avanzadas**  
> **Programa:** Técnico en Programación de Software — SENA (Ficha: `3534665`)  
> **Autor & Desarrollador Principal:** Juan Esteban Benjumea Correa `{ JEBC-DeV }`  
> 🌐 **Despliegue en Producción (Vercel):** [https://e-bike-app.vercel.app/](https://e-bike-app.vercel.app/)  
> 📦 **Repositorio Oficial (GitHub):** [https://github.com/esteban5tael/e-bike-app](https://github.com/esteban5tael/e-bike-app)  
> 🗄️ **Motor de Base de Datos:** PostgreSQL Serverless en [Neon.tech](https://neon.tech/)

---

## 📑 Tabla de Contenidos

1. [🎯 Propósito del Proyecto y Problema que Resuelve](#-propósito-del-proyecto-y-problema-que-resuelve)
2. [🏗️ Arquitectura del Sistema y Patrones de Diseño](#️-arquitectura-del-sistema-y-patrones-de-diseño)
3. [💻 Stack Tecnológico de Vanguardia](#-stack-tecnológico-de-vanguardia)
4. [🗄️ Modelo de Base de Datos y Entidad-Relación (Neon PostgreSQL)](#️-modelo-de-base-de-datos-y-entidad-relación-neon-postgresql)
5. [🔐 Seguridad, Roles y Autenticación de Grado Producción](#-seguridad-roles-y-autenticación-de-grado-producción)
6. [🧩 Estructura Modular y Feature-Driven Architecture](#-estructura-modular-y-feature-driven-architecture)
7. [🚀 Puesta en Marcha en Entorno Local (Guía Paso a Paso)](#-puesta-en-marcha-en-entorno-local-guía-paso-a-paso)
8. [📊 Scripts y Ciclo de Vida del Proyecto](#-scripts-y-ciclo-de-vida-del-proyecto)
9. [🎓 Conceptos Clave de Aprendizaje para Estudiantes](#-conceptos-clave-de-aprendizaje-para-estudiantes)
10. [👨‍💻 Sobre el Desarrollador](#-sobre-el-desarrollador)

---

## 🎯 Propósito del Proyecto y Problema que Resuelve

### ¿Por qué nace E-Bike App?
Las ciudades contemporáneas enfrentan retos críticos en movilidad urbana sostenible y reducción de huella de carbono. Las flotas de micromovilidad eléctrica (e-bikes) requieren sistemas de información en tiempo real capaces de resolver tres desafíos simultáneamente:

1. **Gestión Operativa y Telemetría de Flota:** Monitoreo dinámico del nivel de batería, estado físico de la unidad (disponible, en uso, mantenimiento, baja) y ubicación geográfica de estaciones y terminales de carga.
2. **Experiencia de Usuario (Frontend Reactivo):** Interfaz fluida, instantánea, accesible y segura donde los usuarios pueden consultar estaciones en tiempo real, desbloquear unidades mediante códigos QR, alquilar y gestionar pagos sin fricciones.
3. **Consistencia Transaccional Estricta (Bases de Datos):** Evitar sobre-alquileres (race conditions), garantizar auditoría de cambios en cada registro, calcular consumos y costos energéticos con precisión matemática y aplicar reglas de negocio a nivel de motor SQL.

---

## 🏗️ Arquitectura del Sistema y Patrones de Diseño

El sistema está construido bajo principios de **arquitectura desacoplada, orientada a dominios y con tipado estricto de extremo a extremo (End-to-End Type Safety)**:

```mermaid
flowchart TD
    User([Cliente / Navegador Web]) <--> NextUI[Frontend: Next.js 16 + React 19 + Base UI]
    NextUI <--> ServerActions[Server Actions Seguras - "use server"]
    ServerActions <--> GuardLayer[Role Guards + Rate Limiter en Memoria]
    GuardLayer <--> BetterAuth[Better-Auth v1.7.6 Session Engine]
    GuardLayer <--> DrizzleORM[Drizzle ORM v2 - Type-Safe SQL Queries]
    DrizzleORM <--> NeonPG[(PostgreSQL en Neon Database)]
    ServerActions <--> TanStackQuery[TanStack React Query Cache Invalidation]
```

### Principios Arquitectónicos Implementados:
- **Zero Raw Data Leaks (DTOs Manuales):** Ninguna fila cruda de la base de datos se envía al cliente. Todas las respuestas de servidor se procesan mediante contratos DTO estructurados campo por campo, transformando fechas a strings ISO 8601 e impidiendo la fuga de hashes de contraseñas, tokens de sesión o metadatos sensibles.
- **Validación Bidireccional:** Validación exhaustiva con **Zod v4** en el frontend (React Hook Form) y en el backend (Server Actions) con modo estricto (`.strict()`) para repeler cualquier inyección de parámetros no autorizados.
- **Transaccionalidad ACID y Constraints Reales:** Restricciones de verificación (`CHECK`), índices compuestos y tipos enumerados nativos (`pgEnum`) aplicados directamente en PostgreSQL.

---

## 💻 Stack Tecnológico de Vanguardia

| Capa | Tecnología | Justificación y Ventaja Técnica |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js 16.3.6 (App Router + Turbopack)** | Renderizado dinámico de alto rendimiento con Server Components y Server Actions nativas. |
| **Librería UI** | **React 19.2.8 + React Compiler** | Optimización automática de re-renders mediante el nuevo compilador de React sin necesidad de `useMemo` ni `useCallback` manuales. |
| **Componentes Base** | **Base UI (`@base-ui/react`) + Lucide Icons** | Primitivas de interfaz sin estilos con composición moderna mediante prop `render` (eliminando antipatrones de `asChild`). |
| **Estilos CSS** | **Tailwind CSS v4** | Motor de estilos de última generación basado en CSS-First sin dependencias complejas de configuración. |
| **ORM / Acceso a Datos** | **Drizzle ORM 1.0.0-rc.4 (API v2)** | ORM TypeScript con mapeo exacto SQL, migraciones automáticas y relaciones declarativas `defineRelations`. |
| **Base de Datos** | **PostgreSQL (Neon Serverless)** | Base de datos relacional serverless con escalabilidad automática, índices B-Tree y llaves foráneas en cascada. |
| **Autenticación** | **Better-Auth 1.7.6 + Admin Plugin** | Motor moderno de sesiones criptográficamente seguras con soporte de baneo activo y revocación de tokens. |
| **Estado Asíncrono** | **TanStack React Query v5** | Manejo de caché, reintentos y actualización optimista de datos del lado del cliente. |
| **Validación de Datos** | **Zod v4** | Esquemas de validación de tipado estricto con inferencia estática de tipos en TypeScript. |

---

## 🗄️ Modelo de Base de Datos y Entidad-Relación (Neon PostgreSQL)

La base de datos alojada en **Neon.tech** implementa un diseño relacional normalizado con soporte integral para operaciones del mundo real:

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "inicia"
    USERS ||--o{ ACCOUNTS : "autentica"
    USERS ||--o{ ALQUILERES : "solicita"
    USERS ||--o{ METODOS_PAGO : "registra"
    USERS ||--o{ MANTENIMIENTOS : "ejecuta (operador)"
    
    ESTACIONES ||--o{ BICICLETAS : "alberga actualmente"
    ESTACIONES ||--o{ ALQUILERES : "origen / destino"
    ESTACIONES ||--o{ REGISTROS_ENERGIA : "consume"
    
    BICICLETAS ||--|| BATERIAS : "porta"
    BICICLETAS ||--o{ ALQUILERES : "es alquilada"
    BICICLETAS ||--o{ MANTENIMIENTOS : "recibe"
    
    BATERIAS ||--o{ HISTORIAL_CARGA : "registra"
    BATERIAS ||--o{ ALERTAS_ENERGIA : "genera"
    
    ALQUILERES ||--o| TRANSACCIONES : "liquida"
    METODOS_PAGO ||--o{ TRANSACCIONES : "procesa"
```

### Módulos Principales de la Base de Datos:
1. **Identidad & Acceso:** `users`, `sessions`, `accounts`, `verifications` (Control de credenciales, tokens, roles y fechas de expiración).
2. **Infraestructura de Estaciones:** `estaciones` (Capacidad física, geolocalización con coordenadas `latitud`/`longitud` en precisión decimal y validación `capacidad > 0`).
3. **Flota de E-Bikes & Energía:**
   - `bicicletas`: Seriales únicos, código QR, odómetro / kilometraje acumulado, nivel de batería (`BETWEEN 0 AND 100`).
   - `baterias`: Códigos de serie, capacidad en vatios-hora (`capacidad_wh`), temperatura operativa y vida útil restante.
   - `historial_carga`: Auditoría de ciclos de carga con porcentaje inicial, porcentaje final, tiempo en minutos y energía consumida.
   - `registros_energia`: Métricas de consumo KWh de estaciones con columna generada automáticamente por PostgreSQL: `total_costo = cantidad_kwh * costo_kwh`.
   - `alertas_energia`: Alertas automáticas por umbrales críticos de temperatura o anomalías de voltaje.
4. **Ciclo de Negocio y Alquileres:**
   - `alquileres`: Trazabilidad completa con UUID público, validación de integridad (`fecha_fin > fecha_inicio`), estaciones de origen/destino y estado (`activo`, `completado`, `cancelado`, `incidencia`).
   - `tarifas`: Base de precios dinámicos con cobro base + minuto de trayecto.
   - `metodos_pago` y `transacciones`: Cobros seguros con almacenamiento mediante hash y referencia externa de pasarela de pago.
5. **Mantenimiento y Auditoría:**
   - `mantenimientos`: Bitácora técnica con asignación a operadores, costo del mantenimiento y fechas de inicio/fin.
   - `auditorias`: Tabla general de auditoría forense que almacena en formato JSONB los estados `datos_anteriores` y `datos_nuevos` ante cualquier cambio en el sistema.

---

## 🔐 Seguridad, Roles y Autenticación de Grado Producción

El proyecto implementa una matriz de **Control de Acceso Basado en Roles (RBAC)** usando tipos nativos `pgEnum` de PostgreSQL:

* **Cliente:** Acceso al catálogo de estaciones, alquiler de bicicletas, consulta de historial personal y gestión de perfil.
* **Operador:** Gestión de mantenimientos técnicos, inspección de alertas de energía y reubicación de flota.
* **Administrador:** Gestión operativa global, supervisión de tarifas, reportes de uso y control de flota.
* **Superadministrador:** Acceso irrestricto, auditoría del sistema y control de cuentas/baneos.

### Reglas de Seguridad Clave:
- **Protección contra Fuga de Roles:** Las consultas SQL nunca comparan roles con cadenas parciales (`LIKE`/`ILIKE`) para evitar incompatibilidades de tipo enum y vulnerabilidades de coerción.
- **Rate-Limiting en Memoria:** Protección contra ataques de fuerza bruta en los endpoints de inicio de sesión y recuperación de contraseña.
- **Tiempo de Respuesta Homogéneo:** Mitigación de ataques de enumeración de usuarios calculando hashes computacionales dummy incluso cuando el usuario no existe en la base de datos (`spendVerificationTime`).
- **Aislamiento de Sesiones:** El cierre de sesión y el baneo administrativo invalidan instantáneamente todas las sesiones activas en la tabla `sessions`.

---

## 🧩 Estructura Modular y Feature-Driven Architecture

El código fuente está organizado bajo la metodología **Feature-Driven Architecture (FDA)**, garantizando que cada funcionalidad contenga sus propias acciones de servidor, componentes, esquemas y hooks de consulta:

```text
e-bike-app/
├── src/
│   ├── app/                      # Rutas de Next.js (App Router)
│   │   ├── (cuenta)/             # Rutas públicas de autenticación (login, registro)
│   │   ├── (privado)/            # Rutas protegidas (panel, alquileres, perfil, admin)
│   │   ├── (publico)/            # Landing page y explorador público de estaciones
│   │   └── globals.css           # Configuración CSS-First con Tailwind v4
│   ├── features/                 # Módulos de dominio aislados
│   │   ├── public/               # Módulos accesibles por visitantes
│   │   │   ├── auth/             # Login, registro, recuperación de contraseña
│   │   │   └── landing/          # Vistas públicas y catálogo de estaciones
│   │   ├── private/              # Módulos con requerimiento de autenticación
│   │   │   ├── client-rental/    # Flujo interactivo de alquiler de e-bikes
│   │   │   ├── dashboard/        # Paneles de control y administración
│   │   │   └── profile/          # Gestión de datos del usuario autenticado
│   │   └── shared/               # Recursos transversales
│   │       ├── components/ui/    # Primitivas UI reutilizables (Base UI)
│   │       └── types/            # Tipos genéricos de respuesta (IGeneralResponse<T>)
│   └── lib/                      # Configuraciones base del backend
│       ├── auth/                 # Configuración de Better-Auth y Role Guards
│       └── db/                   # Instancia Drizzle, Schemas, Relaciones y Seeders
```

---

## 🚀 Puesta en Marcha en Entorno Local (Guía Paso a Paso)

Sigue estos pasos para desplegar el proyecto en tu máquina local:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/esteban5tael/e-bike-app.git
cd e-bike-app
```

### 2. Instalar Dependencias con pnpm
```bash
# Se requiere Node.js v20+ y pnpm v9+ o v12+
pnpm install
```

### 3. Configurar las Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como plantilla `.env.example`:

```env
# Conexión a Neon PostgreSQL
DATABASE_URL="postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Secreto criptográfico de autenticación (Generar con: openssl rand -base64 32)
BETTER_AUTH_SECRET="tu-clave-secreta-super-segura-de-32-caracteres"
BETTER_AUTH_URL="http://localhost:3000"

# Entorno de desarrollo
ENVIRONMENT="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Contraseña maestra para el seeder de base de datos (mínimo 16 caracteres)
SEED_USERS_PASSWORD="ClaveMaestraSegura2026!#"
SUPER_ADMIN_ROLE="superadministrador"

# Notificaciones y correos (Mailtrap para pruebas de desarrollo)
MAILTRAP_API_TOKEN=""
MAIL_FROM="noreply@ebikeapp.com"
```

### 4. Generar Migraciones y Cargar Datos Iniciales (Seed)
El proyecto cuenta con un pipeline automatizado para reiniciar el esquema e inyectar registros de prueba (usuarios, estaciones, bicicletas y tarifas):

```bash
pnpm seed
```

### 5. Iniciar el Servidor de Desarrollo
```bash
pnpm dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 📊 Scripts y Ciclo de Vida del Proyecto

El archivo `package.json` define los comandos estandarizados de compilación y mantenimiento:

| Comando | Acción Realizada |
| :--- | :--- |
| `pnpm dev` | Inicia el servidor de desarrollo con Turbopack ultrarrápido. |
| `pnpm build` | Compila el proyecto Next.js y ejecuta la verificación completa de tipos de TypeScript. |
| `pnpm start` | Limpia los artefactos previos, compila el código y arranca la aplicación en modo producción. |
| `pnpm lint` | Analiza el código fuente con ESLint bajo reglas de código limpio de Next.js. |
| `pnpm seed` | Pipeline de base de datos: regenera migraciones en Drizzle, aplica los cambios en Neon y ejecuta el semillero. |

---

## 🎓 Conceptos Clave de Aprendizaje para Estudiantes

Este repositorio fue concebido no solo como un entregable funcional, sino como un **ejemplo pedagógico de nivel industrial**. Conceptos fundamentales a estudiar en este código:

1. **¿Qué es un ORM y por qué usar Drizzle?**  
   Drizzle permite interactuar con la base de datos escribiendo código TypeScript seguro en tiempo de compilación. Si modificas una columna en `schema.ts`, el editor te advertirá de inmediato en cualquier consulta donde el tipo no coincida, evitando errores en producción.
2. **Server Actions vs APIs REST Tradicionales:**  
   En Next.js 16 no necesitas crear endpoints `fetch('/api/...')` manuales. Con `"use server"`, las funciones se ejecutan exclusivamente en el servidor con conexión directa a la base de datos, manteniendo tus credenciales seguras.
3. **¿Por qué Neon PostgreSQL?**  
   Neon es una base de datos PostgreSQL Serverless moderna que separa el cómputo del almacenamiento, permitiendo ramificar ramas de datos (branching) para desarrollo y producción de forma instantánea.
4. **Diseño Defensivo de APIs (DTO Pattern):**  
   Observa cómo cada Server Action retorna objetos limpios implementando la interfaz genérica `IGeneralResponse<T>`, estandarizando las respuestas de éxito (`success: true`) y error (`success: false, message: "..."`) para que el frontend nunca colapse.

---

## 👨‍💻 Sobre el Desarrollador

* **Nombre:** Juan Esteban Benjumea Correa  
* **Identidad Developer:** `{ JEBC-DeV }`  
* **Programa Académico:** Técnico en Programación de Software — SENA  
* **Ficha de Formación:** `3534665`  
* **GitHub:** [@esteban5tael](https://github.com/esteban5tael)  
* **Aplicación en Vivo:** [https://e-bike-app.vercel.app/](https://e-bike-app.vercel.app/)

---
*Hecho con dedicación, pasión por el código limpio y excelencia técnica para el Servicio Nacional de Aprendizaje (SENA).*
