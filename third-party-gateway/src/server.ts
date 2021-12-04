process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'dotenv/config'
import App from '@/app'
import IndexRoute from '@routes/index.route'
import validateEnv from '@utils/validateEnv'
import WebhookRoute from './routes/webhooks.route'

validateEnv()

const app = new App([new IndexRoute(), new WebhookRoute()])

app.listen()
