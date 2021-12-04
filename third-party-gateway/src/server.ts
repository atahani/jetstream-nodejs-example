process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import 'dotenv/config'
import App from '@/app'
import IndexRoute from '@routes/index.route'
import validateEnv from '@utils/validateEnv'
import WebhookRoute from './routes/webhooks.route'
import { logger } from '@utils/logger'
import { exec } from 'child_process'

const killProcesses = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']

;(async () => {
    validateEnv()
    const app = new App([new IndexRoute(), new WebhookRoute()])
    app.listen()
    // handle application exist
    killProcesses.forEach((eventType) => {
        process.on(eventType, async (err) => {
            if (eventType == 'uncaughtException') {
                logger.error(`${eventType} event closed the application process, ${err.message}`, { err })
            }
            const nats = app.getNATSConnection()
            if (nats) {
                await nats.close()
                logger.info('NATS stream connection closed')
            }
            // sometimes during development process.exist is not enough, kill the port is better ;)
            exec(`npx kill-port ${app.port}`)
        })
    })
})()
