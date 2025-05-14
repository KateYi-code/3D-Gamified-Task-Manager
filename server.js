import fs from "fs"
import { parse } from "url"
import path from "path"
import { createServer } from "https"
import next from "next"

const dev = process.env.NODE_ENV !== 'production'
const app = next({ 
  dev,
  conf: {
    pwa: {
      dest: 'public/pwa',
      register: process.env.NODE_ENV === 'production' || process.env.ENABLE_PWA === 'true',
      skipWaiting: true,
      disable: process.env.NODE_ENV === 'development' && process.env.DISABLE_PWA !== 'false',
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
      swcMinify: true,
      reloadOnOnline: true
    }
  }
})
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync(path.join(process.cwd(), 'certificates', 'key.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), 'certificates', 'cert.pem')),
}

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
  })
}) 