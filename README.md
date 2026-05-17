<div align="center">

# 🔥 Vitaris Launcher

**Launcher personalizado para la comunidad de Minecraft Modded Vitaris**

[![Release](https://img.shields.io/github/v/release/Dev-Senju-M/VitarisII-Launcher?style=flat-square&color=c0392b)](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest)
[![Build](https://img.shields.io/github/actions/workflow/status/Dev-Senju-M/VitarisII-Launcher/build.yml?style=flat-square)](https://github.com/Dev-Senju-M/VitarisII-Launcher/actions)
[![License](https://img.shields.io/badge/license-MIT-gold?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest)

</div>

---

## ¿Qué es Vitaris Launcher?

Vitaris Launcher es el cliente oficial de la comunidad **Vitaris**, una comunidad privada de Minecraft Modded. Basado en [HeliosLauncher](https://github.com/dscalzi/HeliosLauncher), el launcher gestiona automáticamente la instalación de Java, Forge y todos los mods necesarios para jugar en los servidores de Vitaris sin configuración manual.

### Características

- **Autenticación dual** — Inicia sesión con cuenta **Microsoft (premium)** o en modo **sin premium (offline)**
- **Gestión automática de mods** — Descarga y valida todos los mods al lanzar
- **Java automático** — Detecta e instala Java 21 (Temurin) si no está disponible
- **Selector de servidor** — Cambia entre los servidores disponibles desde el launcher
- **Panel de administración** — Gestión de whitelist integrada para administradores
- **Discord Rich Presence** — Muestra tu actividad en Discord mientras juegas
- **Actualizaciones automáticas** — El launcher se actualiza solo al haber una nueva versión

---

## Descarga

| Plataforma | Descarga |
|---|---|
| **Windows** (x64) | [Vitaris-Launcher-setup-1.0.0.exe](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest/download/Vitaris-Launcher-setup-1.0.0.exe) |
| **macOS** (Intel) | [Vitaris-Launcher-setup-1.0.0-x64.dmg](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest/download/Vitaris-Launcher-setup-1.0.0-x64.dmg) |
| **macOS** (Apple Silicon) | [Vitaris-Launcher-setup-1.0.0-arm64.dmg](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest/download/Vitaris-Launcher-setup-1.0.0-arm64.dmg) |
| **Linux** | [Vitaris-Launcher-setup-1.0.0.AppImage](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases/latest/download/Vitaris-Launcher-setup-1.0.0.AppImage) |

> Todas las versiones disponibles en [Releases](https://github.com/Dev-Senju-M/VitarisII-Launcher/releases).

---

## Requisitos

| Requisito | Mínimo |
|---|---|
| **Sistema operativo** | Windows 10 / macOS 11 / Ubuntu 20.04 |
| **RAM** | 4 GB (8 GB recomendado) |
| **Almacenamiento** | 4 GB libres |
| **Java** | Se instala automáticamente (Java 21 Temurin) |
| **Internet** | Requerido para autenticación y descarga de mods |

---

## Instalación

### Windows
1. Descarga el archivo `.exe`
2. Ejecútalo y sigue el asistente de instalación
3. Abre **Vitaris Launcher** desde el escritorio o el menú de inicio

### macOS
1. Descarga el archivo `.dmg` correspondiente a tu arquitectura
2. Ábrelo y arrastra la aplicación a la carpeta **Aplicaciones**
3. En caso de advertencia de seguridad: **Preferencias del Sistema → Seguridad → Abrir de todas formas**

### Linux
1. Descarga el archivo `.AppImage`
2. Dale permisos de ejecución:
   ```bash
   chmod +x Vitaris-Launcher-setup-1.0.0.AppImage
   ```
3. Ejecútalo:
   ```bash
   ./Vitaris-Launcher-setup-1.0.0.AppImage
   ```

---

## Cómo usar

1. **Inicia sesión** con tu cuenta de Microsoft o selecciona modo sin premium
2. **Selecciona el servidor** al que quieres conectarte en la parte superior
3. Haz clic en **JUGAR** — el launcher descargará automáticamente todo lo necesario
4. Una vez completado, Minecraft se abrirá con todos los mods instalados

> La primera vez puede tardar varios minutos dependiendo de tu conexión a internet.

---

## Servidores

| Servidor | Versión | Modloader |
|---|---|---|
| Vitaris Server | Minecraft 1.20.1 | Forge 47.4.0 |
| Vitaris Server Optimizado | Minecraft 1.20.1 | Forge 47.4.0 |

**IP del servidor:** `40.233.28.64`

---

## Para administradores

El launcher incluye un **panel de administración** integrado visible únicamente para usuarios en la lista de administradores. Desde él puedes:

- Ver y gestionar la whitelist del servidor
- Añadir o eliminar usuarios (Microsoft y sin premium)
- Sincronizar cambios directamente con GitHub

---

## Desarrollo local

### Requisitos previos
- [Node.js](https://nodejs.org/) 20 o superior
- [Git](https://git-scm.com/)

### Configuración

```bash
git clone https://github.com/Dev-Senju-M/VitarisII-Launcher.git
cd VitarisII-Launcher
npm install
npm start
```

### Compilar distribución

```bash
npm run dist
```

Los ejecutables se generan en la carpeta `dist/`.

---

## Tecnologías

- [Electron](https://www.electronjs.org/) 33
- [helios-core](https://github.com/dscalzi/helios-core) — Motor de lanzamiento de Minecraft
- [electron-builder](https://www.electron.build/) — Empaquetado multiplataforma
- JavaScript / EJS / CSS

---

## Créditos

- **Senju** — Desarrollo y mantenimiento del launcher
- [HeliosLauncher](https://github.com/dscalzi/HeliosLauncher) — Base del proyecto (MIT License)
- Comunidad **Vitaris** — Por hacer posible este proyecto

---

<div align="center">

**© 2026 Senju — Comunidad Vitaris**

</div>
