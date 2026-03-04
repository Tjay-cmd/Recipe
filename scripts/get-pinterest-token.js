/**
 * One-time script to get a Pinterest OAuth access token.
 *
 * Prerequisites:
 * 1. Create a Pinterest app at https://developers.pinterest.com/apps/
 * 2. Add redirect URI: http://localhost:8085/
 * 3. Set env vars: PINTEREST_APP_ID, PINTEREST_APP_SECRET
 *
 * Run: node scripts/get-pinterest-token.js
 *
 * The script will:
 * 1. Open your browser to Pinterest's authorization page
 * 2. You authorize the app
 * 3. Pinterest redirects to localhost with a code
 * 4. The script exchanges the code for an access token
 * 5. Prints the token - add it to .env.local as PINTEREST_ACCESS_TOKEN
 */

const http = require('http')
const { exec } = require('child_process')

const PORT = 8085
const REDIRECT_URI = `http://localhost:${PORT}/`
const SCOPES = [
  'user_accounts:read',
  'boards:read',
  'boards:write',
  'pins:read',
  'pins:write',
].join(',')

const appId = process.env.PINTEREST_APP_ID
const appSecret = process.env.PINTEREST_APP_SECRET

if (!appId || !appSecret) {
  console.error('Error: Set PINTEREST_APP_ID and PINTEREST_APP_SECRET in your environment.')
  console.error('Example:')
  console.error('  PINTEREST_APP_ID=xxx PINTEREST_APP_SECRET=yyy node scripts/get-pinterest-token.js')
  process.exit(1)
}

const authUrl = `https://www.pinterest.com/oauth/?` +
  `client_id=${appId}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(SCOPES)}`

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <h1>Authorization failed</h1>
      <p>Error: ${error}</p>
      <p>${url.searchParams.get('error_description') || ''}</p>
    `)
    server.close()
    return
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>No code received</h1><p>Close this tab and try again.</p>')
    return
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }).toString()

    const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      },
      body,
    })

    const data = await tokenRes.json()

    if (!tokenRes.ok) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`
        <h1>Token exchange failed</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `)
      server.close()
      return
    }

    const accessToken = data.access_token
    const refreshToken = data.refresh_token

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <h1>Success!</h1>
      <p>Close this tab. Your access token is in the terminal.</p>
    `)

    console.log('\n--- Add this to your .env.local file ---\n')
    console.log(`PINTEREST_ACCESS_TOKEN=${accessToken}`)
    if (refreshToken) {
      console.log(`PINTEREST_REFRESH_TOKEN=${refreshToken}`)
    }
    console.log('\n-----------------------------------------\n')

    server.close()
  } catch (err) {
    console.error('Token exchange error:', err)
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end(`<h1>Error</h1><pre>${err.message}</pre>`)
    server.close()
  }
})

server.listen(PORT, () => {
  console.log(`\nOpening browser to Pinterest authorization...`)
  console.log(`If it doesn't open, go to: ${authUrl}\n`)
  console.log(`Waiting for callback on http://localhost:${PORT}/\n`)

  const open =
    process.platform === 'darwin' ? 'open' :
    process.platform === 'win32' ? 'start' : 'xdg-open'
  exec(`${open} "${authUrl}"`, () => {})
})
