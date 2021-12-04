import { Router } from 'express'
import { Routes } from '@interfaces/routes.interface'
import validationMiddleware from '@middlewares/validation.middleware'
import WebhooksController from '@/controllers/webhooks.controller'
import { TransactionDto } from '@/dtos/transaction.dto'

class WebhookRoute implements Routes {
    public path = '/webhooks'
    public router = Router()
    private wbController = new WebhooksController()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/x-payment`,
            validationMiddleware(TransactionDto, 'body'),
            this.wbController.processXPaymentProviderCallback,
        )
    }
}

export default WebhookRoute
