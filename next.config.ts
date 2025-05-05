import nextPWA from "next-pwa"

const baseConfig = {
}

const nextConfig = nextPWA({
  dest: "public/pwa",
  register: true,
  skipWaiting: true,
})(baseConfig)

export default nextConfig
