import { fastify, ClientErr } from '../../utils/fastify.js'
import { PROD } from '../../utils/helper.js'
import { fetchMatches } from '../cricket_api/fetch_matches.js'
import { Queue, Worker } from 'bullmq'
import { listenMatchUpdate, processBallUpdate, processLiveMatch } from './live_match.js'
import { setupLiveMatch } from './match.js'
import { addCronJobs, processHourly } from './cron.js'
import { calculateAllPayouts } from './calculate_payouts.js'
import { calculateAllWins } from './calculate_wins.js'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { FastifyAdapter } from '@bull-board/fastify'

export const tasks = {
  calculatePayout: 'calculatePayout',
  calculateWins: 'calculateWins',
  processPayout: 'processPayout',
  processTicket: 'processTicket',
  fetchMatches: 'fetchMatches',
  listenBallUpdate: 'listenBallUpdate',
  hourlyCron: 'hourlyCron',
  processBallUpdate: 'processBallUpdate',
  processLiveMatch: 'processLiveMatch',
  setupLiveMatch: 'setupLiveMatch',
}

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}

const queueName = 'asyncQueue'

export const asyncQueue = new Queue(queueName, { connection })

await addCronJobs()

const worker = new Worker(
  queueName,
  async ({ name, data }) => {
    if (!PROD) console.log('processing', name, data)

    switch (name) {
      case tasks.fetchMatches:
        await fetchMatches()
        break

      case tasks.processBallUpdate:
        await processBallUpdate(data)
        break

      case tasks.listenBallUpdate:
        await listenMatchUpdate(data.matchId)
        break

      case tasks.setupLiveMatch:
        await setupLiveMatch(data.matchId)
        break

      case tasks.hourlyCron:
        await processHourly()
        break

      case tasks.processLiveMatch:
        await processLiveMatch(data.matchId)
        break

      case tasks.calculateWins:
        await calculateAllWins(data)
        break

      case tasks.calculatePayout:
        await calculateAllPayouts(data)
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

await setupDashboard()

export async function processAsyncTasks(request, reply) {
  const taskName = request.query.taskName
  if (!taskName) throw new ClientErr('task name missing')

  switch (taskName) {
    case tasks.processTicket:
    case tasks.fetchMatches:
    case tasks.hourlyCron:
      await asyncQueue.add(taskName)
      break

    case tasks.processBallUpdate:
    case tasks.listenBallUpdate:
    case tasks.setupLiveMatch:
      await asyncQueue.add(taskName, request.body)
      break

    default:
      throw new ClientErr('incorrect task name')
  }

  reply.send({ success: true })
}
