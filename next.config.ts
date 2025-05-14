import nextPWA from "next-pwa"
import fs from 'fs'
import path from 'path'

const baseConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  webpack: (config:any, { isServer, dev }: any) => {
    if (isServer && process.env.USE_HTTPS === 'true') {
      const httpsOptions = {
        key: fs.readFileSync(path.join(process.cwd(), 'certificates', 'key.pem')),
        cert: fs.readFileSync(path.join(process.cwd(), 'certificates', 'cert.pem')),
      }
      config.devServer = {
        ...config.devServer,
        https: httpsOptions
      }
    }
    return config
  }
}

const nextConfig = nextPWA({
  dest: "public/pwa",
  register: true,
  skipWaiting: true,
  disable: false,
  buildExcludes: [/middleware-manifest.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/localhost:3000\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'local-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ],
  reloadOnOnline: true,
})(baseConfig)

export default nextConfig
