export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigoInk: "#202145",
        loomGray: "#ECEEF4",
        yarnSun: "#FFB23F",
        mintGlow: "#C6F5D4",
        night: "#05060F",
        midnight: "#0F172A",
        twilight: "#1E1B4B",
        cloud: "#F5F7FB",
        haze: "#CBD5F5",
        aurora: "#7C3AED",
        amberPulse: "#F59E0B",
        lagoon: "#06B6D4",
        moss: "#10B981",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Sora", "sans-serif"],
        body: ['"General Sans"', "Inter", "sans-serif"],
      },
      boxShadow: {
        glass: "0 25px 70px -35px rgba(15, 23, 42, 0.65)",
        card: "0 18px 35px -20px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        "aurora-grid":
          "radial-gradient(circle at 20% 20%, rgba(124,58,237,.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(6,182,212,.2), transparent 35%), radial-gradient(circle at 50% 80%, rgba(245,158,11,.15), transparent 40%)",
      },
    },
  },
  plugins: [],
};
