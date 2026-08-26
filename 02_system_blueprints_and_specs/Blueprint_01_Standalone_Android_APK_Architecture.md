# 🐾 Blueprint 01: Standalone Native Android APK Architecture (`MyBlackBox`)
## High-Density Kawaii Brutalism • Zero-Telemetry Hardware Streamer • Shizuku Guardian

```text
       /\_/\  
      ( o.o )  [ Shizuku Guardian Active ]
       > ^ <   [ Telemetry Stream: LIVE   ]
   +-----------+--------------------------+
   | [APK v1.0]| device-vault/ -> hydrated|
   +-----------+--------------------------+
```

---

## 1. Executive Overview & System Topology

**Blueprint 01** formalizes the architectural specification for the standalone native Android client (`net.artkitty.myblackbox` / `Anymd Companion Android`). The client functions as a resilient, local-first ambient operating monitor and decentralized markdown logger.

The architecture directly bridges low-level Android OS APIs (BLE battery, clipboard, notifications, system power events) and elevated ADB-level capabilities via the **Shizuku IPC Framework** with the local file-based vault system (`device-vault/`) and optional automated orchestration engines (**n8n**).

```mermaid
graph TD
    subgraph Android OS Kernel & System Services
        BAT[Bluetooth / Power Subsystem]
        CLIP[System Clipboard Manager]
        NOTIF[NotificationListenerService]
        SHZ[Shizuku Privileged Binder / ADB]
    end

    subgraph Native APK Core (net.artkitty.myblackbox)
        SG[ShizukuGuardian]
        BBW[BluetoothBatteryWatcher]
        CW[ClipboardWatcher]
        NIS[NotificationIngestService]
        DVW[DeviceVaultWriter]
        CH[ConfigHydrator]
        OF[OnboardingFlow]
    end

    subgraph Storage & External Integration
        VAULT[(Local /device-vault/)]
        N8N[Self-Hosted n8n Instance]
        ZIP[(Backup / Joint Bundle .zip)]
    end

    BAT --> BBW
    CLIP --> CW
    NOTIF --> NIS
    SHZ <--> SG

    BBW --> DVW
    CW --> DVW
    NIS --> DVW
    SG -. Keep-Alive / OOM Immunity .-> Native APK Core

    DVW --> VAULT
    OF --> CH
    CH --> N8N
    CH --> ZIP
    VAULT <==> N8N
```

---

## 2. Privileged Keep-Alive & Shizuku Guardian Protection

Modern Android OEM memory managers (MIUI, OneUI, ColorOS) aggressively terminate long-running background collection services. The `ShizukuGuardian` subsystem leverages binder IPC to Shizuku's privileged root/ADB daemon to grant non-standard permissions and enforce OOM (Out-Of-Memory) immunity.

```text
  +-------------------------------------------------------------+
  |  Shizuku Daemon (ADB Shell / UID 2000 / Root UID 0)        |
  +-------------------------------------------------------------+
               |  riki / shizuku binder IPC
               v
  +-------------------------------------------------------------+
  |  net.artkitty.myblackbox.guardian.ShizukuGuardian           |
  |  * dumpsys deviceidle whitelist +net.artkitty.myblackbox    |
  |  * appops set net.artkitty.myblackbox RUN_IN_BACKGROUND allow|
  |  * cmd appops set net.artkitty.myblackbox PROJECT_MEDIA allow|
  |  * pm grant net.artkitty.myblackbox WRITE_SECURE_SETTINGS   |
  +-------------------------------------------------------------+
```

### 2.1 Privileged Command Execution Sequence

Upon application launch or boot completion (`BOOT_COMPLETED`), `ShizukuGuardian` executes the following privileged policy script:

```kotlin
package net.artkitty.myblackbox.guardian

import android.content.Context
import rikka.shizuku.Shizuku
import rikka.shizuku.ShizukuRemoteProcess

class ShizukuGuardian(private val context: Context) {

    fun isShizukuAvailable(): Boolean {
        return try {
            Shizuku.pingBinder() && Shizuku.checkSelfPermission() == android.content.pm.PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }

    fun applyHardenedKeepAlive(): Boolean {
        if (!isShizukuAvailable()) return false

        val commands = listOf(
            "dumpsys deviceidle whitelist +net.artkitty.myblackbox",
            "cmd appops set net.artkitty.myblackbox RUN_IN_BACKGROUND allow",
            "cmd appops set net.artkitty.myblackbox RUN_ANY_IN_BACKGROUND allow",
            "pm grant net.artkitty.myblackbox android.permission.WRITE_SECURE_SETTINGS",
            "pm grant net.artkitty.myblackbox android.permission.DUMP"
        )

        return try {
            commands.forEach { cmd ->
                val process = Shizuku.newProcess(arrayOf("sh", "-c", cmd), null, null)
                process.waitFor()
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}
```

