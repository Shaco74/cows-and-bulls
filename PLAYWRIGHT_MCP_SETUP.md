# 🎭 Playwright MCP Setup für Claude Code

> **Ziel**: Claude Code kann deine Webseite über strukturierte Accessibility-Daten sehen und interagieren

## 📋 Was ist Playwright MCP?

**Playwright MCP (Model Context Protocol)** ermöglicht es Claude Code:
- 🎯 **Accessibility Tree Navigation** - Strukturierte Daten statt Screenshots
- 🔍 **DOM-Elemente inspizieren** - Über semantische Inhalte
- 🤖 **Browser-Automatisierung** - Clicks, Navigation, Formulare
- ⚡ **Schnell & Lightweight** - Keine Vision-Models nötig
- 🎪 **Deterministische Interaktionen** - Präzise Element-Targeting

## ✨ Key Features

- **🚀 Fast & Lightweight**: Nutzt Playwright's Accessibility Tree, nicht Pixel-basiert
- **🧠 LLM-friendly**: Keine Vision Models nötig, arbeitet mit strukturierten Daten  
- **🎯 Deterministic**: Vermeidet Mehrdeutigkeiten von Screenshot-basierten Ansätzen
- **📱 Cross-Platform**: Chrome, Firefox, Safari, Mobile Devices

---

## 🚀 Setup-Anleitung (Offizielle Version)

### 1. Claude Code MCP Installation (Empfohlen)

```bash
# Mit Claude Code CLI - Einfachste Methode
claude mcp add playwright npx @playwright/mcp@latest
```

### 2. Manuelle Konfiguration

Falls CLI nicht verfügbar, erstelle Config manuell:

```bash
# Claude Code Config Directory
mkdir -p ~/.config/claude-code
```

Erstelle/bearbeite `~/.config/claude-code/mcp_servers.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### 3. Erweiterte Konfiguration (Optional)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--viewport-size", "1280,720",
        "--headless",
        "--save-trace",
        "--output-dir", "./playwright-outputs"
      ]
    }
  }
}
```

### 4. Alternative: Lokale Konfiguration

Falls globale Installation nicht funktioniert, erstelle lokale Config:

```bash
# Im Projekt-Directory
cat > mcp-playwright.json << 'EOF'
{
  "name": "playwright",
  "version": "1.0.0",
  "command": "./node_modules/.bin/playwright-mcp-server",
  "args": [],
  "env": {
    "PLAYWRIGHT_BROWSERS_PATH": "./playwright-browsers"
  }
}
EOF
```

---

## 🛠 Playwright für dein Projekt konfigurieren

### 1. Playwright Config erstellen

```bash
# Playwright Konfiguration generieren
npx playwright install
```

Erstelle `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. E2E Test Directory erstellen

```bash
mkdir -p e2e
```

Beispiel E2E Test `e2e/game-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('Bulls & Cows - Complete Game Flow', async ({ page }) => {
  // Zur Landing Page navigieren
  await page.goto('/');
  
  // Screenshot der Landing Page
  await page.screenshot({ path: 'screenshots/landing-page.png' });
  
  // Spielername eingeben
  await page.fill('input[placeholder="Dein Name"]', 'TestPlayer');
  
  // Lobby erstellen
  await page.click('button:has-text("Lobby erstellen")');
  
  // Warten auf Lobby-Seite
  await expect(page).toHaveURL(/\/lobby\/[A-Z0-9]{6}/);
  
  // Screenshot der Lobby
  await page.screenshot({ path: 'screenshots/lobby-page.png' });
  
  // Ready setzen
  await page.click('button:has-text("Bereit")');
  
  // Prüfen dass Button-Status geändert hat
  await expect(page.locator('button:has-text("Nicht mehr bereit")')).toBeVisible();
});

test('Game Logic - Number Validation', async ({ page }) => {
  await page.goto('/');
  
  // Mock einer Spielsituation
  await page.evaluate(() => {
    // Simuliere Socket.IO Events für Testing
    window.mockGameState = {
      status: 'setup',
      players: [{ id: 'test', name: 'TestPlayer' }]
    };
  });
  
  // Navigation zu Game Page (mocked)
  await page.goto('/game/TEST123');
  
  // Teste ungültige Zahlen-Eingabe
  await page.fill('input[placeholder*="geheime"]', '1123'); // Doppelte Ziffer
  await page.click('button:has-text("Zahl festlegen")');
  
  // Erwarte Fehler-Alert
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('gültige');
    await dialog.accept();
  });
});
```

### 3. Package.json Scripts erweitern

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug",
    "e2e:report": "playwright show-report"
  }
}
```

---

## 🎯 Verfügbare Konfigurationsoptionen

### Alle verfügbaren Parameter:

