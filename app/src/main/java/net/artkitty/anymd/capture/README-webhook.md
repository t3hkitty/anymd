# 📡 AnyMD Android Webhook Server: Playbook (v5.0.0)

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 Anymd Android Client Engine                 │
  └──────────────┬───────────────────────────────┬──────────────┘
                 │ (Starts native Ktor daemon)   │
                 ▼                               ▼
     ┌───────────────────────┐       ┌───────────────────────┐
     │ SomaticWebhookServer  │       │  LocalStorage Settings│
     │      (Port 3050)      │       │ (anymd_webhook_active)│
     └───────────┬───────────┘       └───────────────────────┘
                 │ (Accepts Ingress over local Wi-Fi)
                 ▼
     ┌───────────────────────┐
     │  Local Vault SAF Uri  │
     │   (inbox.md / .md)    │
     └───────────────────────┘
```

## 🌸 Overview
This playbook maps out the deployment and configuration of the **Somatic Webhook Server mode** inside the native AnyMD Android Client. By running a headless, local-only Ktor server on port `3050` directly inside the Android application context, AnyMD enables direct, zero-latency webhook ingress from your surrounding local network devices (PC browser extensions, Tasker routines, or terminal curl scripts) without relying on commercial cloud connectors or slow remote VPS transfers.

---

## 🏛️ Configuration & Setup Steps

### 🛠️ Step 1: Open Settings and Agree to the TOS
1. Inside the AnyMD Android App, tap the settings icon (⚙️) on your left navigation menu.
2. Under the **"Real-Time Web Access"** section, locate the **Localhost Webhook settings** panel.
3. The panel starts in a locked state to prevent accidental network exposure. Read the **Security and Ingress Warning** and click **I Agree, Unlock Webhook Server**. This stores `anymd_webhook_tos_unlocked: true` inside your persistent DataStore.

### 🛠️ Step 2: Configure Incoming Parameters
1. **Incoming Server Port**: Pick your preferred port (defaults to `3050`).
2. **Target Vault Folder**: Define the local folder within your vault where entries should land (defaults to `/inbox`).
3. **Append Mode Settings**:
   * To prevent high-frequency sync metrics (such as heart rate logs, geofences, or clipboard histories) from cluttering your filesystem with 500 individual files a day, type a file name in **Specific File** (e.g., `Fitness-Log.md`).
   * The server will automatically use `appendText()` to stack incoming webhook data as neat newlines at the bottom of that single file.
   * Customize your **Pre-pend** (e.g. `**Sip Water**`) or **App-pend** (e.g. `#metabolic_tracker`) tags to automatically wrap text logs inside Markdown tags.

### 🛠️ Step 3: Run the Server and Copy the Target URL
1. Click **START SERVER**.
2. AnyMD will automatically query your Wi-Fi interface and display your current local network address (e.g. `🟢 Running on http://192.168.1.105:3050`).
3. Click the **Copy** button next to your **Generated Webhook Target URL** to copy the formatted string (with the embedded prepend and append query parameters).

---

## 🚨 Security, Rate Limiting & Failsafes

Because this server binds to your local network interface to write directly to your phone's file storage, it includes robust, Discord-style security limits:
* **The 5-Minute suspension**: The server monitors request frequencies in memory. If a client IP spams your endpoint with more than **30 requests per minute**, the server instantly returns a `429 Too Many Requests` error and completely suspends all access from that IP for exactly **5 minutes** to prevent botting loops.
* **KawaiiNeko Isolation**: Webhook data is stored 100% locally on your phone. No telemetry passes through AnyMD servers or public cloud APIs.
