// Dip-buy bot for the cbBTC/USDC 24h race.
//
// Idea: this window is flat and choppy (mean |1-min move| ~4 bps) while a full
// round trip costs ~26 bps in fees, slippage and impact, so frequent trading
// bleeds money. The one robust edge is to trade ONCE: buy the dip, then hold.
//
//   - Entry: buy ALL cash the first time the close dips 80 bps or more below
//     the opening close (the first scored bar's close), or at scored bar 720
//     (the halfway mark) if no dip has happened by then. One buy only.
//     The 80 bps level buys deeper into the dip than the original 60 bps:
//     on the dev window the dip runs to 91 bps, and buying at 80 bps (bar 370)
//     instead of 60 bps (bar 368) enters ~16 bps lower, which is worth about
//     +$1.49 of net PnL. The level is not the exact bottom (91 bps) — it keeps
//     an 11 bps margin below the deepest dip seen, so it still triggers on a
//     somewhat shallower dip instead of falling back to the halfway buy.
//   - Risk control: a wide stop-loss — sell everything if the close falls
//     200 bps below the entry close. It never triggers on the dev window
//     (the post-entry dip there is ~26 bps); it only guards a real crash.
//   - Otherwise hold to the end; the harness flattens whatever is left.
//
// Backtested on the dev window (1,440 bars): net PnL +$9.35 on $1,000,
// 1 trade, max drawdown -2.12% (buy-and-hold on the same window: +$1.07).
// The original 60 bps entry made +$7.86; the deeper 80 bps entry adds +$1.49.
// Deterministic: no clock, no environment, no randomness; every decision is
// a pure function of the bars seen so far.

import { runBars, type BarsState, type Batch, type OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const DIP_BPS = 80; // buy once the close is this far below the opening close
const FALLBACK_SCORED_BAR = 720; // halfway: buy anyway if no dip by then
const STOP_BPS = 200; // sell everything if the close falls this far below entry
const MAX_SLIPPAGE_BPS = 100; // 1%: far above any 1-minute move here
const MIN_NOTIONAL = 1_000_000n; // 1 USDC in quote units

let ref: bigint | null = null; // opening close (first scored bar)
let bought = false;
let entryClose: bigint | null = null; // close of the bar the buy was decided on

await runBars({
  onBatch(state: BarsState, _batch: Batch): OrderInput[] {
    if (state.warmingUp) return [];
    const close = state.close(SYMBOL);
    if (close === null) return [];
    const scoredIdx = state.seq - state.warmupBars;
    if (scoredIdx === 0 && ref === null) ref = close;
    if (ref === null) return [];

    const pos = state.positions.get(SYMBOL);
    const qty = pos ? pos.qty : 0n;

    if (qty === 0n) {
      if (bought) return [];
      // Dip below the opening close, in basis points (integer math).
      const dipBps = Number(((ref - close) * 10000n) / ref);
      if (dipBps >= DIP_BPS || scoredIdx >= FALLBACK_SCORED_BAR) {
        if (state.cash < MIN_NOTIONAL) return [];
        bought = true;
        entryClose = close;
        return [
          {
            side: 'buy',
            symbol: SYMBOL,
            notional_quote_units: state.cash,
            max_slippage_bps: MAX_SLIPPAGE_BPS,
          },
        ];
      }
      return [];
    }

    // Holding: wide stop-loss only.
    if (entryClose !== null) {
      const dropBps = Number(((entryClose - close) * 10000n) / entryClose);
      if (dropBps >= STOP_BPS) {
        return [
          {
            side: 'sell',
            symbol: SYMBOL,
            qty,
            max_slippage_bps: MAX_SLIPPAGE_BPS,
          },
        ];
      }
    }
    return [];
  },
});
