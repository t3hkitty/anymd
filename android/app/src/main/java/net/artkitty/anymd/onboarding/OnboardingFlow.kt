package net.artkitty.anymd.onboarding

import android.content.Context
import java.io.File

class OnboardingFlow(private val context: Context) {
    fun restoreJointBundle(zipFile: File): Boolean {
        // Mock restoration of joint bundle (.anymd/ + notes + configs)
        return zipFile.exists()
    }

    fun setupN8nEndpoint(url: String): Boolean {
        // Mock verification of n8n endpoint
        val sharedPrefs = context.getSharedPreferences("anymd_prefs", Context.MODE_PRIVATE)
        sharedPrefs.edit().putString("n8n_endpoint", url).apply()
        return true
    }

    fun startLocalOnly(): Boolean {
        // Switch to local mode setup
        val sharedPrefs = context.getSharedPreferences("anymd_prefs", Context.MODE_PRIVATE)
        sharedPrefs.edit().putBoolean("local_only", true).apply()
        return true
    }
}
