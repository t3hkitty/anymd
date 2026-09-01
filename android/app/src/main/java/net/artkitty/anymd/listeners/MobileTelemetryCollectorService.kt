package net.artkitty.anymd.listeners

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import java.io.File
import java.io.FileWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import org.json.JSONObject

/**
 * Mobile Telemetry Collector - Lightweight background telemetry service
 * Gathers battery state, network link speed, step cadence, and active audio route.
 * Serializes into vault/telemetry/YYYYMMDD-telemetry.md and broadcasts to local port 3050.
 */
class MobileTelemetryCollectorService : Service(), SensorEventListener {

    private lateinit var handler: Handler
    private lateinit var sensorManager: SensorManager
    private var stepSensor: Sensor? = null
    private var totalStepsSinceBoot: Int = 0

    private val telemetryRunnable = object : Runnable {
        override fun run() {
            collectAndDispatchTelemetry()
            handler.postDelayed(this, 60000) // Collect every 60 seconds
        }
    }

    override fun onCreate() {
        super.onCreate()
        handler = Handler(Looper.getMainLooper())
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        stepSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
        handler.post(telemetryRunnable)
        Log.i("AnyMD_Telemetry", "Mobile Telemetry Collector Service started successfully.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(telemetryRunnable)
        sensorManager.unregisterListener(this)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_STEP_COUNTER) {
            totalStepsSinceBoot = event.values[0].toInt()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun collectAndDispatchTelemetry() {
        val batteryPct = getBatteryPercentage()
        val isCharging = isBatteryCharging()
        val linkSpeedMbps = getNetworkLinkSpeedMbps()
        val audioRoute = getActiveAudioRoute()
        val timestampIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(Date())
        val dateFileName = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date()) + "-telemetry.md"

        val telemetryJson = JSONObject().apply {
            put("timestamp", timestampIso)
            put("battery_percent", batteryPct)
            put("is_charging", isCharging)
            put("link_speed_mbps", linkSpeedMbps)
            put("step_cadence_count", totalStepsSinceBoot)
            put("active_audio_route", audioRoute)
        }

        // 1. Serialize into vault/telemetry/YYYYMMDD-telemetry.md
        writeToVaultTelemetry(dateFileName, timestampIso, batteryPct, isCharging, linkSpeedMbps, totalStepsSinceBoot, audioRoute)

        // 2. Broadcast via local port 3050 (background thread)
        Thread {
            try {
                val url = URL("http://127.0.0.1:3050/webhook/Telemetry")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 2000
                conn.readTimeout = 2000
                conn.outputStream.use { os ->
                    os.write(telemetryJson.toString().toByteArray())
                }
                val code = conn.responseCode
                Log.d("AnyMD_Telemetry", "Broadcast port 3050 response: $code")
            } catch (e: Exception) {
                Log.d("AnyMD_Telemetry", "Local port 3050 offline, cached to local vault: ${e.message}")
            }
        }.start()
    }

    private fun getBatteryPercentage(): Int {
        val batteryIntent = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        return if (level >= 0 && scale > 0) (level * 100 / scale.toFloat()).toInt() else -1
    }

    private fun isBatteryCharging(): Boolean {
        val batteryIntent = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val status = batteryIntent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        return status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
    }

    private fun getNetworkLinkSpeedMbps(): Int {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork
        val caps = cm.getNetworkCapabilities(network)
        if (caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            return wifiManager.connectionInfo.linkSpeed
        }
        return caps?.linkDownstreamBandwidthKbps?.div(1000) ?: 0
    }

    private fun getActiveAudioRoute(): String {
        val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        for (device in devices) {
            when (device.type) {
                AudioDeviceInfo.TYPE_BLUETOOTH_A2DP, AudioDeviceInfo.TYPE_BLUETOOTH_SCO -> return "Bluetooth (${device.productName})"
                AudioDeviceInfo.TYPE_WIRED_HEADSET, AudioDeviceInfo.TYPE_WIRED_HEADPHONES -> return "Wired Headphones"
                AudioDeviceInfo.TYPE_BUILTIN_SPEAKER -> return "Built-in Speaker"
            }
        }
        return "Internal"
    }

    private fun writeToVaultTelemetry(
        fileName: String,
        timestamp: String,
        battery: Int,
        charging: Boolean,
        linkSpeed: Int,
        steps: Int,
        audioRoute: String
    ) {
        try {
            val vaultDir = File(getExternalFilesDir(null), "vault/telemetry")
            if (!vaultDir.exists()) vaultDir.mkdirs()

            val targetFile = File(vaultDir, fileName)
            val fileExists = targetFile.exists()

            val writer = FileWriter(targetFile, true)
            if (!fileExists) {
                writer.write("---\ntitle: Daily Mobile Telemetry Log\ntags: [telemetry, zettelkasten, mobile]\nstatus: ready\n---\n# Telemetry Log - $fileName\n\n| Timestamp | Battery | Charging | Network Link Speed | Step Count | Audio Route |\n| --- | --- | --- | --- | --- | --- |\n")
            }
            writer.write("| $timestamp | $battery% | $charging | ${linkSpeed}Mbps | $steps | $audioRoute |\n")
            writer.close()
        } catch (e: Exception) {
            Log.e("AnyMD_Telemetry", "Failed writing to vault/telemetry log", e)
        }
    }
}
