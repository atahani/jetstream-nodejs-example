process.env['NODE_CONFIG_DIR'] = __dirname + '/configs'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from 'config'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import morgan from 'morgan'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { connect, NatsConnection } from 'nats'
import { Routes } from '@interfaces/routes.interface'
import errorMiddleware from '@middlewares/error.middleware'
import { logger, stream } from '@utils/logger'
import { delay } from 'nats/lib/nats-base-client/util'
import PaymentConsumer from './consumers/payment.consumer'

class App {
    public app: express.Application
    public port: string | number
    public env: string
    public natsUri: string
    public nats: NatsConnection

    constructor(routes: Routes[]) {
        this.app = express()
        this.port = process.env.PORT || 3000
        this.env = process.env.NODE_ENV || 'development'
        this.natsUri = process.env.NATS_URI || 'localhost:4222'

        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeSwagger()
        this.initializeErrorHandling()
    }

    public async listen() {
        this.app.listen(this.port, () => {
            logger.info(`=================================`)
            logger.info(`======= ENV: ${this.env} =======`)
            logger.info(`🚀 Payment Service listening on the port ${this.port}`)
            logger.info(`=================================`)
        })
        await this.connectNATS()
    }

    public async connectNATS() {
        try {
            this.nats = await connect({ servers: this.natsUri })
            logger.info(`successfully connected to NATS server ${this.natsUri}`)
            await this.initialSubscribers()
            // wait and watch if connection closed
            const err = await this.nats?.closed()
            if (err) {
                logger.error(`NATS server connection closed, err=${err.message}, retry to connect after 2 sec ...`, {
                    err,
                })
                await delay(2 * 1000)
                await this.connectNATS()
            }
            return
        } catch (err) {
            logger.error("can't connect to NATS server, Please check the NATS server is running, retry after 2 sec", {
                err,
            })
            await delay(2 * 1000)
            await this.connectNATS()
        }
    }

    public getServer() {
        return this.app
    }

    public getNATSConnection(): NatsConnection {
        return this.nats
    }

    private async initialSubscribers() {
        await new PaymentConsumer(this.nats).start()
    }

    private initializeMiddlewares() {
        this.app.use(morgan(config.get('log.format'), { stream }))
        this.app.use(cors({ origin: config.get('cors.origin'), credentials: config.get('cors.credentials') }))
        this.app.use(hpp())
        this.app.use(helmet())
        this.app.use(compression())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cookieParser())
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router)
        })
    }

    private initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs',
                },
            },
            apis: ['swagger.yaml'],
        }

        const specs = swaggerJSDoc(options)
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }
}

export default App
