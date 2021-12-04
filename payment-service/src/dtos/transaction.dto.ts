import { IsUUID, IsEnum, IsInt, IsString } from 'class-validator'

export enum TransactionAction {
    NEW = 'NEW',
    DRAFT = 'DRAFT',
    UPDATE = 'UPDATE',
    APPROVED = 'APPROVED',
}

export class TransactionDto {
    @IsUUID()
    public txId: string

    @IsEnum(TransactionAction)
    public action: TransactionAction

    @IsInt()
    public amount: number

    @IsString()
    public note: string
}
