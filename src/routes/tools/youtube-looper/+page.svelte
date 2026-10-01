<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Bookmark {
    id: string;
    title: string;
    startSec: number;
    endSec: number;
    notes: string;
  }

  interface VideoPreset {
    title: string;
    artist: string;
    videoId: string;
    defaultA: number;
    defaultB: number;
  }

  const PRESETS: VideoPreset[] = [
    {
      title: 'Blues Phrasing Masterclass & Licks',
      artist: 'B.B. King & Friends',
      videoId: '4Ny5ajw062g',
      defaultA: 14.5,
      defaultB: 28.0
    },
    {
      title: 'Crossroads Classic Blues Solo Breakdown',
      artist: 'Eric Clapton Style',
      videoId: 'V_3375O6g-s',
      defaultA: 32.0,
      defaultB: 48.5
    },
    {
      title: 'Alternate Picking Mechanics & Synchronization',
      artist: 'Speed Ladder Clinic',
      videoId: 'Cpjwwd091pM',
      defaultA: 5.0,
      defaultB: 18.0
    }
  ];

  let rawUrlInput = $state('https://www.youtube.com/watch?v=4Ny5ajw062g');
  let currentVideoId = $state('4Ny5ajw062g');

  // Player state
  let ytPlayer: any = null;
  let isApiReady = $state(false);
  let isPlaying = $state(false);
  let currentTime = $state(0);
  let duration = $state(180);

  // A/B Looper state
  let isLoopEnabled = $state(true);
  let loopA = $state(14.5);
  let loopB = $state(28.0);
  let playbackRate = $state(1.0);

  // Bookmarks
  let bookmarks = $state<Bookmark[]>([]);
  let newBookmarkTitle = $state('Tricky Turnaround');

  let checkInterval: number | null = null;

  function extractVideoId(url: string): string {
    const trimmed = url.trim();
    if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2].length === 11 ? match[2] : '4Ny5ajw062g';
  }

  function loadNewVideo() {
    const id = extractVideoId(rawUrlInput);
    currentVideoId = id;
    if (ytPlayer && ytPlayer.loadVideoById) {
      ytPlayer.loadVideoById(id);
      loadSavedBookmarks(id);
    }
  }

  function selectPreset(preset: VideoPreset) {
    rawUrlInput = `https://www.youtube.com/watch?v=${preset.videoId}`;
    currentVideoId = preset.videoId;
    loopA = preset.defaultA;
    loopB = preset.defaultB;
    if (ytPlayer && ytPlayer.loadVideoById) {
      ytPlayer.loadVideoById(preset.videoId);
      loadSavedBookmarks(preset.videoId);
    }
  }

  function initYouTubeApi() {
    if ((window as any).YT && (window as any).YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      isApiReady = true;
      createPlayer();
    };
  }

  function createPlayer() {
    ytPlayer = new (window as any).YT.Player('yt-player-frame', {
      videoId: currentVideoId,
      playerVars: {
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        controls: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  }

  function onPlayerReady(event: any) {
    duration = ytPlayer.getDuration() || 180;
    startLoopMonitor();
    loadSavedBookmarks(currentVideoId);
  }

  function onPlayerStateChange(event: any) {
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      isPlaying = true;
    } else {
      isPlaying = false;
    }
  }

  function startLoopMonitor() {
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = window.setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
      currentTime = ytPlayer.getCurrentTime();

      if (isLoopEnabled && loopB > loopA) {
        if (currentTime >= loopB || currentTime < loopA - 0.5) {
          ytPlayer.seekTo(loopA, true);
        }
      }
    }, 100);
  }

  function setA() {
    if (!ytPlayer) return;
    const cur = ytPlayer.getCurrentTime();
    loopA = Math.max(0, Math.round(cur * 10) / 10);
    if (loopA >= loopB) loopB = loopA + 5;
  }

  function setB() {
    if (!ytPlayer) return;
    const cur = ytPlayer.getCurrentTime();
    loopB = Math.max(loopA + 0.5, Math.round(cur * 10) / 10);
  }

  function nudgeA(deltaSec: number) {
    loopA = Math.max(0, Math.round((loopA + deltaSec) * 10) / 10);
    if (loopA >= loopB) loopB = loopA + 0.5;
  }

  function nudgeB(deltaSec: number) {
    loopB = Math.max(loopA + 0.5, Math.round((loopB + deltaSec) * 10) / 10);
  }

  function jumpToA() {
    if (ytPlayer) {
      ytPlayer.seekTo(loopA, true);
    }
  }

  function setSpeed(rate: number) {
    playbackRate = rate;
    if (ytPlayer && ytPlayer.setPlaybackRate) {
      ytPlayer.setPlaybackRate(rate);
    }
  }

  function togglePlay() {
    if (!ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function addBookmark() {
    const newBm: Bookmark = {
      id: Date.now().toString(),
      title: newBookmarkTitle.trim() || `Lick ${formatTime(loopA)} - ${formatTime(loopB)}`,
      startSec: loopA,
      endSec: loopB,
      notes: `${Math.round((loopB - loopA) * 10) / 10}s loop at ${Math.round(playbackRate * 100)}% speed`
    };
    bookmarks = [...bookmarks, newBm];
    saveBookmarks();
  }

  function applyBookmark(bm: Bookmark) {
    loopA = bm.startSec;
    loopB = bm.endSec;
    isLoopEnabled = true;
    jumpToA();
  }

  function deleteBookmark(id: string) {
    bookmarks = bookmarks.filter((b) => b.id !== id);
    saveBookmarks();
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(`yt_bookmarks_${currentVideoId}`, JSON.stringify(bookmarks));
    } catch {}
  }

  function loadSavedBookmarks(vidId: string) {
    try {
      const saved = localStorage.getItem(`yt_bookmarks_${vidId}`);
      if (saved) {
        bookmarks = JSON.parse(saved);
      } else {
        bookmarks = [];
      }
    } catch {
      bookmarks = [];
    }
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  }

  // Keyboard shortcut listener for hands-on guitarists
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === '[') {
      setA();
    } else if (e.key === ']') {
      setB();
    } else if (e.key.toLowerCase() === 'l') {
      isLoopEnabled = !isLoopEnabled;
    } else if (e.key.toLowerCase() === 'r') {
      jumpToA();
    }
  }

  onMount(() => {
    initYouTubeApi();
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    if (checkInterval) clearInterval(checkInterval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
  });
</script>

<svelte:head>
  <title>YouTube Smart Practice Looper | Guitar Toolkit</title>
  <meta
    name="description"
    content="Practice any YouTube guitar solo or lesson with seamless A/B micro-looping, pitch-preserved slowdown (50%-100%), and measure bookmarks."
  />
</svelte:head>

<div class="tool-container">
  <div class="tool-header">
    <div class="breadcrumbs">
      <a href="/">Toolkit Home</a> &rsaquo; <span>Tabs & Practice</span>
    </div>
    <div class="badge-row">
      <span class="badge badge-accent">#31 Video Practice Tool</span>
      <span class="badge">A/B Micro-Looping</span>
      <span class="badge">Pitch-Preserved Slowdown</span>
    </div>
    <h1>🎸 YouTube Smart Practice Looper</h1>
    <p class="tool-sub">
      Loop any challenging 2-second solo phrase or rhythm riff over and over. Slow it down without pitch shifting, bookmark tricky measures, and practice hands-on with keyboard shortcuts.
    </p>
  </div>

  <!-- Video URL & Presets Bar -->
  <div class="input-card">
    <div class="url-input-row">
      <label for="yt-url" class="url-label">PASTE YOUTUBE LESSON / TRACK LINK:</label>
      <div class="input-actions">
        <input
          id="yt-url"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          bind:value={rawUrlInput}
        />
        <button type="button" class="load-btn" onclick={loadNewVideo}>
          LOAD VIDEO
        </button>
      </div>
    </div>

    <div class="presets-row">
      <span class="presets-label">Quick Presets:</span>
      {#each PRESETS as p}
        <button type="button" class="preset-btn" onclick={() => selectPreset(p)}>
          {p.artist} — {p.title}
        </button>
      {/each}
    </div>
  </div>

  <!-- Main Player & Loop Controls Grid -->
  <div class="player-grid">
    <!-- Embedded Video Player -->
    <div class="video-card">
      <div class="video-aspect-box">
        <div id="yt-player-frame"></div>
      </div>

      <!-- Quick Status & Keyboard Shortcuts Banner -->
      <div class="shortcuts-bar">
        <span>⌨ Shortcuts:</span>
        <span class="key-badge">Space</span> Play/Pause &bull;
        <span class="key-badge">[</span> Set Point A &bull;
        <span class="key-badge">]</span> Set Point B &bull;
        <span class="key-badge">L</span> Toggle Loop &bull;
        <span class="key-badge">R</span> Return to A
      </div>
    </div>

    <!-- Right Controls Panel: A/B Loop & Speed -->
    <div class="looper-controls-card">
      <!-- Loop Switch & Indicators -->
      <div class="loop-status-header">
        <div class="loop-toggle-row">
          <label class="switch">
            <input type="checkbox" bind:checked={isLoopEnabled} />
            <span class="slider round"></span>
          </label>
          <span class="toggle-text" class:active-toggle={isLoopEnabled}>
            {isLoopEnabled ? '🔁 LOOP ACTIVE' : 'LOOP PAUSED'}
          </span>
        </div>
        <button type="button" class="restart-loop-btn" onclick={jumpToA}>
          ⏮ REWIND TO A
        </button>
      </div>

      <!-- Point A & Point B Cards -->
      <div class="points-grid">
        <div class="point-box">
          <div class="point-header">
            <span class="point-tag">POINT A (START)</span>
            <span class="point-val">{formatTime(loopA)}</span>
          </div>
          <button type="button" class="set-point-btn" onclick={setA}>
            [ SET TO CURRENT ({formatTime(currentTime)})
          </button>
          <div class="nudge-row">
            <button type="button" onclick={() => nudgeA(-0.5)}>-0.5s</button>
            <button type="button" onclick={() => nudgeA(-0.1)}>-0.1s</button>
            <button type="button" onclick={() => nudgeA(+0.1)}>+0.1s</button>
            <button type="button" onclick={() => nudgeA(+0.5)}>+0.5s</button>
          </div>
        </div>

        <div class="point-box">
          <div class="point-header">
            <span class="point-tag">POINT B (END)</span>
            <span class="point-val">{formatTime(loopB)}</span>
          </div>
          <button type="button" class="set-point-btn" onclick={setB}>
            ] SET TO CURRENT ({formatTime(currentTime)})
          </button>
          <div class="nudge-row">
            <button type="button" onclick={() => nudgeB(-0.5)}>-0.5s</button>
            <button type="button" onclick={() => nudgeB(-0.1)}>-0.1s</button>
            <button type="button" onclick={() => nudgeB(+0.1)}>+0.1s</button>
            <button type="button" onclick={() => nudgeB(+0.5)}>+0.5s</button>
          </div>
        </div>
      </div>

      <div class="loop-duration-indicator">
        Loop Duration: <strong>{Math.round((loopB - loopA) * 10) / 10} seconds</strong>
      </div>

      <!-- Speed Control Bar (Pitch Preserved) -->
      <div class="speed-section">
        <div class="speed-header">
          <span class="speed-label">PLAYBACK SPEED (PITCH PRESERVED):</span>
          <span class="speed-val">{Math.round(playbackRate * 100)}%</span>
        </div>
        <div class="speed-btn-row">
          {#each [0.5, 0.65, 0.75, 0.85, 1.0, 1.15] as rate}
            <button
              type="button"
              class="speed-chip"
              class:active={playbackRate === rate}
              onclick={() => setSpeed(rate)}
            >
              {Math.round(rate * 100)}%
            </button>
          {/each}
        </div>
      </div>

      <!-- Save Bookmark Form -->
      <div class="bookmark-create-row">
        <input
          type="text"
          placeholder="Bookmark name (e.g. Measure 16 fast arpeggio)..."
          bind:value={newBookmarkTitle}
        />
        <button type="button" class="add-bm-btn" onclick={addBookmark}>
          ⭐ SAVE LOOP
        </button>
      </div>
    </div>
  </div>

  <!-- Bookmarks Library -->
  <div class="bookmarks-card">
    <div class="bm-header">
      <h3>📑 Saved Measure Bookmarks ({bookmarks.length})</h3>
      <span class="bm-sub">Jump between solos, verses, and tricky licks instantly</span>
    </div>

    {#if bookmarks.length === 0}
      <p class="bm-empty">No measures bookmarked for this video yet. Click "Save Loop" above to store your practice segments.</p>
    {:else}
      <div class="bm-grid">
        {#each bookmarks as bm}
          <div class="bm-tile">
            <div class="tile-top">
              <span class="tile-title">{bm.title}</span>
              <span class="tile-times">{formatTime(bm.startSec)} &rarr; {formatTime(bm.endSec)}</span>
            </div>
            <div class="tile-notes">{bm.notes}</div>
            <div class="tile-actions">
              <button type="button" class="apply-btn" onclick={() => applyBookmark(bm)}>
                ▶ LOAD LOOP
              </button>
              <button type="button" class="del-bm-btn" onclick={() => deleteBookmark(bm.id)}>
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .tool-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px 16px 64px;
    color: var(--text-main, #e5e7eb);
  }

  .breadcrumbs {
    font-size: 0.85rem;
    color: var(--text-sub, #9ca3af);
    margin-bottom: 8px;
  }
  .breadcrumbs a {
    color: var(--accent-cyan, #38bdf8);
    text-decoration: none;
  }

  .badge-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .badge {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: #1f2937;
    color: #9ca3af;
    border: 1px solid #374151;
  }
  .badge-accent {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.4);
  }

  h1 {
    font-size: 1.85rem;
    font-weight: 800;
    margin: 0 0 8px;
    color: #f9fafb;
  }
  .tool-sub {
    font-size: 1rem;
    color: #9ca3af;
    line-height: 1.5;
    margin: 0 0 24px;
  }

  .input-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .url-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    display: block;
    margin-bottom: 6px;
  }
  .input-actions {
    display: flex;
    gap: 10px;
  }
  .input-actions input {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .load-btn {
    background: #ef4444;
    color: #ffffff;
    border: none;
    font-weight: 700;
    padding: 0 20px;
    border-radius: 6px;
    cursor: pointer;
  }
  .load-btn:hover {
    background: #dc2626;
  }

  .presets-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .presets-label {
    font-size: 0.75rem;
    color: #6b7280;
  }
  .preset-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  .preset-btn:hover {
    color: #38bdf8;
    border-color: #38bdf8;
  }

  .player-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }
  @media (max-width: 860px) {
    .player-grid {
      grid-template-columns: 1fr;
    }
  }

  .video-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    overflow: hidden;
  }
  .video-aspect-box {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 */
    height: 0;
    background: #000000;
  }
  .video-aspect-box :global(iframe) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .shortcuts-bar {
    padding: 10px 14px;
    background: #0d1117;
    border-top: 1px solid #1f2937;
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .key-badge {
    background: #1f2937;
    color: #e5e7eb;
    border: 1px solid #374151;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: monospace;
    font-weight: 700;
  }

  .looper-controls-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .loop-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .loop-toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .toggle-text {
    font-size: 0.85rem;
    font-weight: 700;
    color: #6b7280;
  }
  .toggle-text.active-toggle {
    color: #10b981;
  }
  .restart-loop-btn {
    background: #1f2937;
    border: 1px solid #374151;
    color: #d1d5db;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .restart-loop-btn:hover {
    border-color: #38bdf8;
    color: #38bdf8;
  }

  /* Switch styling */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #374151;
    transition: 0.2s;
  }
  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.2s;
  }
  input:checked + .slider {
    background-color: #10b981;
  }
  input:checked + .slider:before {
    transform: translateX(20px);
  }
  .slider.round {
    border-radius: 24px;
  }
  .slider.round:before {
    border-radius: 50%;
  }

  .points-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .point-box {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px;
  }
  .point-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .point-tag {
    font-size: 0.7rem;
    color: #9ca3af;
    font-weight: 700;
  }
  .point-val {
    font-size: 0.95rem;
    font-weight: 800;
    color: #38bdf8;
    font-family: monospace;
  }
  .set-point-btn {
    width: 100%;
    background: #111827;
    border: 1px solid #4b5563;
    color: #f3f4f6;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 8px;
  }
  .set-point-btn:hover {
    border-color: #f59e0b;
    color: #f59e0b;
  }
  .nudge-row {
    display: flex;
    gap: 4px;
  }
  .nudge-row button {
    flex: 1;
    background: #374151;
    border: none;
    color: #d1d5db;
    font-size: 0.65rem;
    padding: 4px 2px;
    border-radius: 3px;
    cursor: pointer;
  }
  .nudge-row button:hover {
    background: #4b5563;
  }

  .loop-duration-indicator {
    text-align: center;
    font-size: 0.8rem;
    color: #9ca3af;
  }
  .loop-duration-indicator strong {
    color: #f59e0b;
  }

  .speed-section {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px;
  }
  .speed-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .speed-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  .speed-val {
    font-size: 0.85rem;
    font-weight: 800;
    color: #10b981;
  }
  .speed-btn-row {
    display: flex;
    gap: 6px;
  }
  .speed-chip {
    flex: 1;
    background: #111827;
    border: 1px solid #374151;
    color: #d1d5db;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 6px 0;
    border-radius: 4px;
    cursor: pointer;
  }
  .speed-chip:hover {
    border-color: #10b981;
  }
  .speed-chip.active {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    color: #10b981;
  }

  .bookmark-create-row {
    display: flex;
    gap: 8px;
  }
  .bookmark-create-row input {
    flex: 1;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  .add-bm-btn {
    background: #f59e0b;
    color: #78350f;
    border: none;
    font-weight: 800;
    font-size: 0.8rem;
    padding: 0 14px;
    border-radius: 4px;
    cursor: pointer;
  }

  .bookmarks-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 20px;
  }
  .bm-header {
    margin-bottom: 16px;
  }
  .bm-header h3 {
    margin: 0 0 4px;
    font-size: 1.15rem;
  }
  .bm-sub {
    font-size: 0.8rem;
    color: #9ca3af;
  }
  .bm-empty {
    font-size: 0.85rem;
    color: #6b7280;
    font-style: italic;
    margin: 0;
  }

  .bm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }
  .bm-tile {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .tile-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
  }
  .tile-title {
    font-weight: 700;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
  .tile-times {
    font-size: 0.75rem;
    color: #38bdf8;
    font-family: monospace;
  }
  .tile-notes {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 12px;
  }
  .tile-actions {
    display: flex;
    gap: 6px;
  }
  .apply-btn {
    flex: 2;
    background: #0284c7;
    color: #ffffff;
    border: none;
    padding: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
  }
  .del-bm-btn {
    flex: 1;
    background: none;
    border: 1px solid #4b5563;
    color: #ef4444;
    padding: 6px;
    font-size: 0.75rem;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
