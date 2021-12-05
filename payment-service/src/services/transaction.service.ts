import { Db } from 'mongodb'
import { logger } from '@utils/logger'
import { ActionHistory, TransactionAction, TransactionDto } from '@/dtos/transaction.dto'
import { PaymentMessage } from '@/interfaces/paymentMessage.interface'
import App from '@/app'

const TRANSACTION_COLLECTION = 'transactions'

class TransactionService {
    private db: Db
    constructor(app: App) {
        this.db = app.getDB()
    }
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

    private async createNewTransaction(msg: PaymentMessage): Promise<void> {
        if ((await this.db.collection<TransactionDto>(TRANSACTION_COLLECTION).count({ txId: msg.txId })) === 0) {
            const actionHistory: ActionHistory = { action: TransactionAction.NEW, note: msg.note, at: new Date() }
            const tran: Omit<TransactionDto, '_id'> = {
                txId: msg.txId,
                amount: msg.amount,
                action: msg.action,
                actionHistory: [actionHistory],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
            const result = await this.db.collection<TransactionDto>(TRANSACTION_COLLECTION).insertOne(tran)
            logger.info(`New Transaction Created, txId=${tran.txId}, insertedId=${result.insertedId.toHexString()}`)
            return
        }
        logger.warn(`New Action is already proceeded, txId=${msg.txId}`)
    }

    private async draftTransaction(msg: PaymentMessage): Promise<void> {
        await this.updateStatus(msg)
    }

    private async updateTransaction(msg: PaymentMessage): Promise<void> {
        await this.updateStatus(msg)
    }

    private async approveTransaction(msg: PaymentMessage): Promise<void> {
        await this.updateStatus(msg)
    }

    private async updateStatus(msg: PaymentMessage): Promise<void> {
        // find the transaction
        const tran = await this.db.collection<TransactionDto>(TRANSACTION_COLLECTION).findOne({ txId: msg.txId })
        if (!tran) {
            throw new Error(`transaction doesn't exist, txId=${msg.txId}`)
        }
        // update it
        const actionHistory: ActionHistory = { action: msg.action, note: msg.note, at: new Date() }
        const updateResult = await this.db.collection<TransactionDto>(TRANSACTION_COLLECTION).updateOne(
            { txId: msg.txId },
            {
                $set: {
                    action: msg.action,
                    amount: msg.amount,
                    updatedAt: new Date(),
                },
                $push: { actionHistory },
            },
        )
        logger.info(
            `${msg.action} - Transaction DONE - TxId=${msg.txId} - modified=${updateResult.modifiedCount === 1}`,
        )
    }
}

export default TransactionService
