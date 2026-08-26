package net.artkitty.anymd.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun SettingsCompose(
    onBack: () -> Unit
) {
    var bluetoothWatcherEnabled by remember { mutableStateOf(true) }
    var notificationListenerEnabled by remember { mutableStateOf(true) }
    var clipboardWatcherEnabled by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F0F0F))
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("⚙️ Listener Settings", style = MaterialTheme.typography.titleLarge, color = Color.White)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Bluetooth Battery Watcher", color = Color.LightGray)
            Switch(
                checked = bluetoothWatcherEnabled,
                onCheckedChange = { bluetoothWatcherEnabled = it }
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Notification Ingest Service", color = Color.LightGray)
            Switch(
                checked = notificationListenerEnabled,
                onCheckedChange = { notificationListenerEnabled = it }
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Clipboard Watcher Listener", color = Color.LightGray)
            Switch(
                checked = clipboardWatcherEnabled,
                onCheckedChange = { clipboardWatcherEnabled = it }
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = onBack,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Save & Close")
        }
    }
}
