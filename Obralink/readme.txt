
# ObraLink: Arquitectura y Lógica de la Aplicación

Este documento describe la estructura del proyecto y el flujo de datos de la aplicación ObraLink.

## 1. Arquitectura General

La aplicación está construida sobre **Next.js** utilizando el **App Router**. Esto permite una organización de ficheros basada en rutas y una clara separación entre componentes de servidor y de cliente.

-   **Stack Tecnológico**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui (para componentes), Zod (para validación de esquemas).
-   **Simulación de Backend**: No hay una base de datos real. La aplicación funciona con datos de demostración locales para simular un backend completo.

## 2. Estructura de Ficheros Clave

### A. Capa de Datos (`src/lib/`)

Esta carpeta simula el backend de la aplicación.

-   **`src/lib/data/*.json`**:
    -   **Función**: Son la "base de datos" física. Almacenan los datos iniciales de la demo (proyectos, usuarios, etc.).
    -   **Importante**: Estos ficheros solo se leen al iniciar el servidor. Los cambios realizados durante la sesión no se guardan permanentemente en ellos.

-   **`src/lib/mockData.ts`**:
    -   **Función**: Carga los datos de los ficheros `.json` a variables en memoria (`mockProyectos`, `mockTrabajadores`, etc.). Estas variables actúan como la base de datos en tiempo de ejecución.

-   **`src/lib/types.ts`**:
    -   **Función**: Define la "forma" (esquema) de todos los modelos de datos de la aplicación utilizando Zod. Esto asegura que todos los datos que fluyen por la app sean consistentes y tengan el formato esperado.

-   **`src/lib/actions/app.actions.ts`**:
    -   **Función**: Es el **único punto de acceso** a los datos para la interfaz de usuario. Centraliza toda la lógica para leer y modificar los datos (CRUD: Crear, Leer, Actualizar, Borrar). Son "Server Actions" de Next.js.
    -   **Flujo**: Cuando una página necesita datos, llama a una función de este fichero (p. ej., `getProyectosByConstructora()`). Esta función interactúa con los arrays en memoria de `mockData.ts` y devuelve el resultado.

### B. Capa de Interfaz de Usuario (`src/app/` y `src/components/`)

-   **`src/app/(app)/`**:
    -   **Función**: Contiene las páginas principales de la aplicación, organizadas por rol (`constructora`, `subcontrata`, `encargado`, `trabajador`).
    -   **Flujo**: El enrutamiento se basa en esta estructura de carpetas.

-   **`src/app/(app)/dashboard/page.tsx`**:
    -   **Función**: Actúa como un simulador de roles. Es la página de entrada donde el usuario elige qué rol quiere probar.
    -   **Flujo**: Al seleccionar un rol, se guarda en el `localStorage` del navegador y se redirige al panel correspondiente.

-   **`src/components/`**:
    -   `ui/`: Componentes básicos de la interfaz (botones, tarjetas, etc.) proporcionados por `shadcn/ui`.
    -   `layout/`: Componentes estructurales como la cabecera (`AppHeader`) y el menú lateral (`AppSidebar`).
    -   `dashboards/`: Componentes más complejos y reutilizables, como los diálogos para añadir proyectos o personal (`AddProyectoDialog`).

## 3. Flujo de Datos y Lógica de Navegación

1.  **Inicio y Selección de Rol**: El usuario llega a `/dashboard` y selecciona un rol (p. ej., "Constructora"). Esta elección se guarda en `localStorage`.

2.  **Navegación y Vistas**: La aplicación redirige a la página principal de ese rol (p. ej., `/constructora/dashboard`). El componente `AppSidebarNav` lee el rol del `localStorage` y muestra únicamente los enlaces de menú permitidos para ese rol.

3.  **Carga de Datos en una Página**:
    -   El usuario navega a una página (p. ej., "Gestión de Proyectos").
    -   El componente de la página (`page.tsx`), que es un Componente de Cliente (`'use client'`), utiliza un hook `useEffect` para ejecutarse en el navegador.
    -   Dentro del `useEffect`, se llama a la función de acción correspondiente de `app.actions.ts` (p. ej., `getProyectosByConstructora(constructoraId)`).
    -   La acción del servidor se ejecuta, filtra los datos del array en memoria (`mockProyectos`) y los devuelve a la página.
    -   La página recibe los datos y los almacena en su estado (`useState`), lo que provoca que la interfaz se actualice y muestre la información.

4.  **Modificación de Datos**:
    -   El usuario realiza una acción (p. ej., hace clic en "Añadir Proyecto").
    -   Se abre un diálogo (`AddProyectoDialog`).
    -   Al enviar el formulario del diálogo, se llama a la acción correspondiente (`addProyecto(datosDelProyecto)`).
    -   La acción modifica el array en memoria (`mockProyectos.unshift(nuevoProyecto)`).
    -   La acción devuelve el nuevo proyecto creado.
    -   La página que llamó a la acción actualiza su estado con el nuevo dato, y la UI se refresca para mostrar el nuevo proyecto sin necesidad de recargar la página.

Este modelo asegura que la lógica de datos esté centralizada y desacoplada de la interfaz, haciendo el código más limpio, predecible y fácil de mantener.
