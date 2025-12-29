import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import fs from 'fs'
import path from 'path'
import router from './routes'
import { swaggerSpec } from './swagger'

const app = new Koa()
const port = process.env.PORT || 3005

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const error = err as Error
    console.error('Error:', error.message)
    ctx.status = 500
    ctx.body = { error: 'Internal server error' }
  }
})

// Middleware
app.use(cors())
app.use(bodyParser())

// Serve Swagger spec JSON
app.use(async (ctx, next) => {
  if (ctx.path === '/api-docs.json') {
    ctx.body = swaggerSpec
    ctx.type = 'application/json'
    return
  }
  await next()
})

// Serve custom Swagger UI HTML
app.use(async (ctx, next) => {
  if (ctx.path === '/docs' || ctx.path === '/docs/') {
    ctx.type = 'text/html'
    ctx.body = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/api-docs.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
      </html>
    `
    return
  }
  await next()
})

// Routes
app.use(router.routes())
app.use(router.allowedMethods())

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  console.log(`API Documentation: http://localhost:${port}/docs`)
  console.log(`Health check: http://localhost:${port}/health`)
})
