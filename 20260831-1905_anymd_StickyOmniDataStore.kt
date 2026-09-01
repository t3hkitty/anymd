package net.artkitty.anymd.state

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Zettelkasten ID: 20260831-1905
 * Project: anyMD StickyOmni Universal Settings Engine
 * Role: Low-latency local persistent state with hierarchical override configurations.
 * Hierarchy: System Default -> App Default -> Vault Pin.
 */
class StickyOmniDataStore(private val context: Context) {

    companion object {
        private val Context.dataStore by preferencesDataStore(name = "sticky_omni_preferences")
        private val ACTIVE_VAULT_PATH = stringPreferencesKey("active_vault_path")
        private val FONT_SIZE_COEFFICIENT = intPreferencesKey("font_size_coefficient")
        private val ACTIVE_THEME_MODE = stringPreferencesKey("active_theme_mode")
    }

    val activeVaultPathFlow: Flow<String> = context.dataStore.data.map { prefs ->
        // Default GDrive mount path cleanly pre-set to avoid folder-selection blocks on boot
        prefs[ACTIVE_VAULT_PATH] ?: "G:/My Drive/myapks"
    }

    val fontSizeFlow: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[FONT_SIZE_COEFFICIENT] ?: 16
    }

    val themeFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[ACTIVE_THEME_MODE] ?: "heather_blue"
    }

    suspend fun saveActiveVaultPath(path: String) {
        context.dataStore.edit { prefs ->
            prefs[ACTIVE_VAULT_PATH] = path
        }
    }

    suspend fun saveFontSize(size: Int) {
        context.dataStore.edit { prefs ->
            prefs[FONT_SIZE_COEFFICIENT] = size
        }
    }

    suspend fun saveTheme(theme: String) {
        context.dataStore.edit { prefs ->
            prefs[ACTIVE_THEME_MODE] = theme
        }
    }
}
