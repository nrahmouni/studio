# ObraLink: Análisis Detallado de la Aplicación

## 1. Resumen General de la Aplicación

*   **Nombre de la App:** ObraLink
*   **Propósito Principal:** Una aplicación web diseñada para empresas de construcción y reformas con el objetivo de digitalizar y optimizar sus operaciones diarias. Se centra en la gestión de proyectos (obras), trabajadores y partes de trabajo diarios, incorporando funcionalidades de Inteligencia Artificial para la optimización de recursos.
*   **Pila Tecnológica:**
    ```
    - Framework: Next.js (con App Router)
    - Lenguaje: TypeScript
    - UI: React, Componentes de ShadCN UI, Tailwind CSS
    - Backend y Base de Datos: Firebase (Cloud Firestore para la base de datos, Firebase Authentication para la gestión de usuarios).
    - Inteligencia Artificial: Google Genkit
    ```

## 2. Roles de Usuario y Autenticación

La aplicación soporta tres roles de usuario distintos, cada uno con permisos y paneles de control diferentes:

*   **`admin` (Administrador):** Tiene acceso completo a todas las funcionalidades. Puede gestionar el perfil de la empresa, crear, editar y eliminar todos los datos (obras, usuarios, partes), y utilizar las herramientas de informes y de IA. El usuario inicial creado durante el registro de la empresa es un administrador.
*   **`jefeObra` (Jefe de Obra / Encargado):** Tiene capacidades de gestión, pero puede estar restringido a proyectos específicos (`obrasAsignadas`). Puede crear/ver obras, gestionar usuarios, validar partes de trabajo, y usar herramientas de gestión como el "Control Diario" y la asignación de recursos con IA.
*   **`trabajador` (Trabajador):** Tiene el acceso más limitado. Puede ver sus proyectos asignados, crear sus propios partes de trabajo diarios y usar la función de fichaje (`fichajes`).

La autenticación se gestiona a través de páginas de inicio de sesión separadas para "Empresa/Jefe de Obra" y "Trabajador", con una página central de selección de rol (`/auth/select-role`).

## 3. Funcionalidades Principales

*   **Gestión de la Empresa (`/company-profile`):**
    *   **Registro Simplificado:** Se puede crear una nueva empresa solo con el nombre de la empresa, un email de administrador y una contraseña.
    *   **Edición del Perfil:** Los administradores pueden completar posteriormente detalles opcionales como el CIF, información de contacto, teléfono y la URL de un logo.
    *   **Registro de Trabajadores:** Los administradores/jefes de obra pueden registrar nuevos trabajadores para la empresa directamente desde esta página. La contraseña inicial del trabajador se establece como su DNI/NIE.

*   **Gestión de Obras (Proyectos) (`/obras`):**
    *   Funcionalidad CRUD (Crear, Leer, Actualizar, Eliminar) completa para los proyectos.
    *   Las obras contienen detalles como nombre, dirección, cliente, fechas de inicio/fin y una descripción opcional.
    *   Los administradores pueden asignar un `jefeObra` y múltiples `trabajadores` a cada proyecto.
    *   Incluye un sistema para registrar y gestionar los costes por categoría (`costosPorCategoria`).

*   **Gestión de Partes de Trabajo (`/partes`):**
    *   Los trabajadores pueden crear nuevos partes de trabajo, detallando las tareas realizadas, horas trabajadas y cualquier incidencia.
    *   Los administradores/jefes de obra pueden ver una lista de todos los partes, filtrarlos por proyecto y validarlos.
    *   Los partes pueden incluir fotos adjuntas y firmas digitales (aunque actualmente se implementan mediante campos de URL).

*   **Control Diario de Obra (`/control-diario`):**
    *   Una herramienta especializada para administradores y jefes de obra.
    *   Para un proyecto y fecha seleccionados, muestra una lista de todos los trabajadores asignados.
    *   El gestor puede marcar la asistencia, introducir las horas de inicio y fin, y reportar las horas totales.
    *   Guardar este formulario puede crear o actualizar automáticamente un `Parte` para el trabajador, agilizando la entrada de datos.

*   **Fichaje Horario (`/fichajes`):**
    *   **Vista de Trabajador:** Una interfaz simple para que los trabajadores fichen su entrada (`entrada`), inicien/finalicen un descanso (`inicioDescanso`/`finDescanso`), y fichen su salida (`salida`) para un proyecto seleccionado.
    *   **Vista de Gestor:** Los administradores/jefes de obra ven una tabla de todos los eventos de fichaje. Pueden filtrar por obra, trabajador y rango de fechas, y también pueden validar estos eventos.

*   **Asignación de Recursos con IA (`/resource-allocation`):**
    *   Esta página utiliza un flujo de Genkit (`analyzeResourceAllocationFlow`).
    *   Recopila todos los `partes de trabajo` pendientes (no validados) de Firestore.
    *   Envía estos datos a un modelo de Gemini, que analiza la carga de trabajo y proporciona una sugerencia en español sobre cómo reasignar recursos para prevenir cuellos de botella, junto con su razonamiento.

*   **Informes (`/reports`):**
    *   Una página de informes sencilla que muestra un gráfico de barras visualizando el número de partes de trabajo creados para cada obra.

*   **Poblado de Datos de Demostración (`seed.actions.ts`):**
    *   Una herramienta interna (activada desde un botón en el dashboard para administradores) para poblar la base de datos de Firestore con un conjunto completo de datos de demostración, incluyendo una empresa, usuarios, una obra, un parte, etc. Esto es crucial para el desarrollo y la demostración.

## 4. Arquitectura Técnica y Flujo de Datos

*   **Lógica del Servidor (`src/lib/actions/`):** Toda la lógica de backend y la comunicación con Firebase se manejan a través de Server Actions de Next.js. Cada modelo de datos tiene su propio archivo de acciones (ej. `user.actions.ts`, `obra.actions.ts`). Estas acciones son responsables de todas las operaciones CRUD, la validación de datos y la revalidación de las rutas de caché de Next.js (`revalidatePath`).

*   **Modelos de Datos (`src/lib/types.ts`):** Se utilizan esquemas Zod como única fuente de verdad para todas las estructuras de datos (`Empresa`, `Obra`, `UsuarioFirebase`, etc.). Esto garantiza la seguridad de tipos y proporciona reglas de validación tanto para los formularios del frontend como para las acciones del backend. Los campos que no son obligatorios en el registro inicial (como `CIF`, `dni`) se definen como `.optional().nullable()`.

*   **Integración con Firebase (`src/lib/firebase/firebase.ts`):** Un único archivo inicializa y exporta las instancias de la App de Firebase, Auth, Firestore y Storage, utilizando una configuración codificada.

*   **Estilos (`src/app/globals.css`):** El tema de la aplicación se define mediante variables CSS para los modos claro y oscuro, siguiendo el sistema de diseño especificado (Azul Profundo como primario, Naranja Vibrante como acento, Gris Claro como fondo). Las fuentes (`Poppins`, `PT Sans`) también se configuran aquí.