import { NextFunction, Request, Response } from 'express'
import App from '@/app'

const NATSMiddleware = (app: App) => (req: Request, res: Response, next: NextFunction) => {
    try {
        req.nats = app.getNATSConnection()
        next()
    } catch (error) {
        next(error)
    }
}

export default NATSMiddleware
