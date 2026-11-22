package net.artkitty.anymd.capture

import android.content.Context
import android.net.wifi.WifiManager
import android.text.format.Formatter
import io.ktor.http.*
import io.ktor.serialization.gson.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentHashMap

/**
 * 20260826-1730_anymd_android_webhook_server.kt
 *
 * 🐾 [AnyMD Somatic Android Webhook Server] 🐾
 *
 * Implements a lightweight, local-only Ktor server running natively inside the Android APK.
 * When "Localhost Server Web Access" is enabled, this server listens on port 3050 (or custom configured port).
 * It enables other devices on the same local network (such as browsers, smart watch scripts, or curl)
 * to push text data directly into the mobile vault over Wi-Fi without any internet or cloud dependencies.
 *
 * Features:
 * 1. POST /webhook/:vaultName and POST /webhook/:vaultName/:folder routes.
 * 2. In-Memory IP Rate Limiting & 5-minute failsafe lock against spam/botting (max 30 req/min).
 * 3. Appends payloads as clean Markdown files or single-file newlines (Append Mode).
 */
object SomaticWebhookServer {
    private var server: NettyApplicationEngine? = null
    var isRunning = false
        private set

    // In-Memory rate limiting map (IP -> Request Timestamps)
    private val rateLimitMap = ConcurrentHashMap<String, MutableList<Long>>()
    private val suspendedIPs = ConcurrentHashMap<String, Long>() // IP -> Resume Timestamp

    fun start(context: Context, port: Int = 3050, onStatusChanged: (String) -> Unit) {
        if (isRunning) return

        try {
            server = embeddedServer(Netty, port = port, host = "0.0.0.0") {
                install(ContentNegotiation) {
                    gson {
                        setPrettyPrinting()
                    }
                }
                routing {
                    get("/") {
                        call.respondText("🐾 AnyMD Android Webhook Server is running perfectly! POST to /webhook/:vaultName instead.", ContentType.Text.Plain)
                    }

                    post("/webhook/{vaultName}") {
                        handlePost(call, context, null)
                    }

                    post("/webhook/{vaultName}/{folder}") {
                        val folder = call.parameters["folder"]
                        handlePost(call, context, folder)
                    }
                }
            }.start(wait = false)

            isRunning = true
            val ipAddress = getWifiIPAddress(context)
            onStatusChanged("🟢 Running on http://$ipAddress:$port")
        } catch (e: Exception) {
            e.printStackTrace()
            onStatusChanged("🔴 Failed to start: ${e.localizedMessage}")
        }
    }

    fun stop(onStatusChanged: (String) -> Unit) {
        if (!isRunning) return
        server?.stop(1000, 2000)
        server = null
        isRunning = false
        onStatusChanged("⚪ Stopped")
    }

    private suspend fun handlePost(call: ApplicationCall, context: Context, folder: String?) {
        val clientIP = call.request.local.remoteHost
        val vaultName = call.parameters["vaultName"] ?: "sandbox_vault"

        // 1. Check if IP is suspended
        val now = System.currentTimeMillis()
        val resumeTime = suspendedIPs[clientIP]
        if (resumeTime != null) {
            if (now < resumeTime) {
                call.respond(HttpStatusCode.TooManyRequests, mapOf("error" to "IP suspended due to rate limits. Try again in 5 minutes."))
                return
            } else {
                suspendedIPs.remove(clientIP)
            }
        }

        // 2. Rate Limiting Check: Max 30 requests per minute
        val requests = rateLimitMap.getOrPut(clientIP) { Collections.synchronizedList(mutableListOf()) }
        synchronized(requests) {
            requests.removeIf { now - it > 60000 }
            if (requests.size >= 30) {
                suspendedIPs[clientIP] = now + 300000 // 5-minute suspension
                rateLimitMap.remove(clientIP)
                return@synchronized
            }
            requests.add(now)
        }

        if (suspendedIPs.containsKey(clientIP)) {
            call.respond(HttpStatusCode.TooManyRequests, mapOf("error" to "Rate limit exceeded. Access suspended for 5 minutes."))
            return
        }

        try {
            // Parse incoming JSON body (supports standard webhook parameters: "content" or "text")
            val payload = call.receive<Map<String, Any>>()
            val textContent = (payload["content"] as? String) ?: (payload["text"] as? String) ?: ""
            val filenameParam = call.request.queryParameters["filename"]
            val prependParam = call.request.queryParameters["prepend"]
            val appendParam = call.request.queryParameters["append"]

            if (textContent.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Payload must contain 'content' or 'text' key."))
                return
            }

            // Build formatting
            val prependText = prependParam?.let { "$it: " } ?: ""
            val appendText = appendParam?.let { " $it" } ?: ""
            val formattedLine = "$prependText$textContent$appendText"

            val externalDir = context.getExternalFilesDir(null)
            val vaultDir = File(externalDir, vaultName)
            if (!vaultDir.exists()) vaultDir.mkdirs()

            if (filenameParam != null) {
                // Append Mode: Append newlines to a single file
                val file = File(vaultDir, filenameParam)
                file.appendText("\n$formattedLine\n")
            } else {
                // Standard Mode: Create a separate timestamped Markdown file
                val timestamp = SimpleDateFormat("yyyyMMdd-HHmmss", Locale.getDefault()).format(Date())
                val file = File(vaultDir, "webhook-entry-$timestamp.md")
                
                val markdownPayload = """
                    ---
                    zettel_id: "$timestamp"
                    title: "Incoming Webhook Entry"
                    date: "${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())}"
                    tags:
                      - "webhook_ingest"
                    ---
                    
                    ### 📡 Webhook Ingest ($timestamp)
                    $formattedLine
                """.trimIndent()
                
                file.writeText(markdownPayload)
            }

            call.respond(HttpStatusCode.OK, mapOf("success" to true))
        } catch (e: Exception) {
            e.printStackTrace()
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to e.localizedMessage))
        }
    }

    private fun getWifiIPAddress(context: Context): String {
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        return Formatter.formatIpAddress(wifiManager.connectionInfo.ipAddress)
    }
}
