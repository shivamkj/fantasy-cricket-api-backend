-- Delete all Tables
-- DROP TABLE user_data, team, player, match, squad,
-- ball_by_ball_score, lobby, ticket, ticket_processed, bet;

-- Disable exposing OpenAPI Schema by Postgrest
-- ALTER ROLE authenticator SET pgrst.openapi_mode TO 'disabled';
-- NOTIFY pgrst, 'reload config';

CREATE TABLE user_data (
  id       UUID PRIMARY KEY,
  kyc_done BOOLEAN
);
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE TABLE team (
  id        SMALLINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1 INCREMENT BY 3),
  key       TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  code      TEXT,
  logo      TEXT
);
ALTER TABLE team ENABLE ROW LEVEL SECURITY;

CREATE TABLE player (
  id          INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 6),
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  jersey_name TEXT NOT NULL
);
ALTER TABLE player ENABLE ROW LEVEL SECURITY;

CREATE TABLE match (
  id         INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 7),
  key        TEXT UNIQUE NOT NULL,
  team1_id   SMALLINT NOT NULL REFERENCES team (id),
  team2_id   SMALLINT NOT NULL REFERENCES team (id),
  live       BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIMESTAMP NOT NULL,
  league     TEXT,
  selected   BOOLEAN NOT NULL DEFAULT FALSE,
  setup_done BOOLEAN DEFAULT FALSE
);
ALTER TABLE match ENABLE ROW LEVEL SECURITY;

CREATE TABLE squad (
  match_id  INTEGER NOT NULL REFERENCES match (id),
  team_id   SMALLINT NOT NULL REFERENCES team (id),
  player_id INTEGER NOT NULL REFERENCES player (id)
);
ALTER TABLE squad ENABLE ROW LEVEL SECURITY;

CREATE TABLE ball_by_ball_score (
  id           BIGINT PRIMARY KEY,
  match_id     INTEGER NOT NULL REFERENCES match (id),
  batter       INTEGER NOT NULL REFERENCES player (id),
  bowler       INTEGER NOT NULL REFERENCES player (id),
  ball         NUMERIC(4, 1) NOT NULL,
  team_id      SMALLINT NOT NULL,
  runs_off_bat SMALLINT,
  extra        SMALLINT,
  wide         SMALLINT,
  noball       SMALLINT,
  bye          SMALLINT,
  legbye       SMALLINT,
  penalty      SMALLINT,
  wicket       BOOLEAN,
  six          BOOLEAN,
  four         BOOLEAN,
  commentary   TEXT
);
ALTER TABLE ball_by_ball_score ENABLE ROW LEVEL SECURITY;

CREATE TYPE currency_types AS ENUM ('coin', 'token', 'money');

CREATE TABLE lobby (
  id            INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 5),
  title         TEXT NOT NULL,
  entry_price   SMALLINT NOT NULL,
  match_id      INTEGER NOT NULL REFERENCES match (id),
  currency_type CURRENCY_TYPES NOT NULL,
  bet_price     SMALLINT NOT NULL,
  commission    SMALLINT NOT NULL
);
ALTER TABLE lobby ENABLE ROW LEVEL SECURITY;

CREATE TYPE ticket_types AS ENUM ('batting', 'bowling', 'overall');

CREATE TABLE ticket (
  id             UUID PRIMARY KEY,
  match_id       INTEGER NOT NULL REFERENCES match (id),
  ball_range_id  INTEGER NOT NULL,
  team_id        INTEGER NOT NULL REFERENCES team (id),
  lobby_id       INTEGER NOT NULL REFERENCES lobby (id),
  user_id        UUID NOT NULL REFERENCES user_data (id),
  ticket_type    TICKET_TYPES NOT NULL,
  ticket_price   SMALLINT NOT NULL,
  bet_price      SMALLINT NOT NULL,
  total_bet      SMALLINT NOT NULL,
  bets_won       SMALLINT,
  payout         SMALLINT,
  transaction_id TEXT
);
ALTER TABLE ticket ENABLE ROW LEVEL SECURITY;

CREATE TABLE ticket_processed (
  match_id          INTEGER NOT NULL REFERENCES match (id),
  ball_range_id     INTEGER NOT NULL,
  team_id           INTEGER NOT NULL REFERENCES team (id),
  -- processed will be null when match hasn't started, will be set to false along with live
  -- and set to true when ended is true & all tickets for this matchid is processed.
  wins_calculated   BOOLEAN NOT NULL DEFAULT FALSE,
  payout_calculated BOOLEAN,
  payout_processed  BOOLEAN,
  PRIMARY KEY (match_id, ball_range_id, team_id)
);
ALTER TABLE ticket_processed ENABLE ROW LEVEL SECURITY;

CREATE TYPE bet_type AS ENUM (
  'batterRun', 'runRate', 'bowlerRun', 'wicket', 'economy', 'teamRun', 'boundaries', 'batterWicket'
);

CREATE TABLE bet (
  ticket_id UUID NOT NULL REFERENCES ticket (id),
  range_id  SMALLINT NOT NULL, -- For storing runs, wickets, etc. bet by user
  bet_type  BET_TYPE,
  player_id INTEGER
);
ALTER TABLE bet ENABLE ROW LEVEL SECURITY;

CREATE TABLE bet_slot (
  match_id     INTEGER PRIMARY KEY REFERENCES match (id),
  batting_team SMALLINT REFERENCES team (id),
  bowling_team SMALLINT REFERENCES team (id),
  slot_range   SMALLINT
);
ALTER TABLE bet_slot ENABLE ROW LEVEL SECURITY;
