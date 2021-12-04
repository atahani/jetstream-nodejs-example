import { NextFunction, Request, Response } from 'express'
import { TransactionDto } from '@/dtos/transaction.dto'
import NatsService from '@/services/nats.service'

class WebhooksController {
    public processXPaymentProviderCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const nService = new NatsService(req.nats)
            const tran: TransactionDto = req.body
            // the duplication mechanism is based on msgID, so this should be unique per action + transaction
            const msgID = `${tran.txId}_${tran.action}`
            const subject = `payments.${tran.action.toLowerCase()}`
            await nService.publishMessage<TransactionDto>(subject, msgID, tran)
            res.status(200).json({ message: 'success' })
        } catch (error) {
            next(error)
        }
    }
}

export default WebhooksController
