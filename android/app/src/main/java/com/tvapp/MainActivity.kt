package com.tvapp

import android.view.KeyEvent
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {
  companion object {
    private const val TAG = "TV_REMOTE"
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "tvApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN || event.action == KeyEvent.ACTION_UP) {
      Log.d(
          TAG,
          "dispatchKeyEvent action=${if (event.action == KeyEvent.ACTION_DOWN) "DOWN" else "UP"} keyCode=${event.keyCode} keyName=${KeyEvent.keyCodeToString(event.keyCode)} repeat=${event.repeatCount}"
      )
      emitTvRemoteKeyEvent(
          action = if (event.action == KeyEvent.ACTION_DOWN) "DOWN" else "UP",
          event = event,
      )
    }
    return super.dispatchKeyEvent(event)
  }

  private fun emitTvRemoteKeyEvent(action: String, event: KeyEvent) {
    val reactContext = (application as? ReactApplication)
        ?.reactHost
        ?.currentReactContext
        ?: return

    val payload = Arguments.createMap().apply {
      putString("action", action)
      putInt("keyCode", event.keyCode)
      putString("keyName", KeyEvent.keyCodeToString(event.keyCode))
      putInt("repeatCount", event.repeatCount)
    }

    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("TV_REMOTE_KEY", payload)
  }
}