### 2.2 Process Priority & Foreground Matrix

| Tier | Android Classification | Target Value / Flag | Guardian Enforcement |
| :--- | :--- | :--- | :--- |
| **OOM Adj** | Foreground Process | `oom_score_adj: -800` | Shizuku Binder Shell Hook |
| **Power Bucket** | Excluded from Doze | `deviceidle whitelist` | Whitelisted |
| **WakeLock** | Partial Wakelock | `PARTIAL_WAKE_LOCK` | Foreground Service Anchor |
| **Binder Heartbeat** | Ping cycle | 60s tick | DeathRecipient Auto-Restart |

---

## 3. Hardware & OS Telemetry Ingestion (`device-vault/`)

The client operates an append-only, privacy-preserving markdown vault stored directly on internal/external device storage: `Android/data/net.artkitty.myblackbox/files/device-vault/`.

```text
device-vault/
├── daily/
│   ├── 2026-08-24.md
│   └── 2026-08-25.md
├── telemetry/
│   ├── bluetooth_battery.jsonl
│   └── power_thermal.jsonl
├── clipboard/
│   └── clips_2026-W34.md
└── notifications/
    └── stream.md
```

### 3.1 `DeviceVaultWriter` Atomic Appender

```kotlin
package net.artkitty.myblackbox.listeners

import android.content.Context
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DeviceVaultWriter(private val context: Context) {
    
    @Synchronized
    fun writeDailyNote(entry: String, tag: String = "NOTE"): File? {
        return try {
            val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            val timeStr = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())
            val vaultDir = File(context.getExternalFilesDir(null), "device-vault/daily")
            if (!vaultDir.exists()) vaultDir.mkdirs()

            val file = File(vaultDir, "$dateStr.md")
            val isNew = !file.exists()

            FileWriter(file, true).use { writer ->
                if (isNew) {
                    writer.write("---\ntype: device-daily\ndate: $dateStr\nsystem: Android-MyBlackBox\n---\n\n# 📱 Daily Device Vault: $dateStr\n\n")
                }
                writer.write("[$timeStr] **[$tag]** $entry\n")
            }
            file
        } catch (e: Exception) {
            null
        }
    }
}
```

### 3.2 Telemetry Listeners Specification

1. **Bluetooth Battery Watcher (`BluetoothBatteryWatcher.kt`)**:
   - Intercepts `android.bluetooth.device.action.BATTERY_LEVEL_CHANGED`.
   - Tracks connected peripherals (ANC headphones, smartwatches, keyboards, stylus pens).
   - Formats to daily notes: `- 🔋 [BLE:Sony WH-1000XM5] Battery: 80% (Voltage: Normal)`.

2. **Clipboard Watcher (`ClipboardWatcher.kt`)**:
   - Registers `ClipboardManager.OnPrimaryClipChangedListener`.
   - Sanitizes passwords and ephemeral credentials (detects Bitwarden / KeePass flags).
   - Records textual snippets, URLs, and coordinates directly to markdown sidecars.

3. **Notification Ingest Service (`NotificationIngestService.kt`)**:
   - Subclasses `NotificationListenerService`.
   - Granular package filtering to prevent logging sensitive financial/2FA channels.
   - Extracts title, subtext, notification channel, and timestamp for timeline reconstruction.

---

## 4. Joint n8n Configuration & Vault Hydration

The client supports bidirectional hydration with an upstream **n8n** automation workflow or web companion instance.

```text
  +--------------------+         Webhook POST           +----------------------+
  | MyBlackBox Android | =============================> |  n8n Sync Pipeline   |
  |  (Local Vault)     | <============================= | (Transform/Zettel)   |
  +--------------------+      HTTP GET / ZIP Bundle     +----------------------+
```

### 4.1 Configuration Payload Schema

```json
{
  "version": "1.0.0",
  "client_id": "blackbox_pixel8_01",
  "n8n_endpoint": "https://n8n.artkitty.net/webhook/vault-sync",
  "auth_token": "bearer_secret_meow_key",
  "sync_interval_seconds": 300,
  "features": {
    "shizuku_guardian": true,
    "bluetooth_watcher": true,
    "clipboard_watcher": true,
    "notification_ingest": true,
    "ui_guard_pin": "4242"
  },
  "vault_mapping": {
    "local_root": "device-vault",
    "remote_collection": "mobile_telemetry"
  }
}
```