```bash
npx @playwright/mcp@latest --help

Options:
--allowed-origins <origins>  # Erlaubte Origins (semicolon-separated)
--blocked-origins <origins>  # Blockierte Origins (semicolon-separated)  
--block-service-workers      # Service Workers blockieren
--browser <browser>          # Browser wählen: chrome, firefox, webkit, msedge
--caps <caps>               # Zusätzliche Capabilities: vision, pdf
--cdp-endpoint <endpoint>    # CDP Endpoint für Remote Browser
--config <path>             # Pfad zur Konfigurationsdatei
--device <device>           # Device Emulation: "iPhone 15", "Pixel 5"
--executable-path <path>     # Pfad zur Browser-Executable
--headless                  # Headless Mode (default: headed)
--host <host>               # Server Host (default: localhost)
--ignore-https-errors       # HTTPS Errors ignorieren
--isolated                  # Browser Profile im Memory halten
--image-responses <mode>     # Image Responses: "allow" oder "omit"
--no-sandbox               # Sandbox deaktivieren
--output-dir <path>         # Output Directory für Files/Traces
--port <port>               # Port für SSE Transport
--proxy-bypass <bypass>     # Proxy Bypass Domains
--proxy-server <proxy>      # Proxy Server URL
--save-trace               # Playwright Trace speichern
--storage-state <path>      # Storage State File für Sessions
--user-agent <ua>          # Custom User Agent
--user-data-dir <path>     # User Data Directory
--viewport-size <size>     # Viewport Size: "1280,720"
```

### Beispiel-Konfigurationen:

#### 🎮 Für dein Bulls & Cows Testing:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--viewport-size", "1280,720",
        "--save-trace",
        "--output-dir", "./playwright-outputs",
        "--user-agent", "PlaywrightMCP-BullsCows"
      ]
    }
  }
}
```

#### 📱 Mobile Testing Setup:
```json
{
  "mcpServers": {
    "playwright-mobile": {
      "command": "npx", 
      "args": [
        "@playwright/mcp@latest",
        "--device", "iPhone 15",
        "--save-trace"
      ]
    }
  }
}
```

#### 🔒 Sicherheit & Performance:
```json
{
  "mcpServers": {
    "playwright-secure": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--no-sandbox", 
        "--block-service-workers",
        "--isolated",
        "--allowed-origins", "https://cowsandbulls-my1a1xo58-shaco74s-projects.vercel.app;http://localhost:3000"
      ]
    }
  }
}
```

## 🎯 Claude Code MCP Tools

### Was Claude dann nutzen kann:

- **🌐 `playwright_navigate`** - Zu URLs navigieren
- **👁️ `playwright_screenshot`** - Screenshots und Visual Snapshots
- **🖱️ `playwright_click`** - Elemente anklicken
- **⌨️ `playwright_fill`** - Formulare ausfüllen  
- **⏳ `playwright_wait`** - Auf Elemente/Conditions warten
- **🔍 `playwright_get_text`** - Text aus Elementen extrahieren
- **📊 `playwright_evaluate`** - JavaScript im Browser ausführen
- **🌳 `playwright_get_accessibility_tree`** - Accessibility Tree abrufen
- **📱 `playwright_set_viewport`** - Viewport/Device ändern

---

## 🧪 Testing Workflows

### 1. Visual Regression Testing

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('Visual Regression - Landing Page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('landing-page.png');
});

test('Visual Regression - Game Interface', async ({ page }) => {
  // Mock game state
  await page.goto('/game/MOCK123');
  await expect(page).toHaveScreenshot('game-interface.png');
});
```

### 2. Cross-Browser Testing

```bash
# Alle Browser testen
npm run e2e

# Nur Chromium
npx playwright test --project=chromium

# Mobile Testing
npx playwright test --project="Mobile Chrome"
```

### 3. Debug Mode

```bash
# Interactive Debugging
npm run e2e:debug

# Mit UI
npm run e2e:ui
```

---

## 📁 Projektstruktur nach Setup

```
cows-and-bulls/
├── e2e/                         # Playwright E2E Tests
│   ├── game-flow.spec.ts        # Hauptspiel-Flow Tests
│   ├── visual-regression.spec.ts # Visual Tests
│   └── mobile-responsive.spec.ts # Mobile Tests
├── screenshots/                 # Test Screenshots
├── test-results/               # Playwright Test Results
├── playwright-report/          # HTML Reports
├── playwright.config.ts        # Playwright Config
└── mcp-playwright.json        # MCP Konfiguration
```

---

## 🔧 Troubleshooting

### Häufige Issues:

#### 1. MCP Server nicht gefunden
```bash
# Prüfe Installation
which npx
npx @playwright/mcp@latest --help

# Claude Code MCP neu hinzufügen
claude mcp add playwright npx @playwright/mcp@latest

# Manuelle Installation falls nötig
npm install -g @playwright/mcp
```

#### 2. Browser nicht installiert
```bash
# Alle Browser installieren
npx playwright install

# Permissions für Browser
sudo npx playwright install-deps
```

