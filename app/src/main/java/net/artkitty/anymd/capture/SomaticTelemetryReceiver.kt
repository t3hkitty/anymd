package net.artkitty.anymd.capture

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import org.json.JSONObject

/**
 * Zettelkasten ID: 20260826-1830
 * Project: anymd (Android Client)
 * Role: 100% Native RCS Notification Parser & Bi-Directional Tasker/MacroDroid Intent Bridge [cite: 17, 29, 326]
 * 
 * Strict Invariant Compliance:
 * - 0% cloud requirements. Operates entirely locally offline [cite: 3, 167].
 * - Standardizes incoming streams from external system automation utilities [cite: 17].
 * - Automatically classifies and serializes text patterns into the local-first Markdown vault [cite: 326].
 */

// Intent Constants for Tasker / MacroDroid Interop [cite: 17]
const val ACTION_INBOUND_TELEMETRY = "org.anymd.broadcast.INBOUND_TELEMETRY"
const val ACTION_UNIFIED_FIREHOSE = "org.anymd.broadcast.UNIFIED_FIREHOSE"
const val ACTION_TELEMETRY_CAPTURED = "org.anymd.broadcast.TELEMETRY_CAPTURED"

class SomaticTelemetryReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_INBOUND_TELEMETRY) {
            val bundle = intent.extras ?: Bundle.EMPTY
            val source = bundle.getString("source", "Tasker/MacroDroid") ?: "External"
            val title = bundle.getString("title", "External automation event") ?: "External Pulse"
            val content = bundle.getString("content", "") ?: ""
            val tagsString = bundle.getString("tags", "#telemetry #automation") ?: ""

            if (content.isNotEmpty()) {
                Log.d("AnyMD_Bridge", "Ingested intent from $source: $content")
                appendExternalTelemetryToVault(context, title, content, source, tagsString)
                
                // Fire outbound acknowledgement intent for Tasker/MacroDroid [cite: 17]
                val ackIntent = Intent(ACTION_TELEMETRY_CAPTURED).apply {
                    putExtra("status", "SUCCESS")
                    putExtra("timestamp", System.currentTimeMillis())
                    putExtra("zettel_id", SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault()).format(Date()))
                }
                context.sendBroadcast(ackIntent)
            }
        }
    }

    private fun appendExternalTelemetryToVault(context: Context, title: String, content: String, source: String, tags: String) {
        try {
            val externalDir = context.getExternalFilesDir(null)
            val file = File(externalDir, "device-vault/telemetry.md") // Directed directly to device-vault/ [cite: 39]
            if (!file.parentFile.exists()) file.parentFile.mkdirs()

            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val zettelId = SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault()).format(Date())

            // Format tags into valid YAML string array [cite: 20]
            val parsedTags = tags.split(" ").filter { it.startsWith("#") }.map { it.replace("#", "") }
            val yamlTagsBlock = StringBuilder()
            if (parsedTags.isNotEmpty()) {
                yamlTagsBlock.append("\n  tags:\n")
                parsedTags.forEach { tag -> yamlTagsBlock.append("    - \"$tag\"\n") }
            }

            val markdownPayload = """
                
                ---
                zettel_id: "$zettelId"
                title: "Log via $source"
                date: "$timestamp"
                broadcast_name: "$ACTION_INBOUND_TELEMETRY"$yamlTagsBlock
                device_model: "${android.os.Build.MODEL}"
                ---
                
                ### 📡 $title
                **Source:** $source
                **Timestamp:** $timestamp
                
                $content
                
                ---
            """.trimIndent()

            file.appendText(markdownPayload)
        } catch (e: Exception) {
            Log.e("AnyMD_Bridge", "Failed to append telemetry to vault", e)
        }
    }
}

/**
 * Extended Notification Ingestion Service supporting Google Messages RCS capture [cite: 29, 326].
 */
class RcsNotificationIngestService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        
        // Filter specifically for Google Messages (The primary carrier of Android RCS) [cite: 29, 326]
        if (packageName == "com.google.android.apps.messaging") {
            val extras = sbn.notification.extras
            val title = extras.getString("android.title") ?: "Unknown Sender"
            val text = extras.getCharSequence("android.text")?.toString() ?: ""
            
            if (text.isNotEmpty()) {
                Log.d("AnyMD_RcsParser", "Intercepted RCS notification from $title: $text")
                
                // Formulate standardized JSON payload for downstream firehose [cite: 18]
                val rcsPayload = JSONObject().apply {
                    put("type", "notification")
                    put("channel_id", "RCS")
                    put("package_name", packageName)
                    put("sender", title)
                    put("message", text)
                    put("timestamp", System.currentTimeMillis())
                }

                // Append directly to the local AnyMD flat-file database [cite: 29, 326]
                appendNotificationToVault(title, text)

                // Dispatch raw intent across local UNIFIED_FIREHOSE for Tasker/MacroDroid hooks [cite: 17, 18]
                val firehoseIntent = Intent(ACTION_UNIFIED_FIREHOSE).apply {
                    putExtra("payload", rcsPayload.toString())
                    `package` = "net.artkitty.anymd" // Explicit package targeting for security [cite: 17]
                }
                sendBroadcast(firehoseIntent)
            }
        }
    }

    private fun appendNotificationToVault(sender: String, message: String) {
        try {
            val externalDir = getExternalFilesDir(null)
            val file = File(externalDir, "device-vault/rcs-thread.md")
            if (!file.parentFile.exists()) file.parentFile.mkdirs()

            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val zettelId = SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault()).format(Date())

            val markdownPayload = """
                
                ---
                zettel_id: "$zettelId"
                title: "RCS from $sender"
                date: "$timestamp"
                type: "notification"
                channel_id: "RCS"
                package_name: "com.google.android.apps.messaging"
                ---
                
                ### 💬 Intercepted RCS Thread
                **Sender:** $sender
                **Time:** $timestamp
                
                > $message
                
                ---
            """.trimIndent()

            file.appendText(markdownPayload)
        } catch (e: Exception) {
            Log.e("AnyMD_RcsParser", "Failed to write notification to vault", e)
        }
    }
}
