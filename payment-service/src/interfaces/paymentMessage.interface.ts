import { TransactionAction } from '@dtos/transaction.dto'

export interface PaymentMessage {
    txId: string
    action: TransactionAction
    amount: number
    note: string
}
