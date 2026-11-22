package net.artkitty.anymd.sync

import android.content.Context
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class N8nJointSync(private val context: Context) {
    fun syncVault(n8nEndpoint: String, vaultId: String, filesData: List<Map<String, String>>): Boolean {
        return try {
            val url = URL(n8nEndpoint)
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            conn.doOutput = true
            
            val payload = JSONObject()
            payload.put("action", "SYNC_VAULT")
            payload.put("vaultId", vaultId)
            payload.put("files", filesData)
            
            val writer = OutputStreamWriter(conn.outputStream)
            writer.write(payload.toString())
            writer.flush()
            writer.close()
            
            val responseCode = conn.responseCode
            conn.disconnect()
            responseCode == HttpURLConnection.HTTP_OK
        } catch (e: Exception) {
            false
        }
    }
}
