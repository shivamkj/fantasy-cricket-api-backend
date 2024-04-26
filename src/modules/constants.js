export const betType = {
  batterRun: 'batterRun',
  runRate: 'runRate',
  bowlerRun: 'bowlerRun',
  wicket: 'wicket',
  economy: 'economy',
  teamRun: 'teamRun',
  boundaries: 'boundaries',
  batterWicket: 'batterWicket',
}
export const betTypeArr = [
  betType.batterRun, // 0
  betType.runRate, // 1
  betType.bowlerRun, // 2
  betType.wicket, // 3
  betType.economy, // 4
  betType.teamRun, // 5
  betType.boundaries, // 6
  betType.batterWicket, // 7
]

export const ticketTypes = {
  batting: 'batting',
  bowling: 'bowling',
  overall: 'overall',
}
export const ticketTypeArr = [ticketTypes.batting, ticketTypes.bowling, ticketTypes.overall]

export const currencyType = {
  coin: 'coin',
  token: 'token',
  money: 'money',
}
export const currencyTypeArr = [currencyType.coin, currencyType.token, currencyType.money]

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
