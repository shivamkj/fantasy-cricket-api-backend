import { ClientErr } from '../../utils/fastify.js'
import { PROD } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
import { fetchMatches } from '../cricket_api/fetch_matches.js'
import { matchSocket } from '../cricket_api/realtime.js'
import { processAllPayouts } from './calculate_payouts.js'
import { processAllWins } from './calculate_wins.js'

const taskType = {
  payout: 'payout',
  wins: 'wins',
}

export const pendingTasks = async () => {
  const { rows: allRows } = await pool.query('SELECT * FROM ticket_processed;')

  const tasks = []
  for (const row of allRows) {
    if (row.wins_processed === false) {
      tasks.push({
        id: `${row.match_id},${row.ball_range_id},${row.team_id},${taskType.wins}`,
        data: {
          matchId: row.match_id,
          ballRangeId: row.ball_range_id,
          teamId: row.team_id,
        },
      })
    }

    if (row.payout_processed === false) {
      tasks.push({
        id: `${row.match_id},${row.ball_range_id},${row.team_id},${taskType.payout}`,
        data: {
          matchId: row.match_id,
          ballRangeId: row.ball_range_id,
          teamId: row.team_id,
        },
      })
    }
  }

  return tasks
}

export const processTickets = async () => {
  const allTasks = await pendingTasks()
  if (!PROD) console.log('pending tasks', allTasks)

  for (const task of allTasks) {
    if (task.id.endsWith(taskType.wins)) {
      await processAllWins(task)
    } else if (task.id.endsWith(taskType.payout)) {
      await processAllPayouts(task)
    }
  }
}

export async function processAsyncTasks(request, reply) {
  const taskName = request.query.taskName
  if (!taskName) throw new ClientErr('task name missing')

  switch (taskName) {
    case 'processTicket':
      await processTickets()
      break

    case 'fetchMatch':
      await fetchMatches()
      break

    case 'listenMatch':
      await matchSocket.listen(request.query.matchKey)
      break

    case 'listenMatchTest':
      console.log(matchSocket._socket.connected)
      break

    default:
      throw new ClientErr('incorrect task name')
  }

  reply.send({ success: true })
}
