import { NatsConnection, JetStreamClient, JSONCodec } from 'nats'
import { logger } from '@utils/logger'
import TransactionService from '@/services/transaction.service'
import { PaymentMessage } from '@/interfaces/paymentMessage.interface'

class PaymentConsumer {
    private jsClient: JetStreamClient
    private transactionService: TransactionService
    constructor(nc: NatsConnection) {
        this.jsClient = nc.jetstream()
        this.transactionService = new TransactionService()
    }

    public async start(): Promise<void> {
        try {
            const sub = await this.jsClient.pullSubscribe('payments.*', {
                stream: 'payment',
                config: { durable_name: 'payment-consumer' },
            })
            ;(async () => {
                // start pulling
                sub.pull()
                for await (const m of sub) {
                    const payload = JSONCodec<PaymentMessage>().decode(m.data)
                    await this.transactionService.ProcessTransaction(payload).catch((err) => {
                        logger.error(`can't process transaction err=${err.message}, send nak to replay`, { error: err })
                        // nak to replay later
                        m.nak()
                    })
                    // pull the next message
                    sub.pull()
                }
                logger.info(`subscription closed Received=${sub.getReceived()} Processed=${sub.getProcessed()}`)
            })()
        } catch (err) {
            logger.error(`can't subscribe to payment.new subject err=${err.message}`)
        }
    }
}

export default PaymentConsumer