### 4.2 Hydration Engine (`ConfigHydrator.kt`)

```kotlin
package net.artkitty.myblackbox.onboarding

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream

class ConfigHydrator(private val context: Context) {

    fun hydrateFromJson(jsonConfig: String): Boolean {
        return try {
            val obj = JSONObject(jsonConfig)
            val sharedPrefs = context.getSharedPreferences("anymd_prefs", Context.MODE_PRIVATE)
            val editor = sharedPrefs.edit()

            if (obj.has("n8n_endpoint")) editor.putString("n8n_endpoint", obj.getString("n8n_endpoint"))
            if (obj.has("auth_token")) editor.putString("auth_token", obj.getString("auth_token"))
            if (obj.has("ui_guard_pin")) editor.putString("ui_guard_pin", obj.getString("ui_guard_pin"))
            if (obj.has("sync_interval_seconds")) editor.putInt("sync_interval_seconds", obj.getInt("sync_interval_seconds"))
            
            editor.putBoolean("is_hydrated", true)
            editor.apply()
            true
        } catch (e: Exception) {
            false
        }
    }

    fun hydrateFromZip(zipFile: File): Boolean {
        if (!zipFile.exists() || !zipFile.name.endsWith(".zip")) return false
        val targetDir = File(context.getExternalFilesDir(null), "device-vault")
        if (!targetDir.exists()) targetDir.mkdirs()

        return try {
            ZipInputStream(zipFile.inputStream()).use { zis ->
                var entry = zis.nextEntry
                while (entry != null) {
                    val newFile = File(targetDir, entry.name)
                    if (entry.isDirectory) {
                        newFile.mkdirs()
                    } else {
                        File(newFile.parent ?: targetDir.path).mkdirs()
                        FileOutputStream(newFile).use { fos -> zis.copyTo(fos) }
                    }
                    zis.closeEntry()
                    entry = zis.nextEntry
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }
}
```

---

## 5. The 3-Path Onboarding Flow

To eliminate friction and cognitive overload (AuDHD design principles), the onboarding architecture offers exactly three distinct entry vectors:

```text
                         [ App Initial Launch ]
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
   [ PATH 1 ]                [ PATH 2 ]                [ PATH 3 ]
  Joint Bundle             n8n Orchestrated          Zero-Cloud Local
   (.zip File)             (Endpoint / QR)             (Air-Gapped)
         |                         |                         |
         v                         v                         v
Unpack .anymd configs     Validate webhook URL      Init local device-vault
Restore existing notes    Stream initial payload    100% On-device sandbox
Mount media sidecars      Activate Shizuku sync     Local markdown reader
```

### 5.1 Path Comparison Matrix

| Step / Feature | Path 1: Joint Bundle Restore | Path 2: n8n Orchestration | Path 3: Zero-Cloud Local |
| :--- | :--- | :--- | :--- |
| **Input Mechanism** | File Picker (`.zip` / `.tar.gz`) | QR Scanner or Webhook URL | Single Tap ("Start Sandbox") |
| **Network Access** | Zero (100% Offline) | Outbound HTTPS to self-host | Strictly Zero Network |
| **Vault State** | Pre-populated from backup | Hydrated via Webhook JSON | Empty structured scaffold |
| **Shizuku Protection**| Optional (Auto-detected) | Mandatory for real-time | Optional for local logs |
| **Target User** | Migrating / Existing Vault user | Power user / Homelabber | New user / Air-gapped security |

---

## 6. Build, Deployment & Verification Matrix

### 6.1 Gradle Build Configuration

The Android module builds as a standard standalone APK or Capacitor container:

```bash
# 1. Sync web assets
npm run build && npx cap sync android

# 2. Compile Debug / Release APK
cd android
./gradlew assembleDebug
```

### 6.2 Diagnostic & Verification Checklist

```bash
# Verify Shizuku binder connection
adb shell dumpsys activity service rikka.shizuku.server.ShizukuService

# Verify MyBlackBox battery whitelist status
adb shell dumpsys deviceidle whitelist | grep net.artkitty.myblackbox

# Inspect device-vault daily log stream
adb shell cat /sdcard/Android/data/net.artkitty.myblackbox/files/device-vault/daily/$(date +%Y-%m-%d).md
```

---

```text
  /\_/\  
 ( =.= )  Blueprint 01 Verified & Standardized.
  (   )   Ready for compilation & production distribution.
```
