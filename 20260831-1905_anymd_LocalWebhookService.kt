package net.artkitty.anymd.capture

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.http.*
import java.io.File
import kotlinx.coroutines.*

/**
 * Zettelkasten ID: 20260831-1905
 * Project: anyMD Local Webhook Ingestion Service
 * Role: Unkillable background Ktor server running natively inside the Android App package.
 * Listens on Port 3050 for incoming IFTTT/Tasker automation streams.
 */
class LocalWebhookService : Service() {

    private val serviceJob = Job()
    private val scope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var server: NettyApplicationEngine? = null

    companion object {
        private const val CHANNEL_ID = "LocalWebhookChannel"
        private const val NOTIFICATION_ID = 3050
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification())
        startKtorServer()
    }

    private fun startKtorServer() {
        scope.launch {
            server = embeddedServer(Netty, port = 3050) {
                routing {
                    post("/webhook/{vaultName}") {
                        val vaultName = call.parameters["vaultName"] ?: "Inbox"
                        val payload = call.receiveText()
                        
                        // Local Append Mode handling to prevent folder bloating
                        val targetFile = File(filesDir, "$vaultName-Log.md")
                        targetFile.appendText("\n---\ntimestamp: ${System.currentTimeMillis()}\npayload: $payload\n\n")

                        call.respondText("(=^.^=) Purrs! Log appended to $vaultName-Log.md", contentType = ContentType.Text.Plain, status = HttpStatusCode.OK)
                    }
                }
            }.start(wait = false)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "anyMD Webhook Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps local Ktor Netty daemon active on Port 3050 for local macro bindings."
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("anyMD Webhook Ingestion active")
                .setContentText("Ktor Netty server listening on http://localhost:3050")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("anyMD Webhook Ingest Active")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .build()
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        server?.stop(1000, 2000)
        serviceJob.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
