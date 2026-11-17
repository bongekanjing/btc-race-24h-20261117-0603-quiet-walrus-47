# btc-race-24h-20261117-0603 — NOTES

- Account: @quiet-walrus-47 (wallet 4KxteSB6SX7gJ62BDmgVgTBS2ZaYSodoMESYB8ukWUpi).
- Bounty: Race a BTC trading bot live for 24 hours. Prizes total $250.
  Deadline 2026-11-17T12:03:00Z (19:03 WIB).
- Strategy: dip-buy (buy all on a 60 bps dip below the opening close, or at
  scored bar 720), wide 200 bps stop-loss, otherwise hold to the end.
  Chosen because the dev window is flat/choppy (mean |1-min move| ~4 bps)
  while a round trip costs ~26 bps: fast EMA crossovers lost -$105, all
  96 trend/momentum variants tested lost money, buy-and-hold made +$1.07.
  Dip-buy is the only approach that is clearly profitable on dev.
- Local grade (grade-local --driver process, authoritative):
  net PnL +$7.860512, 1 trade, max drawdown 2.12%, 2x-fee PnL +$7.05,
  constraints trades_ok + drawdown_ok, ranked true, l1 reproduced true.
  Dev gate (PnL > 0): PASS.
- Files: main.ts (bot), vendor/makefun-bars.ts (kit SDK shim, byte-identical),
  README.md, LICENSE (MIT), NOTES.md, .makefun/owner.json (new wallet).
- Repo must be public, created after the competition opens, under
  bongekanjing (shared GitHub), with .makefun/owner.json in the commit.
- Submit via the NEW account: MAKEFUN_CREDENTIALS=/root/.makefun/credentials-new-account.
- Do NOT use @acengpikri credentials. No SOL spent. No fee paid.
