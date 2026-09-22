# 🏠 Homelab Infrastructure Dashboard

A fast, modern, and interactive **Homelab Homepage & Service Launcher** designed to be easily deployed on your home server or VM using Docker.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and served by a hardened **Nginx** container.

![Dashboard Preview](https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/docker.svg)

---

## ✨ Features

- **⚡ Spotlight Command Palette (`⌘K` or `/`)**: Instant modal search with fuzzy matching, arrow navigation (`↑`/`↓`), and keyboard launch (`Enter`).
- **🎛️ Dual View Modes (`G` hotkey)**:
  - **Launcher / Grid View**: Sleek app tiles with ambient brand color glow and smooth hover physics.
  - **List / Ops View**: Dense, table-like rows displaying service URLs, category tags, a one-click copy URL button, and direct visit link.
- **📌 Pinned Quick Bar**: Top horizontal strip for starred **Favorites** and **Recently Visited** services.
- **🏷️ Interactive Category Pills**: Filter tabs (`All`, `★ Favorites`, `Infrastructure`, `Monitoring`, `Media`, etc.) with real-time counters.
- **📂 Collapsible Category Sections**: Click any section header to fold or expand.
- **🌗 Theme Switcher (`T` hotkey)**: Seamless Dark, Light, and System Auto theme switching with persistent storage.
- **⌨️ Keyboard Shortcuts (`?`)**: Full hotkey cheat sheet modal for rapid navigation.
- **🔄 Zero-Rebuild Configuration**: Change URLs, add services, or reorder categories by simply editing `config/services.json` on the host — no container rebuild needed!
- **🛠️ Built-in Service Manager CLI (`npm run services`)**: Interactive terminal menu to add, edit, remove, sort, and star services.
- **🔒 Hardened Security**: Multi-stage lightweight Alpine build (~21 MB image) with Content Security Policy (CSP), anti-clickjacking headers, and a dedicated `/health` check endpoint.

---

## 🚀 Deployment on a Docker VM / Server

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git homelab-dashboard
cd homelab-dashboard
```

### 2. Configure your services (Optional)

You can customize `config/services.json` before starting, or keep the defaults and edit them later:

```bash
# If config/services.json is not present, copy from template:
cp config/services.example.json config/services.json
```

### 3. Start the container

```bash
docker compose up -d
```

The dashboard will be live at **`http://<your-server-ip>:8080`**.

### 4. Verify container health

```bash
curl http://localhost:8080/health
# Output: OK
```

To view logs:
```bash
docker compose logs -f
```

---

## ⚙️ Configuration (`config/services.json`)

The dashboard dynamically fetches its configuration from `/config/services.json` mounted into Nginx at runtime.

### Example Configuration

```json
{
  "settings": {
    "title": "Homelab",
    "subtitle": "Infrastructure Operations Hub"
  },
  "services": [
    {
      "id": "proxmox",
      "name": "Proxmox",
      "description": "Virtualization & container management",
      "url": "https://proxmox.local",
      "icon": "proxmox",
      "category": "Infrastructure",
      "color": "#E57000",
      "favorite": true
    },
    {
      "id": "grafana",
      "name": "Grafana",
      "description": "Metrics dashboards & observability",
      "url": "https://grafana.local",
      "icon": "grafana",
      "category": "Monitoring",
      "color": "#F46800",
      "favorite": true
    }
  ]
}
```

### Service Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | **Yes** | Unique identifier (e.g. `proxmox`, `jellyfin`) |
| `name` | `string` | **Yes** | Display name |
| `description` | `string` | **Yes** | Short summary or purpose of the service |
| `url` | `string` | **Yes** | Destination URL (local IP, domain, or subdomain) |
| `icon` | `string` | **Yes** | Brand slug from [Simple Icons](https://simpleicons.org) (e.g. `proxmox`, `docker`, `github`) |
| `category` | `string` | **Yes** | Category name (e.g. `Infrastructure`, `Media`, `Monitoring`) |
| `color` | `string` | No | Hex accent color (e.g. `#E57000`) for ambient glow |
| `favorite` | `boolean` | No | If `true`, pinned to favorites by default |

> **Tip:** Any valid brand slug from [Simple Icons](https://simpleicons.org) works automatically. If an icon is unavailable, a letter fallback is shown.

---

## 🛠️ CLI Service Manager

If you prefer managing services from the terminal without editing JSON manually:

```bash
npm run services
# or
node scripts/manage-services.js
```

Features:
- Add a new service with interactive prompts
- Edit existing services
- Remove services safely
- Toggle favorite stars (`★`)
- Sort services alphabetically or by category
- Update dashboard title and subtitle

---

## 🌐 Reverse Proxy Examples

### Caddy
```caddyfile
dashboard.homelab.local {
    reverse_proxy localhost:8080
}
```

### Nginx Proxy Manager / Nginx
```nginx
server {
    listen 80;
    server_name dashboard.homelab.local;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Cloudflare Tunnel
Set the service in your Zero Trust dashboard:
- Type: `HTTP`
- URL: `localhost:8080`

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev

# 3. Production build
npm run build

# 4. Preview production build
npm run preview
```

---

## 📄 License

MIT License. Open source and customizable for your homelab setup.
