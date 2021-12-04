import { TransactionDto } from '@/dtos/transaction.dto'
import { HttpException } from '@exceptions/HttpException'

class XPaymentProviderService {
    public async processIncomingWebhook(transaction: TransactionDto): Promise<void> {
        console.log('should publish it into nats', transaction)
        return
    }
}

export default XPaymentProviderService
