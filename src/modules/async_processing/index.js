import { PROD } from '../../utils/helper.js'
import { pool } from '../../utils/postgres.js'
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
        id: `${row.match_id}-${row.ball_range_id}-${row.team_id}-${taskType.wins}`,
        data: {
          matchId: row.match_id,
          ballRangeId: row.ball_range_id,
          teamId: row.team_id,
        },
      })
    }

    if (row.payout_processed === false) {
      tasks.push({
        id: `${row.match_id}-${row.ball_range_id}-${row.team_id}-${taskType.payout}`,
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

export async function processAsyncTasks(request, reply) {
  const allTasks = await pendingTasks()
  if (!PROD) console.log('pending tasks', allTasks)

  for (const task of allTasks) {
    if (task.id.endsWith(taskType.wins)) {
      await processAllWins(task)
    } else if (task.id.endsWith(taskType.payout)) {
      await processAllPayouts(task)
    }
  }

  reply.send({ success: true })
}
