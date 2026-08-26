package net.artkitty.anymd.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun MainComposeScreen(
    onToggleSettings: () -> Unit
) {
    var activeMode by remember { mutableStateOf("WORK") }
    var viewLayout by remember { mutableStateOf("Grid") }
    var syncStatus by remember { mutableStateOf("Synced") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0A))
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.KeepUntilSatisfied,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "🐱 anymd (Native)",
                color = Color.White,
                fontSize = 18.sp,
                fontFamily = FontFamily.Monospace
            )
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = {
                    activeMode = when (activeMode) {
                        "WORK" -> "PLAY"
                        "PLAY" -> "PERSONAL"
                        else -> "WORK"
                    }
                },
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("[ $activeMode ]", fontFamily = FontFamily.Monospace)
            }
        }

        // View Layout and Sync Status Box
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color(0xFF333333), RoundedCornerShape(12.dp))
                .padding(16.dp)
        ) {
            Text("Layout: $viewLayout View", color = Color(0xFF888888), fontSize = 12.sp)
            Text("Sync Status: 🟢 $syncStatus", color = Color(0xFF4ADE80), fontSize = 12.sp)
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Grid", "List", "3D", "Spines", "Hangers").forEach { layout ->
                    Button(
                        onClick = { viewLayout = layout },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (viewLayout == layout) Color(0xFF333333) else Color(0xFF1E1E1E)
                        )
                    ) {
                        Text(layout, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }

        // Actions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(onClick = onToggleSettings) {
                Text("Settings Gear")
            }
        }
    }
}

// Helper arranging extension for Row
private val Arrangement.KeepUntilSatisfied: Arrangement.Horizontal
    get() = Arrangement.SpaceBetween
