require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider

// Setup
lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
   await lti.registerPlatform({
    url: 'https://dev.learningwithsoul.com/campus',
    name: 'Platform',
    clientId: '1MNJpYZO2jGlf98',
    authenticationEndpoint: 'https://dev.learningwithsoul.com/campus/mod/lti/auth.php',
    accesstokenEndpoint: 'https://dev.learningwithsoul.com/campus/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'https://dev.learningwithsoul.com/campus/mod/lti/certs.php' }
  }) 
}

setup()
