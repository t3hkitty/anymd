package net.artkitty.anymd.listeners

import android.content.Context
import java.io.File
import java.io.FileWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DeviceVaultWriter(private val context: Context) {
    fun writeDailyNote(content: String): File? {
        return try {
            val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
            val vaultDir = File(context.getExternalFilesDir(null), "device-vault/daily")
            if (!vaultDir.exists()) {
                vaultDir.mkdirs()
            }
            val file = File(vaultDir, "$dateStr.md")
            val writer = FileWriter(file, true)
            writer.write(content + "\n")
            writer.close()
            file
        } catch (e: Exception) {
            null
        }
    }
}
