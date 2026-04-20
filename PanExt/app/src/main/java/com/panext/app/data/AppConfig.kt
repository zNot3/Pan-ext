package com.panext.app.data

// GEMINI_API_KEY is injected at build time from local.properties via BuildConfig.
// No runtime file reading needed.
object AppConfig {
    // Keep init() for backwards compatibility — no-op now
    fun init(@Suppress("UNUSED_PARAMETER") context: android.content.Context) = Unit
}
