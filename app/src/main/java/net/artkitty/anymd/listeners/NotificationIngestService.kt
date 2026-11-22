package net.artkitty.anymd.listeners

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class NotificationIngestService : NotificationListenerService() {
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        
        // Log notification to device vault writer
        val noteContent = "- [Notification] App: $packageName | Title: $title | Text: $text"
        DeviceVaultWriter(applicationContext).writeDailyNote(noteContent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Optional tracking
    }
}
