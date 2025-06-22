# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep networking classes to prevent API connection issues
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keep class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**

# Keep React Native networking
-keep class com.facebook.react.modules.network.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Keep AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep Axios and HTTP client classes
-keep class * extends java.net.URLConnection { *; }
-keep class javax.net.ssl.** { *; }
-keep class java.security.cert.** { *; }

# Keep JSON parsing
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.fasterxml.jackson.annotation.* <fields>;
    @com.fasterxml.jackson.annotation.* <methods>;
}

# Network security - prevent certificate validation issues
-keep class java.security.** { *; }
-keep class javax.net.ssl.** { *; }
-keep class org.apache.http.** { *; }
-dontwarn java.security.**
-dontwarn javax.net.ssl.**
-dontwarn org.apache.http.**
