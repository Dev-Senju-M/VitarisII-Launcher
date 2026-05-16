# Configuración de vitaris-distro

Este documento explica cómo configurar los repositorios de soporte para VitarisLauncher.

## Repositorios necesarios en GitHub

Crear los siguientes repos en la organización/cuenta de Vitaris:

| Repo | Visibilidad | Propósito |
|---|---|---|
| `vitaris-launcher` | Privado | Código fuente del launcher |
| `vitaris-distro` | Privado | distro.json + whitelist.json |
| `vitaris-modpack` | Privado | Mods, configs, resourcepacks |

## vitaris-distro — Archivos requeridos

### whitelist.json

```json
[
  {
    "username": "TuUsername",
    "uuid": "",
    "type": "microsoft",
    "addedAt": "2026-05-15"
  }
]
```

### distro.json

```json
{
  "version": "1.0.0",
  "rss": "",
  "discord": {
    "clientId": "TU_DISCORD_APP_ID",
    "smallImageText": "Vitaris",
    "smallImageKey": "vitaris_logo"
  },
  "admins": ["TuUsername"],
  "servers": [
    {
      "id": "vitaris.smp",
      "name": "Vitaris SMP",
      "description": "El servidor principal de Vitaris",
      "icon": "https://raw.githubusercontent.com/Vitaris/vitaris-distro/main/icon.png",
      "version": "1.0.0",
      "address": "TU_IP:PUERTO",
      "minecraftVersion": "1.20.1",
      "discord": {
        "shortId": "VitarisSMP",
        "largeImageText": "Vitaris SMP",
        "largeImageKey": "vitaris_logo"
      },
      "mainServer": true,
      "autoconnect": false,
      "modules": []
    }
  ]
}
```

## Apuntar el launcher al distro

En `app/assets/js/distromanager.js`, buscar la URL del distro y reemplazar con:

```
https://raw.githubusercontent.com/Vitaris/vitaris-distro/main/distro.json
```

## GitHub Personal Access Token (para el Panel Admin)

1. Ir a github.com → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
2. Crear token con acceso **solo** al repo `vitaris-distro`
3. Permisos: `Contents: Read and write`
4. El admin ingresa el token la primera vez que abre el Panel Admin en el launcher

## Auto-updater del launcher

GitHub Releases publica los binarios. `electron-updater` detecta actualizaciones automáticamente.
Para publicar: `npm run dist:win` genera el instalador. Subir a Releases del repo `vitaris-launcher`.
