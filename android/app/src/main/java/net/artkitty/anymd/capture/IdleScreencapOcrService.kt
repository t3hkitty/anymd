package net.artkitty.anymd.capture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

/**
 * Zettelkasten ID: 20260826-1900
 * Project: anymd (Android Native Client)
 * Role: Idle-State Screen Capture (MediaProjection) and Local ML-Kit OCR Text Harvester
 * 
 * 🐾 Somatic Sovereignty Watcher: 🐾
 * Runs purely on-device during system idle states. Intercepts screen buffers, 
 * runs local ML Kit OCR, extracts high-value keywords (like webnovel names, 
 * code snippets, or task logs), and appends them to your local Markdown vault.
 */
class IdleScreencapOcrService : Service() {

    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private val handler = Handler(Looper.getMainLooper())
    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
    
    private val idleCheckIntervalMs = 60000L // Run every 1 minute if system is idle
    private var isSystemIdle = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(FOREGROUND_ID, createForegroundNotification())
        scheduleIdleCheck()
    }

    private fun scheduleIdleCheck() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                if (isDeviceIdle()) {
                    captureScreenAndOcr()
                }
                handler.postDelayed(this, idleCheckIntervalMs)
            }
        }, idleCheckIntervalMs)
    }

    private fun isDeviceIdle(): Boolean {
        val powerManager = getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            !powerManager.isInteractive // True if screen is off or in ambient low-power state
        } else {
            @Suppress("DEPRECATION")
            !powerManager.isScreenOn
        }
    }

    private fun captureScreenAndOcr() {
        val image = imageReader?.acquireLatestImage() ?: return
        val planes = image.planes
        val buffer = planes[0].buffer
        val pixelStride = planes[0].pixelStride
        val rowStride = planes[0].rowStride
        val rowPadding = rowStride - pixelStride * image.width

        // Convert raw buffer back to Android Bitmap
        val bitmap = Bitmap.createBitmap(
            image.width + rowPadding / pixelStride,
            image.height,
            Bitmap.Config.ARGB_8888
        )
        bitmap.copyPixelsFromBuffer(buffer)
        image.close()

        // Pass to Google's Local On-Device ML Kit Engine (0% Outbound network queries)
        val inputImage = InputImage.fromBitmap(bitmap, 0)
        recognizer.process(inputImage)
            .addOnSuccessListener { visionText ->
                val text = visionText.text.trim()
                if (text.isNotEmpty()) {
                    harvestImplicitText(text)
                }
            }
            .addOnFailureListener { e ->
                e.printStackTrace()
            }
    }

    private fun harvestImplicitText(ocrRawText: String) {
        try {
            val externalDir = getExternalFilesDir(null)
            val file = File(externalDir, "device-vault/implicit-harvests.md")
            if (!file.parentFile.exists()) file.parentFile.mkdirs()

            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val zettelId = SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault()).format(Date())

            // Basic heuristic routing: Skip boilerplate terms, capture unique books, code, or search topics
            if (ocrRawText.contains("Chapter", ignoreCase = true) || ocrRawText.contains("class ", ignoreCase = true)) {
                val mdBlock = """
                    
                    ---
                    zettel_id: "$zettelId"
                    title: "Implicit OCR Capture - $timestamp"
                    date: "$timestamp"
                    tags:
                      - "implicit_harvest"
                      - "somatic"
                      - "ocr_capture"
                    ---
                    
                    ### 👁️ Idle Screen OCR harvest ($timestamp)
                    
                    ```text
                    $ocrRawText
                    ```
                    
                    ---
                """.trimIndent()
                file.appendText(mdBlock)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "AnyMD Background Idle Harvester",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("AnyMD Idle Worker Active")
            .setContentText("Watching system parameters and logging local-only screenshot metadata")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val CHANNEL_ID = "anymd_ocr_service_channel"
        private const val FOREGROUND_ID = 4050
    }
}
