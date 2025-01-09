package chat.rocket.reactnative

import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import android.content.Intent
import android.net.Uri
import android.os.Build.VERSION_CODES
import android.os.Build.VERSION_CODES.N_MR1
import android.util.Log
import android.widget.Toast
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import com.bumptech.glide.request.RequestOptions
import android.graphics.Bitmap
import com.bumptech.glide.load.resource.bitmap.BitmapTransitionOptions
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.facebook.react.bridge.ReadableMap

class QuickActionsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "QuickActions"
    }

    @ReactMethod
    fun showToast(message: String) {
        Toast.makeText(reactApplicationContext, message, Toast.LENGTH_SHORT).show()
    }

    @ReactMethod
    fun isSupported(promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) {
            promise.resolve(false)
            return
        }
        val shortcutManager = reactApplicationContext.getSystemService(ShortcutManager::class.java)
        promise.resolve(shortcutManager.isRequestPinShortcutSupported)
    }

    @ReactMethod
    fun setQuickActions(actions: ReadableArray) {
        val shortcutManager = reactApplicationContext.getSystemService(ShortcutManager::class.java)
        
        val shortcuts = actions.toArrayList().map { action1 ->
            var map = action1 as Map<*, *>
            Log.d("QuickActions", "action: $action1")
            
            val intent = Intent(reactApplicationContext, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse(map["url"] as String)
            }
    
            val iconUri = map["icon"] as? String
            val icon = if (!iconUri.isNullOrEmpty()) {
                try {
                    val bitmap = Glide.with(reactApplicationContext)
                        .asBitmap()
                        .load(iconUri)
                        // .skipMemoryCache(true)
                        // .diskCacheStrategy(DiskCacheStrategy.ALL)
                        // .apply(RequestOptions().transform(RoundedCorners(0))) // Optional rounded corners
                        // .apply(RequestOptions().override(220, 220)) // Resize the image
                        .submit()
                        .get()

                        Icon.createWithAdaptiveBitmap(bitmap)
                } catch (e: Exception) {
                    Toast.makeText(reactApplicationContext, "Error downloading or loading icon, using default", Toast.LENGTH_SHORT).show()
                    Log.e("QuickActions", "Error downloading or loading icon, using default", e)
                    Icon.createWithResource(reactApplicationContext, R.mipmap.ic_launcher)
                }
            } else {
                Toast.makeText(reactApplicationContext, "No icon provided, using default", Toast.LENGTH_SHORT).show()
                Icon.createWithResource(reactApplicationContext, R.mipmap.ic_launcher)
            }
    
            ShortcutInfo.Builder(reactApplicationContext, map["id"] as String)
                .setShortLabel(map["shortLabel"] as String)
                .setLongLabel(map["longLabel"] as String)
                .setIcon(icon)
                .setIntent(intent)
                .build()
        }
    
        shortcutManager.dynamicShortcuts = shortcuts
    }

    @ReactMethod
    fun createChatShortcut(payload: ReadableMap, promise: Promise) {
        val shortcutManager = reactApplicationContext.getSystemService(ShortcutManager::class.java)

        try {
            val id = payload.getString("id") ?: throw IllegalArgumentException("Missing 'id'")
            val shortLabel = payload.getString("shortLabel") ?: throw IllegalArgumentException("Missing 'shortLabel'")
            val longLabel = payload.getString("longLabel") ?: throw IllegalArgumentException("Missing 'longLabel'")
            val url = payload.getString("url") ?: throw IllegalArgumentException("Missing 'url'")
            val iconUri = payload.getString("icon") ?: throw IllegalArgumentException("Missing 'icon'")

            val intent = Intent(reactApplicationContext, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse(url)
            }

            val icon: Icon = try {
                if (!iconUri.isNullOrEmpty()) {
                    val bitmap = Glide.with(reactApplicationContext)
                        .asBitmap()
                        .load(iconUri)
                        .submit()
                        .get()

                    Icon.createWithAdaptiveBitmap(bitmap)
                } else {
                    Icon.createWithResource(reactApplicationContext, R.mipmap.ic_launcher)
                }
            } catch (e: Exception) {
                Log.e("QuickActions", "Error loading icon, using default", e)
                Icon.createWithResource(reactApplicationContext, R.mipmap.ic_launcher)
            }

            val shortcut = ShortcutInfo.Builder(reactApplicationContext, id)
                .setShortLabel(shortLabel)
                .setLongLabel(longLabel)
                .setIcon(icon)
                .setIntent(intent)
                .build()

            shortcutManager.requestPinShortcut(shortcut, null)
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e("QuickActions", "Error creating shortcut", e)
            promise.reject("ShortcutError", "Failed to create shortcut", e)
        }
    }

    @RequiresApi(Build.VERSION_CODES.N_MR1)
    @ReactMethod
    fun clearQuickActions(promise: Promise) {
        val shortcutManager = reactApplicationContext.getSystemService(ShortcutManager::class.java)
        shortcutManager.removeAllDynamicShortcuts()
        promise.resolve(null)
    }

    @RequiresApi(Build.VERSION_CODES.N_MR1)
    @ReactMethod
    fun getQuickActions(promise: Promise) {
        try {
            val shortcutManager = reactApplicationContext.getSystemService(ShortcutManager::class.java)
            val shortcuts = shortcutManager.dynamicShortcuts
    
            val writableArray = Arguments.createArray()
    
            for (shortcut in shortcuts) {
                val writableMap = Arguments.createMap()
                writableMap.putString("id", shortcut.id)
                writableMap.putString("shortLabel", shortcut.shortLabel.toString())
                writableMap.putString("longLabel", shortcut.longLabel.toString())
                writableMap.putString("url", shortcut.intent?.data.toString())

                writableArray.pushMap(writableMap)
            }
    
            promise.resolve(writableArray)
        } catch (e: Exception) {
            promise.reject("GET_QUICK_ACTIONS_ERROR", "Failed to get quick actions", e)
        }
    }
}
