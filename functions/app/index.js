/* Express App */
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import compression from 'compression'
import customLogger from '../utils/logger'
import axios from 'axios'

/* My express App */
export default function expressApp(functionName) {
  const app = express()
  const router = express.Router()

  // gzip responses
  router.use(compression())

  // Set router base path for local dev
  const routerBasePath = process.env.NODE_ENV === 'dev' ? `/${functionName}` : `/.netlify/functions/${functionName}/`

  /* define routes */
  router.get('/', (req, res) => {
    const html = `
    <html>
      <head>
        <style>
          body {
            padding: 30px;
          }
        </style>
      </head>
      <body>
        <h1>Express via '${functionName}' ⊂◉‿◉つ</h1>

        <p>I'm using Express running via a <a href='https://www.netlify.com/docs/functions/' target='_blank'>Netlify Function</a>.</p>

        <p>Choose a route:</p>

        <div>
          <a href='/.netlify/functions/${functionName}/maps'>View /maps route</a>
        </div>

        <br/>
        <br/>

        <div>
          <a href='/'>
            Go back to demo homepage
          </a>
        </div>

        <br/>
        <br/>

        <div>
          <a href='https://github.com/DavidWells/netlify-functions-express' target='_blank'>
            See the source code on github
          </a>
        </div>
      </body>
    </html>
  `
    res.send(html)
  })

  router.get('/users', (req, res) => {
    res.json({
      users: [
        {
          name: 'steve',
        },
        {
          name: 'joe',
        },
      ],
    })
  })

  router.get('/maps/', async function(req, res) {
    const place_id = req.params.place_id;
    const apiKey = req.params.key;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;

    try {
      const resp = await axios.get(apiUrl)
      if (resp.status === 200) {
        res.json(resp.data);
      } else throw resp
    } catch (error) {
      res.status(500).send('An error occurred while fetching data from the Google Maps API');
    }
  });

  // app.get('/maps/photo/:maxwidth/:photoreference', (req, res) => {
  //   const photoreference = req.params.photoreference;
  //   const maxwidth = req.params.maxwidth;
  //   const apiUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoreference}&maxwidth=${maxwidth}&key=${apiKey}`;

  //   axios.get(apiUrl, { responseType: 'arraybuffer' })
  //     .then((response) => {
  //       res.set('Content-Type', 'image/jpeg');
  //       res.send(Buffer.from(response.data, 'binary'));
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       res.status(500).send('An error occurred while fetching data from the Google Maps API');
  //     });
  // });

  // Attach logger
  app.use(morgan(customLogger))

  // Setup routes
  app.use(routerBasePath, router)

  // Apply express middlewares
  router.use(cors())
  router.use(bodyParser.json())
  router.use(bodyParser.urlencoded({ extended: true }))

  return app
}
