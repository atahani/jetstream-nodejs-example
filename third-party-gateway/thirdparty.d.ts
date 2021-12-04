import { NatsConnection } from 'nats'

declare global {
    namespace Express {
        interface Request {
            nats: NatsConnection
        }
    }
}