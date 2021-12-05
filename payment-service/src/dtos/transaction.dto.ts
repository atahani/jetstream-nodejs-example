import { IsUUID, IsEnum, IsInt, IsString } from 'class-validator'
import { ObjectId } from 'mongodb'

export enum TransactionAction {
    NEW = 'NEW',
    DRAFT = 'DRAFT',
    UPDATE = 'UPDATE',
    APPROVED = 'APPROVED',
}

export class ActionHistory {
    @IsString()
    public note: string

    @IsEnum(TransactionAction)
    public action: TransactionAction

    public at: Date
}

export class TransactionDto {
    public _id: ObjectId

    @IsUUID()
    public txId: string

    @IsEnum(TransactionAction)
    public action: TransactionAction

    @IsInt()
    public amount: number

    public actionHistory: ActionHistory[]

    public createdAt: Date

    public updatedAt: Date
}
