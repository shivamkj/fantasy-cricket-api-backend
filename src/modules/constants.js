export const betType = Object.freeze({
  batterRun: 'batterRun',
  runRate: 'runRate',
  bowlerRun: 'bowlerRun',
  wicket: 'wicket',
  economy: 'economy',
  teamRun: 'teamRun',
  boundaries: 'boundaries',
  batterWicket: 'batterWicket',
})
export const betValues = Object.values(betType)

export const ticketType = Object.freeze({
  batting: 'batting',
  bowling: 'bowling',
  overall: 'overall',
})
export const ticketValues = Object.values(ticketType)

export const currencyType = Object.freeze({
  coin: 'coin',
  token: 'token',
  money: 'money',
})

export const getBallRange = (rangeId) => {
  const endRange = rangeId - 1 + 0.6
  return [parseFloat((endRange - 4.5).toFixed(2)), endRange]
}

export const betValToRangeId = (type, value) => {
  switch (type) {
    case betType.batterRun:
    case betType.bowlerRun:
    case betType.teamRun:
      return Math.ceil(value / 5) * 5
    case betType.runRate:
    case betType.economy:
      return Math.ceil(value)
    case betType.wicket:
    case betType.batterWicket:
      return value
    case betType.boundaries:
      return Math.ceil(value / 3) * 3
    default:
      throw new Error('invalid type')
  }
}
