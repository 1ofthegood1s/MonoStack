import GameCanvas from './GameCanvas';

// Static markup the game code drives by id (src/ui.ts) — ids are the contract.
export default function Page() {
  return (
    <>
      <GameCanvas />

      <div className="hud" id="count"></div>
      <div className="hud" id="best"></div>
      <div className="hud" id="pips"></div>
      <div className="hud" id="points"></div>
      <button id="mute"></button>

      <div className="overlay" id="overlay-start">
        <h1>
          <span className="accent">LILY</span> MONOLITH
        </h1>
        <p>STACK 30 BLOCKS. MISSES GET TRIMMED.</p>
        <p>TAP, CLICK, OR PRESS SPACE. M FOR SOUND.</p>
      </div>

      <div className="overlay hidden" id="overlay-lost">
        <h1>THE RUN ENDS</h1>
        <p id="lost-stats"></p>
        <button data-restart>RESTART</button>
        <button data-share>SHARE</button>
        <p className="hint">SPACE OR TAP TO RETRY</p>
      </div>

      <div className="overlay hidden" id="overlay-won">
        <h1 className="accent">LILY</h1>
        <p id="won-stats"></p>
        {/* REWARD_PLACEHOLDER: wire the reward content into #reward-slot below.
            Shown only when the completed run had >= REWARD.MIN_PERFECTS perfects;
            otherwise #consolation rotates through REWARD.CONSOLATION. */}
        <div id="reward-slot">REWARD PLACEHOLDER</div>
        <p id="consolation" className="gone"></p>
        <button data-restart>PLAY AGAIN</button>
        <button data-share>SHARE</button>
        <p className="hint">SPACE OR TAP TO PLAY AGAIN</p>
      </div>
    </>
  );
}
