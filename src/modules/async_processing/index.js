import { ClientErr } from '../../utils/fastify.js'
import { PROD } from '../../utils/helper.js'
import { fetchMatches } from '../cricket_api/fetch_matches.js'
import { Queue, Worker } from 'bullmq'
import { listenMatchUpdate, processBallUpdate, setupLiveMatch } from './tasks.js'

export const tasks = {
  calculatePayout: 'calculatePayout',
  calculateWins: 'calculateWins',
  processTicket: 'processTicket',
  fetchMatches: 'fetchMatches', // ✅ Working
  listenBallUpdate: 'listenBallUpdate',
  processBallUpdate: 'processBallUpdate',
  setupLiveMatch: 'setupLiveMatch',
}

const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}

const queueName = 'asyncQueue'

export const asyncQueue = new Queue(queueName, { connection })

const worker = new Worker(
  queueName,
  async ({ name, data }) => {
    if (!PROD) console.log('processing', name, data)

    switch (name) {
      case tasks.fetchMatches:
        await fetchMatches()
        break

      case tasks.processBallUpdate:
        await processBallUpdate(data.matchId)
        break

      case tasks.listenBallUpdate:
        await listenMatchUpdate(data.matchId)
        break

      case tasks.setupLiveMatch:
        await setupLiveMatch(data.matchId)
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
    case tasks.processTicket:
    case tasks.fetchMatches:
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
