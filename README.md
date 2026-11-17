# Dip-Buy BTC Bot — btc-race-24h-20261117-0603

A trading bot for the make.fun BTC race: it trades Coinbase Wrapped BTC
(cbBTC) against USDC, minute by minute, in a replay of on-chain prices.

## Strategy

This window is flat and choppy (mean |1-minute move| ~4 bps) while a full
round trip costs ~26 bps in fees, slippage and price impact, so frequent
trading bleeds money. The one robust edge is to trade ONCE: buy the dip,
then hold.

- **Entry:** buy ALL cash the first time the close dips 60 bps or more below
  the opening close (the first scored bar's close), or at scored bar 720
  (the halfway mark) if no dip has happened by then. One buy only.
- **Risk control:** a wide stop-loss — sell everything if the close falls
  200 bps below the entry close. It never triggers on the dev window (the
  post-entry dip there is ~26 bps); it only guards a real crash.
- **Otherwise hold to the end;** the harness flattens whatever is left.

## Results (dev window, local grade)

- Net PnL: **+$7.86** on $1,000 starting capital (buy-and-hold: +$1.07)
- Trades: 1
- Max drawdown: 2.12% (guardrail: 25%)
- Net PnL at 2x fees: +$7.05 (still positive)
- Deterministic: the two grade executions produce byte-identical action logs.

## Run

Node 22: `node /bot/main.ts`. The bot speaks `agent-fun/bars-replay/v1`
(NDJSON on stdin/stdout) via the vendored SDK shim in `vendor/`.

## License

MIT. See LICENSE.
