export default ({ config }) => ({
  expo: {
    name: "ri-monitoreo",
    slug: "ri",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.riapp.ios", // Identificador único para iOS
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSUserTrackingUsageDescription:
          "Este identificador se utilizará para enviarte notificaciones personalizadas."
      },
      associatedDomains: ["applinks:rosensteininstalaciones.com.ar"] // Enlaces universales para iOS
    },
    android: {
      package: "com.appri.android", // Identificador único para Android
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "FOREGROUND_SERVICE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK"
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
    scheme: "rosenstein", // Esquema de URI para Deep Linking
    platforms: ["ios", "android"]
  }
});
