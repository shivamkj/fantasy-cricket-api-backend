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
  betType.batterRun,
  betType.runRate,
  betType.bowlerRun,
  betType.wicket,
  betType.economy,
  betType.teamRun,
  betType.boundaries,
  betType.batterWicket,
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

export const ballRanges = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

export const getBallRange = (rangeId) => {
  const endRange = rangeId - 1 + 0.6
  return [parseFloat((endRange - 4.5).toFixed(2)), endRange]
}

export const batterRunBets = {
  5: { start: 0, end: 5 },
  10: { start: 6, end: 10 },
  15: { start: 11, end: 15 },
  20: { start: 16, end: 20 },
  25: { start: 21, end: 25 },
  30: { start: 26, end: 30 },
  35: { start: 31, end: 35 },
  40: { start: 36, end: 40 },
  45: { start: 41, end: 45 },
  50: { start: 46, end: 50 },
  55: { start: 51, end: 55 },
  60: { start: 56, end: 60 },
}

export const runRateBets = {
  1: { start: 0, end: 1 },
  2: { start: 1.1, end: 2 },
  3: { start: 2.1, end: 3 },
  4: { start: 3.1, end: 4 },
  5: { start: 4.1, end: 5 },
  6: { start: 5.1, end: 6 },
  7: { start: 6.1, end: 7 },
  8: { start: 7.1, end: 8 },
  9: { start: 8.1, end: 9 },
  10: { start: 9.1, end: 10 },
  11: { start: 10.1, end: 11 },
  12: { start: 11.1, end: 12 },
}

export const bowlerRunBets = {
  5: { start: 0, end: 5 },
  10: { start: 6, end: 10 },
  15: { start: 11, end: 15 },
  20: { start: 16, end: 20 },
  25: { start: 21, end: 25 },
  30: { start: 26, end: 30 },
  35: { start: 31, end: 35 },
  40: { start: 36, end: 40 },
  45: { start: 41, end: 45 },
  50: { start: 46, end: 50 },
  55: { start: 51, end: 55 },
  60: { start: 56, end: 60 },
}

export const wickets = {
  0: { value: 0 },
  1: { value: 1 },
  2: { value: 2 },
  3: { value: 3 },
  4: { value: 4 },
}

export const economyBets = {
  1: { start: 0, end: 1 },
  2: { start: 1.1, end: 2 },
  3: { start: 2.1, end: 3 },
  4: { start: 3.1, end: 4 },
  5: { start: 4.1, end: 5 },
  6: { start: 5.1, end: 6 },
  7: { start: 6.1, end: 7 },
  8: { start: 7.1, end: 8 },
  9: { start: 8.1, end: 9 },
  10: { start: 9.1, end: 10 },
  11: { start: 10.1, end: 11 },
  12: { start: 11.1, end: 12 },
}

export const teamRunBets = {
  5: { start: 0, end: 5 },
  10: { start: 6, end: 10 },
  15: { start: 11, end: 15 },
  20: { start: 16, end: 20 },
  25: { start: 21, end: 25 },
  30: { start: 26, end: 30 },
  35: { start: 31, end: 35 },
  40: { start: 36, end: 40 },
  45: { start: 41, end: 45 },
  50: { start: 46, end: 50 },
  55: { start: 51, end: 55 },
  60: { start: 56, end: 60 },
}

export const boundariesBets = {
  1: { start: 0, end: 3 },
  2: { start: 4, end: 6 },
  3: { start: 7, end: 9 },
  4: { start: 10, end: 12 },
  5: { start: 13, end: 15 },
  6: { start: 16, end: 18 },
  7: { start: 19, end: 21 },
  8: { start: 22, end: 24 },
  9: { start: 25, end: 27 },
  10: { start: 28, end: 30 },
  11: { start: 31, end: 33 },
  12: { start: 34, end: 36 },
}
