package net.artkitty.anymd.listeners

import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter

class BluetoothBatteryWatcher(private val context: Context, private val onBatteryUpdate: (String, Int) -> Unit) {
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val action = intent.action
            if (action == "android.bluetooth.device.action.BATTERY_LEVEL_CHANGED") {
                val device = intent.getParcelableExtra<BluetoothDevice>(BluetoothDevice.EXTRA_DEVICE)
                val level = intent.getIntExtra("android.bluetooth.device.extra.BATTERY_LEVEL", -1)
                if (device != null && level != -1) {
                    onBatteryUpdate(device.name ?: device.address, level)
                    // Log to DeviceVaultWriter
                    DeviceVaultWriter(context).writeDailyNote("- Bluetooth device ${device.name} battery updated to $level%")
                }
            }
        }
    }

    fun start() {
        val filter = IntentFilter("android.bluetooth.device.action.BATTERY_LEVEL_CHANGED")
        context.registerReceiver(receiver, filter)
    }

    fun stop() {
        try {
            context.unregisterReceiver(receiver)
        } catch (e: Exception) {}
    }
}
