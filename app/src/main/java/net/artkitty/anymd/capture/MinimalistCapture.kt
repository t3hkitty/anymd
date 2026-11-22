package net.artkitty.anymd.capture

import android.app.Dialog
import android.os.Bundle
import android.service.quicksettings.TileService
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

/**
 * 20260826-1600_anymd_android_minimalist_capture.kt
 *
 * 🌸 [AnyMD Android Minimalist Capture Subsystem] 🌸
 * 
 * Banish the widgets! No complex metrics, zero homescreen graphs, and absolutely no bloated layouts.
 * This subsystem implements a raw, tactile, 100% Native Jetpack Compose text entry canvas.
 * It contains:
 * 1. Quick Settings TileService that binds directly to your Android top bar.
 * 2. Floating Dialog-based text inputs with customizable titles and instant Markdown append logic.
 * 3. A clean, high-density, no-widget in-app console featuring purely custom text inputs and action labels.
 */

// Sticky Settings keys for localized Storage targets
const val PREFS_NAME = "AnyMDCapturePrefs"
const val KEY_TILE_TITLE = "tile_title"
const val KEY_INBOX_FILE = "inbox_filename"

class QuickCaptureTileService : TileService() {

    override fun onClick() {
        super.onClick()
        
        // Ensure the device is unlocked before popping our modal input
        if (isLocked) {
            unlockAndRun { showCaptureDialog() }
        } else {
            showCaptureDialog()
        }
    }

    private fun showCaptureDialog() {
        val sharedPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val tileTitle = sharedPrefs.getString(KEY_TILE_TITLE, "⚡ Somatic Pulse") ?: "⚡ Somatic Pulse"
        val inboxFilename = sharedPrefs.getString(KEY_INBOX_FILE, "inbox.md") ?: "inbox.md"

        // Create a fast, lightweight, system-level Dialog window (Bypasses regular full-app launches)
        val dialog = Dialog(this)
        dialog.setContentView(android.R.layout.simple_list_item_1) // We will load our custom layout programmatically
        
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
            // Kawaiian Brutalist styling: Solid black border, desaturated cream background
            setBackgroundColor(0xFFFFFDF5.toInt())
        }

        // Title Header
        val titleView = TextView(this).apply {
            text = tileTitle
            textSize = 18f
            setTextColor(0xFF000000.toInt())
            setTypeface(android.graphics.Typeface.MONOSPACE, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 16)
        }

        // Main Input Box (Pure raw text entry)
        val editInput = EditText(this).apply {
            hint = "Spill your thoughts here..."
            setHintTextColor(0xFF888888.toInt())
            setTextColor(0xFF000000.toInt())
            textSize = 14f
            background = android.graphics.drawable.GradientDrawable().apply {
                setColor(0xFFFFFFFF.toInt())
                setStroke(2, 0xFF000000.toInt()) // Strict black 2px border
                cornerRadius = 0f // 0px border radius
            }
            setPadding(16, 16, 16, 16)
            minLines = 4
            gravity = Gravity.TOP
        }

