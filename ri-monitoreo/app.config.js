export default ({ config }) => ({
  expo: {
    name: "ri-monitoreo",
    slug: "ri-monitoreo",
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
      bundleIdentifier: "com.tuapp.ios",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSUserTrackingUsageDescription:
          "Este identificador se utilizará para enviarte notificaciones personalizadas."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl:
        process.env.NODE_ENV === "production"
          ? "http://ec2-50-16-74-81.compute-1.amazonaws.com:5000/api"
          : "http://localhost:5000/api"
    }
  }
});