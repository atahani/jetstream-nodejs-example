import { NextFunction, Request, Response } from 'express'
import XPaymentProviderService from '@/services/xPaymentProvider.service'
import { TransactionDto } from '@/dtos/transaction.dto'

class WebhooksController {
    public xPaymentService = new XPaymentProviderService()

    public processXPaymentProviderCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const transaction: TransactionDto = req.body
            await this.xPaymentService.processIncomingWebhook(transaction)

            res.status(200).json({ message: 'success' })
        } catch (error) {
            next(error)
        }
    }
}

export default WebhooksController
