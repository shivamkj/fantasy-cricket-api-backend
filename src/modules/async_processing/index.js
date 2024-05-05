import { fastify, ClientErr } from '../../utils/fastify.js'
import { PROD } from '../../utils/helper.js'
import { Queue, Worker } from 'bullmq'
import { endMatch, processBallUpdate, processLiveMatch, startMatch } from './live_match.js'
import { addCronJobs, processHourly } from './cron.js'
import { calculateAllPayouts } from './calculate_payouts.js'
import { calculateAllWins } from './calculate_wins.js'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { FastifyAdapter } from '@bull-board/fastify'
import { processAllPayout } from './process_payout.js'

export const tasks = {
  calculateWins: 'calculateWins',
  calculatePayout: 'calculatePayout',
  processPayout: 'processPayout',
  hourlyCron: 'hourlyCron', // hourly cron job for match listing, setting up team, squad & players, schedule async tasks
  processBallUpdate: 'processBallUpdate', // to process every ball and perform any side effects required
  processLiveMatch: 'processLiveMatch', // to monitor live match state and trigger async tasks
  startMatch: 'startMatch',
  endMatch: 'endMatch',
}

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}

const queueName = 'asyncQueue'

export const asyncQueue = new Queue(queueName, { connection })

await addCronJobs()

if (!PROD) await setupDashboard()

export const worker = new Worker(
  queueName,
  async ({ name, data }) => {
    if (!PROD) console.log('processing', name, data)

    switch (name) {
      case tasks.hourlyCron:
        await processHourly()
        break

      case tasks.processBallUpdate:
        await processBallUpdate(data)
        break

      case tasks.processLiveMatch:
        await processLiveMatch(data.matchId)
        break

      case tasks.startMatch:
        await startMatch(data)
        break

      case tasks.endMatch:
        await endMatch(data)
        break

      case tasks.calculateWins:
        await calculateAllWins(data)
        break

      case tasks.calculatePayout:
        await calculateAllPayouts(data)
        break

      case tasks.processPayout:
        await processAllPayout(data)
        break

      default:
        throw new Error('job has not been handeled to process')
    }
  },
  {
    connection,
  }
)

worker.on('failed', (job, err) => {
  console.error(`Job with Name:${job.name}, Id:${job.id} has failed with err`)
  console.error(err)
})

if (!PROD) {
  worker.on('completed', (job) => {
    console.log(`Job with Name:${job.name}, Id:${job.id} has completed!`)
  })
}

export async function processAsyncTasks(request, reply) {
  const taskName = request.query.taskName
  if (!taskName) throw new ClientErr('task name missing')

  switch (taskName) {
    case tasks.calculateWins:
    case tasks.calculatePayout:
    case tasks.processPayout:
    case tasks.hourlyCron:
    case tasks.processBallUpdate:
    case tasks.processLiveMatch:
    case tasks.startMatch:
    case tasks.endMatch:
      await asyncQueue.add(taskName, request.body)
      break

    default:
      throw new ClientErr('incorrect task name')
  }

  reply.send({ success: true })
}

async function setupDashboard() {
  const serverAdapter = new FastifyAdapter()

  createBullBoard({
    queues: [new BullMQAdapter(asyncQueue)],
    serverAdapter,
  })

  const path = '/internal/dashboard'
  serverAdapter.setBasePath(path)
  fastify.register(serverAdapter.registerPlugin(), { prefix: path })
}
