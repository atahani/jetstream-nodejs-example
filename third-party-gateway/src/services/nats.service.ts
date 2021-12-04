import { HttpException } from '@/exceptions/HttpException'
import { NatsConnection, JetStreamClient, JSONCodec } from 'nats'
import { logger } from '@utils/logger'
import { PublishMessageResult } from '@/interfaces/message.interface'

class NatsService {
    private jsClient: JetStreamClient
    constructor(nc: NatsConnection) {
        this.jsClient = nc.jetstream()
    }

    public async publishMessage<T>(subject: string, msgID: string, payload: T): Promise<PublishMessageResult> {
        try {
            const { duplicate } = await this.jsClient.publish(subject, JSONCodec().encode(payload), {
                msgID: msgID.toLowerCase(),
            })
            logger.info(`msgID=${msgID} successfully queued, duplicate=${duplicate}`)
            return { isDuplicate: duplicate }
        } catch (err) {
            logger.error("couldn't publish to NATS JetStream", { error: err.message })
            throw new HttpException(503, 'the service is not ready to process the message')
        }
    }
}

export default NatsService
