import { cleanEnv, port, str, url } from 'envalid'

const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        PORT: port(),
        NATS_URI: url(),
        MONGO_URI: str(),
    })
}

export default validateEnv
