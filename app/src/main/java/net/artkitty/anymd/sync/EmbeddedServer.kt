package net.artkitty.anymd.sync

import android.content.Context
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import net.artkitty.anymd.listeners.DeviceVaultWriter
import java.io.IOException
import java.net.InetSocketAddress

class EmbeddedServer(private val context: Context) {
    private var server: HttpServer? = null
    private val port = 5174

    fun start() {
        try {
            server = HttpServer.create(InetSocketAddress(port), 0)
            server?.createContext("/webhook", WebhookHandler(context))
            server?.executor = null // default executor
            server?.start()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stop() {
        server?.stop(0)
    }

    private class WebhookHandler(private val context: Context) : HttpHandler {
        @Throws(IOException::class)
        override fun handle(exchange: HttpExchange) {
            if ("POST" == exchange.requestMethod) {
                val input = exchange.requestBody
                val body = input.bufferedReader().use { it.readText() }
                
                // Write received payload content to daily Markdown file
                val writer = DeviceVaultWriter(context)
                writer.writeDailyNote("- [Webhook Server Received]: $body")
                
                val response = "{\"status\":\"ok\"}"
                exchange.sendResponseHeaders(200, response.length.toLong())
                val os = exchange.responseBody
                os.write(response.toByteArray())
                os.close()
            } else {
                exchange.sendResponseHeaders(405, -1) // Method Not Allowed
            }
        }
    }
}
