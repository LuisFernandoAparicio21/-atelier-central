# Especificación de Diseño: Módulo de Registro y Dashboard de Flujos de Efectivo

## 1. Objetivo y Contexto
Desarrollar una interfaz de usuario extremadamente visual, amigable y rápida para que la dueña de una florería pueda registrar diariamente el flujo de dinero del negocio. El módulo debe ocultar la complejidad de la Ingeniería Económica y clasificar los movimientos (Operativos, de Inversión y de Financiación) en segundo plano para calcular el Flujo Neto de Efectivo (FNE) de manera automática.

## 2. Experiencia de Usuario (UI/UX)
La pantalla será un **Dashboard** dividido en tres secciones principales que trabajan en conjunto para evitar que el usuario tenga que cambiar de pantallas.

### 2.1 Widget de Resumen (Parte Superior)
* **Propósito:** Mostrar la salud financiera actual.
* **Contenido:** El **Flujo Neto de Efectivo (FNE)**.
* **Comportamiento:** Se recalcula automáticamente según el filtro de fechas seleccionado en la parte inferior. Si las entradas son mayores a las salidas, se mostrará en un verde positivo; de lo contrario, en un rojo de advertencia.

### 2.2 Botones de Acción Rápida (Parte Media)
* **Propósito:** Ser el punto de entrada para cualquier registro financiero.
* **Contenido:** 4 Tarjetas estilo botón grandes y coloridas:
  1. 🟢 **Entró Dinero** (Ventas diarias, operativa local).
  2. 🔴 **Salió Dinero** (Costos de flor, nómina, gastos operativos).
  3. 🔵 **Equipos y Mobiliario** (Compra/venta de activos fijos, vitrinas).
  4. 🟡 **Préstamos / Aportes** (Créditos del banco, aportaciones propias).
* **Interacción Principal:** Al presionar cualquiera de los 4 botones, la pantalla no recarga, sino que despliega inmediatamente un **Panel Lateral (Drawer)**.

### 2.3 Panel Lateral de Inyección de Datos (El Formulario)
* **Flujo de uso:** El usuario ingresa la información del movimiento seleccionado en la sección de Acción Rápida.
* **Componentes de entrada obligatorios:**
  * **Selector de Chips (Subcategorías):** En lugar de listas desplegables cerradas, son botones de selección rápida (Ej. si eligió "Salió Dinero", los chips son: *Flor/Suministros*, *Servicios*, *Sueldos*).
  * **Campo de Monto:** Entrada numérica grande, estilo calculadora, centrada.
* **Componentes de entrada opcionales:**
  * **Nota:** Campo de texto libre para detalles adicionales (ej. "Rosas rojas proveedor local").
* **Mapeo Técnico en Backend:**
  * Las subcategorías enviarán a la base de datos el "Tipo de Actividad de Fujo de Efectivo" exacto que dicte la ingeniería económica (Actividad Operativa, de Inversión o de Financiación) derivado del botón principal que abrió el panel.

### 2.4 Historial y Filtros (Parte Inferior)
* **Propósito:** Permitir auditoría visual rápida y exploración del FNE.
* **Controles de Tiempo (Filtros):** Una botonera superior compuesta por pastillas como `[Hoy]`, `[Esta Semana]`, `[Este Mes]`, `[Fechas exactas (Calendario)]`. Modificar estos filtros actualiza la lista inferior Y el Widget de FNE.
* **Lista de "Últimos Movimientos":**
  * Diseño limpio estilo aplicación bancaria.
  * Muestra el ícono del movimiento, la fecha corta, el chip seleccionado y el total monetario de manera rápida.

---
*Nota de la revisión: Este documento cumple con el alcance de la fase de Brainstorming y no contiene inconsistencias en la arquitectura dictada para el Módulo Analítico del Dashboard Principal.*
