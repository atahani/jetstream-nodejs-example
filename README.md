# Use NATS JetStream to Sync Transaction Between two Services

## Introduction

Syncing between the state of critical resources like transactions always be challenging. By using [NATS JetStream](https://docs.nats.io/nats-concepts/jetstream) we achieve these criteria:

- Replay the messages at the rate they were received; this feature doesn't bombard target consumers after service outages. [more info](https://docs.nats.io/nats-concepts/jetstream/consumers#replaypolicy)
- Don't publish duplicate messages based on the `Nats-Msg-Id` header, for example on transactions messages we assumed `txId.action` as unique ID for that transaction, you can also customize duplicate window time. [more info](https://docs.nats.io/nats-concepts/jetstream/streams)
- Reply the message if failed and have complete management on acknowledgment and deliver.

## Diagram

![Diagram](./diagram.jpg?raw=true)


## How to run it?

### Run NATS on JetStream Mode

1. [Install the NATS server](https://docs.nats.io/running-a-nats-service/introduction/installation)
2. Run NATS server on JetStream Mode. [more info](https://docs.nats.io/nats-concepts/jetstream/js_walkthrough#prerequisite-enabling-jetstream)

```
nats-server -js
```

### Create Payment Stream

nats has interactive CLI for creating a new stream (`nats stream add payment`)
if you don't know what to do you can run it by these flags

```
nats stream add --subjects="payments.*" --ack --retention=work --storage=file --replicas=1 --discard=old --dupe-window="10m" --max-age="2h" --max-msgs=-1 --max-msgs-per-subject=-1 --max-bytes=-1 --max-msg-size=-1 --no-allow-rollup --no-deny-delete --no-deny-purge payment
```

> the codebase is configured with `payments.*` subject and `payment` stream durable name

### Create Payment Consumer

like stream, adding consumer has interactive CLI, (`nats consumer add payment payment-consumer`)
if you don't know what to do you can run it by these flags

```
nats consumer add --pull --deliver=all --replay=original --filter="payments.*" --max-deliver=1 --max-pending=20000 --no-headers-only payment payment-consumer
```

> the codebase is configured with `payment-consumer` consumer name

### Clone Project

```
git clone git@github.com:atahani/jetstream-nodejs-example.git
```

### For Third Party Gateway

1. install dependencies

```
cd jetstream-nodejs-example/third-party-gateway/
npm i
```

2. copy `.env_sample` into `.env` file, change the ENV if you need

3. run the app on dev mode

```
npm run dev
```

### Provide MongoDB DB

1. run MongoDB server on your local machine
2. create `nats_demo` database with `transactions` collection

the MongoDB connection would be like this

```
mongodb://localhost:27017/nats_demo
```

### For Payment Service

1. install dependencies

```
cd jetstream-nodejs-example/payment-service/
npm i
```

2. copy `.env_sample` into `.env` file, change the ENV if you need

3. run the app on dev mode

```
npm run dev
```

> the projects are based on [typescript-express-starter](https://github.com/ljlm0402/typescript-express-starter)

## How to Test It?

Send a POST request to `http://localhost:3000/webhooks/x-payment` endpoint.

```
curl --location --request POST 'http://localhost:3000/webhooks/x-payment' \
--header 'Content-Type: application/json' \
--data-raw '{
    "txId": "41450da7-46ac-438f-9f72-7e2ab6be5d87",
    "action": "NEW",
    "amount": 100,
    "note": "transaction created"
}'
```