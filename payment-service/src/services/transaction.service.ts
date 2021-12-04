import { logger } from '@utils/logger'
import { TransactionAction, TransactionDto } from '@/dtos/transaction.dto'
import { PaymentMessage } from '@/interfaces/paymentMessage.interface'

class TransactionService {
    public async ProcessTransaction(tran: PaymentMessage): Promise<void> {
        switch (tran.action) {
            case TransactionAction.NEW:
                await this.createNewTransaction(tran)
                break
            case TransactionAction.DRAFT:
                await this.draftTransaction(tran)
                break
            case TransactionAction.UPDATE:
                await this.updateTransaction(tran)
                break
            case TransactionAction.APPROVED:
                await this.approveTransaction(tran)
                break
            default:
                logger.warn(`transaction action is not valid, action=${tran.action} txId=${tran.txId}`)
                break
        }
    }

    private async createNewTransaction(tran: TransactionDto): Promise<void> {
        logger.info(`New Transaction Created, txId=${tran.txId}`)
    }

    private async draftTransaction(tran: TransactionDto): Promise<void> {
        logger.info(`Transaction Drafted, txId=${tran.txId}`)
    }

    private async updateTransaction(tran: TransactionDto): Promise<void> {
        logger.info(`Transaction Updated, txId=${tran.txId}`)
    }

    private async approveTransaction(tran: TransactionDto): Promise<void> {
        logger.info(`Transaction Updated, txId=${tran.txId}`)
    }
}

export default TransactionService