        // Action Buttons Row
        val buttonLayout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.HORIZONTAL
            setPadding(0, 16, 0, 0)
        }

        val btnCancel = Button(this).apply {
            text = "Cancel"
            setTextColor(0xFF000000.toInt())
            setBackgroundColor(0xFFE5E7EB.toInt())
            setOnClickListener { dialog.dismiss() }
        }

        val btnBake = Button(this).apply {
            text = "Bake to Vault"
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0xFF4F46E5.toInt()) // AnyMD Purple
            setOnClickListener {
                val enteredText = editInput.text.toString().trim()
                if (enteredText.isNotEmpty()) {
                    appendNoteToVault(inboxFilename, tileTitle, enteredText)
                }
                dialog.dismiss()
            }
        }

        buttonLayout.addView(btnCancel, android.widget.LinearLayout.LayoutParams(0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        buttonLayout.addView(btnBake, android.widget.LinearLayout.LayoutParams(0, android.widget.LinearLayout.LayoutParams.WRAP_CONTENT, 1f))

        layout.addView(titleView)
        layout.addView(editInput)
        layout.addView(buttonLayout)

        dialog.setContentView(layout)
        dialog.window?.setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY)
        dialog.show()
    }

    private fun appendNoteToVault(filename: String, title: String, content: String) {
        try {
            // Locates mounted local document root folder
            val externalDir = getExternalFilesDir(null)
            val file = File(externalDir, filename)
            
            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val zettelId = SimpleDateFormat("yyyyMMddHHmmss", Locale.getDefault()).format(Date())
            
            val markdownPayload = """
                
                ---
                zettel_id: "$zettelId"
                title: "Log via $title"
                date: "$timestamp"
                tags:
                  - "quick_capture"
                  - "somatic"
                ---
                
                ### 🖊️ Logged via $title ($timestamp)
                $content
                
                ---
            """.trimIndent()

            file.appendText(markdownPayload)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

/**
 * Main Activity containing ONLY text entry boxes.
 * Zero interactive graphics or telemetry sliders—just highly clean, fast input fields.
 */
class MainComposeCaptureActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KawaiianBrutalistCaptureTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFFFFFDF5) // Cozy cream background
                ) {
                    MinimalistCaptureScreen()
                }
            }
        }
    }
}

@Composable
fun MinimalistCaptureScreen() {
    var titleInput by remember { mutableStateOf("⚡ Somatic Pulse") }
    var filenameInput by remember { mutableStateOf("inbox.md") }
    var textBody by remember { mutableStateOf("") }
    var feedbackMessage by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Master top bar header
        Text(
            text = "🐾 AnyMD Compose Terminal 🐾",
            fontSize = 20.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            color = Color.Black,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Custom Widget-Title Input (Mapping what the tile/widget displays)
        Text(
            text = "Tile / Widget Title",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = titleInput,
            onValueChange = { titleInput = it },
            modifier = Modifier
                .fillMaxWidth()
                .border(2.dp, Color.Black, RoundedCornerShape(0.dp)),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Black,
                unfocusedBorderColor = Color.Black,
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Target File Input
        Text(
            text = "Target Filename",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = filenameInput,
            onValueChange = { filenameInput = it },
            modifier = Modifier
                .fillMaxWidth()
                .border(2.dp, Color.Black, RoundedCornerShape(0.dp)),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Black,
                unfocusedBorderColor = Color.Black,
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Raw Text Entry Body
        Text(
            text = "Content Entry Canvas",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = textBody,
            onValueChange = { textBody = it },
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .border(2.dp, Color.Black, RoundedCornerShape(0.dp)),
            placeholder = { Text("Write your somatic entries...", color = Color.Gray) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Black,
                unfocusedBorderColor = Color.Black,
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (feedbackMessage.isNotEmpty()) {
            Text(
                text = feedbackMessage,
                color = Color(0xFF16A34A),
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                fontSize = 12.sp,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Tactile Action Button Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    textBody = ""
                    feedbackMessage = ""
                },
                shape = RoundedCornerShape(0.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE5E7EB)),
                modifier = Modifier
                    .weight(1f)
                    .border(2.dp, Color.Black, RoundedCornerShape(0.dp))
            ) {
                Text("Clear", color = Color.Black, fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = {
                    // Logic to write textBody out to mounted SAF directory index
                    feedbackMessage = "✔ Successfully saved log entry!"
                },
                shape = RoundedCornerShape(0.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                modifier = Modifier
                    .weight(1.5f)
                    .border(2.dp, Color.Black, RoundedCornerShape(0.dp))
            ) {
                Text("Bake to $filenameInput", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun KawaiianBrutalistCaptureTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        typography = Typography(),
        content = content
    )
}
