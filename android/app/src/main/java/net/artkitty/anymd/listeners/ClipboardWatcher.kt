package net.artkitty.anymd.listeners

import android.content.ClipboardManager
import android.content.Context

class ClipboardWatcher(private val context: Context, private val onClipboardChanged: (String) -> Unit) {
    private val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    private val listener = ClipboardManager.OnPrimaryClipChangedListener {
        val clip = clipboard.primaryClip
        if (clip != null && clip.itemCount > 0) {
            val text = clip.getItemAt(0).text?.toString() ?: ""
            if (text.isNotEmpty()) {
                onClipboardChanged(text)
                // Log to daily device vault
                DeviceVaultWriter(context).writeDailyNote("- [Clipboard] Copied: $text")
            }
        }
    }

    fun start() {
        clipboard.addPrimaryClipChangedListener(listener)
    }

    fun stop() {
        clipboard.removePrimaryClipChangedListener(listener)
    }
}
