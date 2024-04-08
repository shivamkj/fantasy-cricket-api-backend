CREATE TABLE customer (
  id       INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 100000 INCREMENT BY 3),
  user_id  UUID,
  kyc_done BOOLEAN
);

CREATE TABLE team (
  id        SMALLINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1 INCREMENT BY 3),
  team_name TEXT NOT NULL,
  logo      TEXT
);

CREATE TABLE player (
  id         INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 6),
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL
);

CREATE TABLE match (
  id         INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 7),
  team1_id   SMALLINT NOT NULL REFERENCES team (id),
  team2_id   SMALLINT NOT NULL REFERENCES team (id),
  live       BOOLEAN NOT NULL DEFAULT FALSE,
  start_time TIMESTAMP NOT NULL,
  league     TEXT,
  crr        NUMERIC(4, 2),
  -- team 1 score
  t1_run     SMALLINT,
  t1_over    SMALLINT,
  t1_wicket  SMALLINT,
  -- team 2 score
  t2_run     SMALLINT,
  t2_over    SMALLINT,
  t2_wicket  SMALLINT
);

CREATE TABLE last_6_ball (
  match_id     SMALLINT REFERENCES match (id),
  sequence_num SMALLINT GENERATED BY DEFAULT AS IDENTITY (START WITH 1 INCREMENT BY 1),
  runs         SMALLINT,
  wicket       BOOLEAN,
  PRIMARY KEY (match_id, sequence_num)
);

CREATE TABLE score_card (
  match_id    INTEGER NOT NULL REFERENCES match (id),
  player_id   INTEGER NOT NULL REFERENCES player (id),
  run         SMALLINT NOT NULL,
  ball        SMALLINT NOT NULL,
  four        SMALLINT NOT NULL,
  six         SMALLINT NOT NULL,
  strike_rate NUMERIC(5, 2) NOT NULL,
  status_text TEXT,
  is_playing  BOOLEAN,
  PRIMARY KEY (match_id, player_id)
);

CREATE TABLE lobby (
  id            INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 5),
  title         TEXT NOT NULL,
  price         SMALLINT NOT NULL,
  match_id      INTEGER NOT NULL REFERENCES match (id),
  playing_count INTEGER DEFAULT 0
);

CREATE TABLE ticket (
  id             BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 3),
  match_id       SMALLINT NOT NULL REFERENCES match (id),
  user_id        SMALLINT NOT NULL REFERENCES customer (id),
  ticket_type    SMALLINT NOT NULL REFERENCES customer (id),
  title          TEXT NOT NULL,
  price          SMALLINT NOT NULL,
  transaction_id TEXT,
  pay_confirmed  BOOLEAN
);

CREATE TABLE bet_price (
  id           BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 1),
  bet_range_id SMALLINT NOT NULL,
  bet_type     SMALLINT NOT NULL,
  price        SMALLINT NOT NULL,
  match_id     SMALLINT NOT NULL REFERENCES team (id)
);

CREATE TABLE bets (
  id           BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (START WITH 1000 INCREMENT BY 1),
  bet_range_id SMALLINT NOT NULL,
  user_id      SMALLINT NOT NULL REFERENCES customer (id),
  price        SMALLINT NOT NULL,
  match_id     SMALLINT NOT NULL REFERENCES team (id),
  won          BOOLEAN
);
