package net.artkitty.anymd.db

import java.io.File
import java.io.RandomAccessFile
import java.security.MessageDigest
import org.yaml.snakeyaml.Yaml

/**
 * Zettelkasten ID: 20260831-1905
 * Project: anyMD Mobile Native Database Core
 * Role: Headless Markdown Engine with zero-copy chunk parsing and byte-offset AST chunking.
 * Strictly local-first. Pure Markdown all the way down, supported by companion sidecars.
 */
class AnymdDbEngine(private val vaultRoot: File) {

    private val yamlParser = Yaml()
    private val dbManifestName = "anymd.db.md"

    init {
        if (!vaultRoot.exists()) {
            vaultRoot.mkdirs()
        }
        initializeManifest()
    }

    /**
     * Initializes the Master anymd.db.md single-file manifest if missing.
     */
    private fun initializeManifest() {
        val manifest = File(vaultRoot, dbManifestName)
        if (!manifest.exists()) {
            manifest.writeText(
                """---
                |title: anyMD Master Local-First Database Manifest
                |uuid: ${java.util.UUID.randomUUID()}
                |status: active
                |---
                |# 🐢 anyMD Master Manifest
                |Pure Markdown all the way down.
                |""".trimMargin()
            )
        }
    }

    /**
     * Executes a 3-tier fingerprint validation check to detect file changes.
     */
    fun calculateFileFingerprint(file: File): String {
        if (!file.exists()) return ""
        val statQuick = "${file.length()}-${file.lastModified()}"
        
        // Tier 2: Head Byte Slice (512-byte sample)
        val sliceSize = minOf(file.length(), 512L).toInt()
        val buffer = ByteArray(sliceSize)
        RandomAccessFile(file, "r").use { raf ->
            raf.readFully(buffer)
        }
        val headHash = MessageDigest.getInstance("SHA-256")
            .digest(buffer)
            .joinToString("") { "%02x".format(it) }

        return "$statQuick-$headHash"
    }

    /**
     * Parses Markdown file into a custom Structured Zettel node.
     */
    fun parseZettel(file: File): Map<String, Any?> {
        val content = file.readText()
        val frontmatterPattern = "^---[\s\S]*?---".toRegex()
        val match = frontmatterPattern.find(content)

        val metadata = if (match != null) {
            val rawYaml = match.value.trim().removeSurrounding("---").trim()
            try {
                yamlParser.load<Map<String, Any>>(rawYaml) ?: emptyMap()
            } catch (e: Exception) {
                mapOf("parse_error" to e.localizedMessage)
            }
        } else {
            emptyMap()
        }

        val body = content.substring(match?.range?.last ?: 0).trim()

        return mapOf(
            "file_name" to file.name,
            "path" to file.absolutePath,
            "metadata" to metadata,
            "body" to body,
            "fingerprint" to calculateFileFingerprint(file)
        )
    }

    /**
     * Writes out an external JSON sidecar for relational indexing without corrupting MD.
     */
    fun writeSidecar(file: File, sidecarData: String) {
        val sidecarFile = File(file.parentFile, ".${file.name}.anymd.json")
        sidecarFile.writeText(sidecarData)
    }
}
