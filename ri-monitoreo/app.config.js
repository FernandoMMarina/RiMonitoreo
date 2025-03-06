export default ({ config }) => ({
  expo: {
    name: "Ri-monitoreo",
    slug: "ri",
    version: "1.0.0",
    scheme: "rosenstein",
    orientation: "portrait",
    icon: "./assets/logo.png",
    backgroundColor: "#1D1936",
    userInterfaceStyle: "light",
    "plugins": [
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera.",
          "enableCodeScanner": true,
          // optionally, if you want to record audio:
          "enableMicrophonePermission": true,
          "microphonePermissionText": "$(PRODUCT_NAME) needs access to your Microphone."
        }
      ]
    ],
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#1D1936",
      imageWidth: 200
    },
    ios: {
      bundleIdentifier: "com.riapp.ios",
      "icon": "./assets/icon.png",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Esta aplicación necesita acceso a la cámara para escanear códigos QR.",
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSUserTrackingUsageDescription:
          "Este identificador se utilizará para enviarte notificaciones personalizadas.",
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["rosenstein"]
          }
        ]
      },
      associatedDomains: ["applinks:rosensteininstalaciones.com.ar"]
    },
    android: {
      package: "com.appri.android",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#1D1936"
      },
      notification: {
        icon: "./assets/icon-noti.png",
        color: "#1D1936"
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "CAMERA"
      ],
      useNextNotificationsApi: true,
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: "rosensteininstalaciones.com.ar",
              pathPrefix: "/machine"
            },
            {
              scheme: "rosenstein",
              host: "machine"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl:
        process.env.NODE_ENV === "production"
          ? "https://rosensteininstalaciones.com.ar/api"
          : "http://localhost:5000/api",
      eas: {
        projectId: "189830c1-cebf-44db-8a55-581f6004700b"
      }
    },
    scheme: "rosenstein",
    platforms: ["ios", "android"]
  }
});