#### 3. Claude Code erkennt MCP nicht
```bash
# Config-Datei prüfen
cat ~/.config/claude-code/mcp_servers.json

# Claude Code neu starten
```

#### 4. Port-Konflikte
```bash
# Ändere Port in playwright.config.ts
webServer: {
  port: 3001,  // Statt 3000
}
```

---

## 🎮 Live-Testing deiner App

### Sofort testbar:

```typescript
// Claude kann jetzt:
test('Live App Testing', async ({ page }) => {
  // Zu deiner Live-App navigieren
  await page.goto('https://cowsandbulls-my1a1xo58-shaco74s-projects.vercel.app');
  
  // Screenshot der aktuellen Version
  await page.screenshot({ path: 'live-app-current.png' });
  
  // Lobby erstellen testen
  await page.fill('input[placeholder="Dein Name"]', 'PlaywrightTest');
  await page.click('button:has-text("Lobby erstellen")');
  
  // Lobby-Code extrahieren
  const lobbyCode = await page.locator('[data-testid="lobby-code"]').textContent();
  console.log('Created lobby:', lobbyCode);
  
  // Zweiten Browser-Tab simulieren
  const secondPage = await context.newPage();
  await secondPage.goto('https://cowsandbulls-my1a1xo58-shaco74s-projects.vercel.app');
  await secondPage.fill('input[placeholder="Dein Name"]', 'Player2');
  await secondPage.fill('input[placeholder*="Lobby-Code"]', lobbyCode);
  await secondPage.click('button:has-text("Lobby beitreten")');
  
  // Multiplayer-Testing!
});
```

---

## 🚀 Nächste Schritte

### Nach dem Setup:

1. **Tests ausführen**: `npm run e2e`
2. **Claude Code neu starten** damit MCP erkannt wird
3. **Erste Interaktion**: Lass Claude einen Screenshot deiner App machen
4. **Automated Testing**: Lass Claude E2E Tests für deine Game-Flows schreiben

### Claude kann dann:
- 📸 Visual Regression Tests erstellen
- 🧪 Automatisierte User-Flows testen
- 🐛 UI-Bugs visuell identifizieren
- 📱 Mobile Responsiveness prüfen
- ⚡ Performance-Issues erkennen

---

## 💡 Pro-Tips

### Performance Optimization:
```bash
# Nur Chromium für schnellere Tests
export PLAYWRIGHT_BROWSERS_PATH=~/.cache/ms-playwright
npx playwright install chromium
```

### CI/CD Integration:
```yaml
# .github/workflows/e2e.yml
- name: Run Playwright tests
  run: npx playwright test
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### Debug Screenshots:
```typescript
// Automatische Screenshots bei jedem Step
test.beforeEach(async ({ page }) => {
  await page.screenshot({ path: `debug-${Date.now()}.png` });
});
```

---

## 👤 User Profile Management

### Persistent vs. Isolated Sessions

#### Persistent Profile (Standard)
```bash
# Profile-Speicherorte:
# Windows: %USERPROFILE%\AppData\Local\ms-playwright\mcp-{channel}-profile
# macOS:   ~/Library/Caches/ms-playwright/mcp-{channel}-profile  
# Linux:   ~/.cache/ms-playwright/mcp-{channel}-profile

# Eigenes Profile-Directory setzen:
"args": ["@playwright/mcp@latest", "--user-data-dir", "./custom-profile"]
```

#### Isolated Sessions (für Testing)
```bash
# Im Memory, keine Persistierung
"args": ["@playwright/mcp@latest", "--isolated"]
```

---

## 🎯 Schnellstart für dein Bulls & Cows Projekt

### 1. Einfachste Konfiguration:
```bash
claude mcp add playwright npx @playwright/mcp@latest
```

### 2. Claude Code neu starten

### 3. Erste Interaktion testen:
```bash
# Claude kann dann deine Live-App öffnen:
# https://cowsandbulls-my1a1xo58-shaco74s-projects.vercel.app
```

### 4. Was Claude jetzt kann:
- 🎮 **Dein Spiel testen** - Vollständige Game-Flows durchspielen
- 📱 **Mobile Testing** - Responsive Design prüfen
- 🐛 **Bug Detection** - UI-Issues visuell identifizieren
- 🎯 **Accessibility** - Strukturierte Daten statt Screenshots
- ⚡ **Performance** - Schnelle Interaktionen ohne Vision Models

---

## 🎉 Ready to go!

**🎭 Playwright MCP ist jetzt einsatzbereit!**

Claude kann deine Bulls & Cows App über strukturierte Accessibility-Daten "sehen" und komplexe Browser-Automatisierung durchführen. Perfect für UI-Testing, Bug-Hunting und Visual Debugging! 

**Live Demo**: https://cowsandbulls-my1a1xo58-shaco74s-projects.vercel.app 🚀