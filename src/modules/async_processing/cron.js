import { pool } from '../../utils/postgres.js'
import { createMatches } from '../cricket_api/create_matches.js'
import { asyncQueue, tasks } from './index.js'
import { setupLiveMatch } from './match.js'

const CHECK_WITHIN = 5 * 60 * 60 * 1000 // 5 hour

export const liveRepeatCheck = '*/1 * * * *'

export async function processHourly() {
  // 1. Fetch upcoming matches and add them to DB
  await createMatches()

  // 2. Check if any match will start in next few hours, if yes, then schedule a Repeatable job
  // (repeats every 1 minutes) with half an hour delay before match start time for each match
  const { rows: allMatches } = await pool.query(
    'SELECT id, start_time FROM match WHERE live = FALSE AND selected = TRUE AND ended = FALSE;'
  )

  const now = new Date()
  const fiveHoursLater = new Date(now.getTime() + CHECK_WITHIN)

  const upcomingMatches = allMatches.filter(({ start_time }) => start_time <= fiveHoursLater)

  for (const match of upcomingMatches) {
    await setupLiveMatch(match.id)
    const listenFrom = new Date(match.start_time.getTime())
    listenFrom.setMinutes(listenFrom.getMinutes() - 60)
    asyncQueue.add(
      tasks.processLiveMatch,
      { matchId: match.id },
      {
        jobId: `${tasks.processLiveMatch}-${match.id}`,
        repeatJobKey: `${tasks.processLiveMatch}-${match.id}`,
        repeat: { pattern: liveRepeatCheck, startDate: listenFrom },
      }
    )
  }
}

export async function addCronJobs() {
  await asyncQueue.add(tasks.hourlyCron, null, {
    jobId: tasks.hourlyCron,
    repeatJobKey: tasks.hourlyCron,
    repeat: { pattern: '*/30 * * * *' },
  })
}
