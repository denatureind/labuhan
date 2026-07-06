<script lang="ts">
  import { layoutEditor } from '../engine/editorStore.svelte';
  import { buildTrafficFrames } from '../engine/traffic';

  layoutEditor.loadSprites();

  let stageRect = $state({ x: 0, y: 0, w: 0, h: 0 });

  function measure() {
    const el = document.querySelector('.stage');
    if (!el) return;
    const r = el.getBoundingClientRect();
    stageRect = { x: r.x, y: r.y, w: r.width, h: r.height };
  }

  $effect(() => {
    measure();
    window.addEventListener('resize', measure);
    const id = setInterval(measure, 400);
    return () => {
      window.removeEventListener('resize', measure);
      clearInterval(id);
    };
  });

  function toPct(clientX: number, clientY: number) {
    return {
      x: Math.round(((clientX - stageRect.x) / stageRect.w) * 1000) / 10,
      y: Math.round(((clientY - stageRect.y) / stageRect.h) * 1000) / 10,
    };
  }

  /** Klik di peta hanya menambah titik saat mode ini AKTIF — kalau tidak, klik
   * harus tembus ke bangunan di bawahnya supaya masih bisa diseret (lihat
   * bug: dulu overlay ini selalu menutup peta begitu ada kendaraan terpilih). */
  let addPointMode = $state(false);

  function onMapClick(e: MouseEvent) {
    const v = layoutEditor.selectedVehicle;
    if (!v || !addPointMode) return;
    const { x, y } = toPct(e.clientX, e.clientY);
    v.points.push({ x, y });
  }

  function selectVehicle(id: string) {
    layoutEditor.selectedVehicleId = id;
    addPointMode = false;
  }

  let dragIdx = $state<number | null>(null);
  function startDragPoint(i: number, e: PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dragIdx = i;
    const move = (ev: PointerEvent) => {
      const v = layoutEditor.selectedVehicle;
      if (!v || dragIdx === null) return;
      const { x, y } = toPct(ev.clientX, ev.clientY);
      v.points[dragIdx] = { ...v.points[dragIdx], x, y };
    };
    const up = () => {
      dragIdx = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function nudgePoint(i: number, e: KeyboardEvent) {
    const v = layoutEditor.selectedVehicle;
    if (!v) return;
    const step = e.shiftKey ? 1 : 0.2;
    const p = v.points[i];
    if (e.key === 'ArrowLeft') v.points[i] = { ...p, x: p.x - step };
    else if (e.key === 'ArrowRight') v.points[i] = { ...p, x: p.x + step };
    else if (e.key === 'ArrowUp') v.points[i] = { ...p, y: p.y - step };
    else if (e.key === 'ArrowDown') v.points[i] = { ...p, y: p.y + step };
    else if (e.key === 'Delete' || e.key === 'Backspace') removePoint(i);
    else return;
    e.preventDefault();
  }

  function removePoint(i: number) {
    const v = layoutEditor.selectedVehicle;
    if (!v || v.points.length <= 2) return;
    v.points = v.points.filter((_, idx) => idx !== i);
  }

  function movePoint(i: number, dir: -1 | 1) {
    const v = layoutEditor.selectedVehicle;
    if (!v) return;
    const j = i + dir;
    if (j < 0 || j >= v.points.length) return;
    const pts = v.points.slice();
    [pts[i], pts[j]] = [pts[j], pts[i]];
    v.points = pts;
  }

  function toggleFlip(i: number) {
    const v = layoutEditor.selectedVehicle;
    if (!v) return;
    v.points[i] = { ...v.points[i], flipAfter: !v.points[i].flipAfter };
  }

  let previewImg = $state<HTMLImageElement | null>(null);
  let previewAnim: Animation | null = null;
  function preview() {
    const v = layoutEditor.selectedVehicle;
    if (!v || !previewImg) return;
    if (v.enabled === false) {
      layoutEditor.status = '⚠️ Kendaraan ini nonaktif — pratinjau tetap main, tapi tidak akan muncul di peta sungguhan sampai diaktifkan.';
    }
    previewAnim?.cancel();
    previewImg.style.width = `${v.width}%`;
    previewAnim = previewImg.animate(buildTrafficFrames(v), {
      duration: v.cycleMs,
      iterations: 1,
      easing: 'linear',
    });
  }

  let newSpriteChoice = $state('');
  let uploading = $state(false);

  function addFromExisting() {
    if (!newSpriteChoice) return;
    layoutEditor.addVehicle(newSpriteChoice);
    addPointMode = false;
  }

  async function onUploadFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    uploading = true;
    const filename = await layoutEditor.uploadSprite(file);
    uploading = false;
    if (filename) {
      layoutEditor.addVehicle(filename);
      addPointMode = false;
    }
  }

  function removeSelected() {
    const v = layoutEditor.selectedVehicle;
    if (!v) return;
    if (!confirm(`Hapus kendaraan "${v.id}" dari daftar?`)) return;
    layoutEditor.removeVehicle(v.id);
  }

  let newDecorChoice = $state('');
  let uploadingDecor = $state(false);

  function addDecorFromExisting() {
    if (!newDecorChoice) return;
    layoutEditor.addDecor(newDecorChoice);
  }

  async function onUploadDecorFile(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    uploadingDecor = true;
    const filename = await layoutEditor.uploadSprite(file);
    uploadingDecor = false;
    if (filename) layoutEditor.addDecor(filename);
  }

  function removeDecorItem(id: string) {
    if (!confirm(`Hapus dekorasi "${id}" dari daftar?`)) return;
    layoutEditor.removeDecor(id);
  }
</script>

<!-- Overlay gambar semua jalur di atas peta asli. pointer-events HANYA aktif saat
     mode tambah-titik dinyalakan — di luar itu klik harus tembus ke bangunan di
     bawahnya, supaya menyeret bangunan tetap bisa dilakukan sambil kendaraan
     terpilih (titik jalur yang sudah ada tetap bisa diseret lewat .point sendiri,
     lihat komentar pointer-events di CSS-nya). -->
<div
  class="path-overlay"
  style="left:{stageRect.x}px; top:{stageRect.y}px; width:{stageRect.w}px; height:{stageRect.h}px;
    pointer-events:{addPointMode ? 'auto' : 'none'}"
  onclick={onMapClick}
  role="presentation"
>
  <svg width="100%" height="100%">
    {#each layoutEditor.vehicles as v (v.id)}
      {#if v.id !== layoutEditor.selectedVehicleId}
        <polyline points={v.points.map((p) => `${p.x}%,${p.y}%`).join(' ')} class="ghost-path" />
      {/if}
    {/each}
    {#if layoutEditor.selectedVehicle}
      <polyline
        points={layoutEditor.selectedVehicle.points.map((p) => `${p.x}%,${p.y}%`).join(' ')}
        class="active-path"
      />
      {#each layoutEditor.selectedVehicle.points as p, i (i)}
        <circle
          cx="{p.x}%"
          cy="{p.y}%"
          r="8"
          class="point"
          role="button"
          tabindex="0"
          aria-label="Titik {i + 1} — seret atau pakai panah untuk memindah, Delete untuk hapus"
          onpointerdown={(e) => startDragPoint(i, e)}
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => nudgePoint(i, e)}
        />
        <text x="{p.x}%" y="{p.y}%" dx="11" dy="-9" class="point-label">{i + 1}</text>
      {/each}
    {/if}
  </svg>
  {#if layoutEditor.selectedVehicle}
    <img bind:this={previewImg} class="preview-ghost" src={layoutEditor.selectedVehicle.sprite} alt="" />
  {/if}
</div>

<!-- Panel kontrol -->
<div class="editor-panel">
  <header>
    <b>🛠️ Edit Tata Letak</b>
    <span class="hint">Seret bangunan langsung di peta. Pilih kendaraan lalu klik peta untuk menambah titik jalur.</span>
  </header>

  <section>
    <h4>Bangunan</h4>
    <div class="fac-grid">
      {#each layoutEditor.facilities as f (f.id)}
        <div class="fac-row">
          <span class="fac-name">{f.icon} {f.name}</span>
          <label>x <input type="number" step="0.5" bind:value={f.pos.x} /></label>
          <label>y <input type="number" step="0.5" bind:value={f.pos.y} /></label>
          <label>lebar <input type="number" step="0.5" bind:value={f.pos.w} /></label>
        </div>
      {/each}
    </div>
    <button class="btn-save" onclick={() => layoutEditor.saveFacilities()}>💾 Simpan Posisi Bangunan</button>
  </section>

  <section>
    <h4>Dekorasi (bangunan tambahan, orang, properti)</h4>
    <p class="hint">Hiasan statis — tidak bisa diklik pemain, cuma variasi visual. Seret langsung di peta seperti bangunan.</p>
    <div class="fac-grid">
      {#each layoutEditor.decor as d (d.id)}
        <div class="fac-row decor-row">
          <span class="fac-name">{d.id}</span>
          <label>x <input type="number" step="0.5" bind:value={d.x} /></label>
          <label>y <input type="number" step="0.5" bind:value={d.y} /></label>
          <label>lebar <input type="number" step="0.5" bind:value={d.w} /></label>
          <label>sudut(°) <input type="number" step="5" value={d.rotateDeg ?? 0} oninput={(e) => (d.rotateDeg = +e.currentTarget.value || 0)} /></label>
          <button title="Hapus dekorasi ini" onclick={() => removeDecorItem(d.id)}>✕</button>
        </div>
      {/each}
      {#if layoutEditor.decor.length === 0}
        <p class="hint">Belum ada dekorasi. Tambahkan lewat aset yang sudah ada atau unggah gambar baru di bawah.</p>
      {/if}
    </div>

    <div class="add-veh">
      <select bind:value={newDecorChoice}>
        <option value="">— pilih aset yang sudah ada —</option>
        {#each layoutEditor.availableSprites as f (f)}
          <option value={f}>{f}</option>
        {/each}
      </select>
      <button onclick={addDecorFromExisting} disabled={!newDecorChoice}>+ Dekorasi</button>
      <label class="upload-btn">
        {uploadingDecor ? 'Mengunggah…' : '⬆ Unggah Gambar Baru'}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onchange={onUploadDecorFile} disabled={uploadingDecor} />
      </label>
    </div>

    <button class="btn-save" onclick={() => layoutEditor.saveDecor()}>💾 Simpan Dekorasi</button>
  </section>

  <section>
    <h4>Jalur Kendaraan &amp; Kapal</h4>
    <div class="veh-tabs">
      {#each layoutEditor.vehicles as v (v.id)}
        <button
          class="veh-tab"
          class:active={layoutEditor.selectedVehicleId === v.id}
          class:vdisabled={v.enabled === false}
          onclick={() => selectVehicle(v.id)}
          title={v.enabled === false ? `${v.id} (nonaktif)` : v.id}
        >
          {#if v.enabled === false}<span class="off-dot" aria-hidden="true">⏻</span>{/if}
          <img src={v.sprite} alt="" />
          {v.id}
        </button>
      {/each}
    </div>

    <div class="add-veh">
      <select bind:value={newSpriteChoice}>
        <option value="">— pilih aset yang sudah ada —</option>
        {#each layoutEditor.availableSprites as f (f)}
          <option value={f}>{f}</option>
        {/each}
      </select>
      <button onclick={addFromExisting} disabled={!newSpriteChoice}>+ Kendaraan</button>
      <label class="upload-btn">
        {uploading ? 'Mengunggah…' : '⬆ Unggah Gambar Baru'}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onchange={onUploadFile} disabled={uploading} />
      </label>
    </div>

    {#if layoutEditor.selectedVehicle}
      {@const v = layoutEditor.selectedVehicle}
      <div class="path-mode-row">
        <label class="chk">
          <input type="checkbox" checked={v.enabled !== false} onchange={(e) => (v.enabled = e.currentTarget.checked)} />
          {v.enabled === false ? '⏻ Nonaktif (tak akan muncul di peta)' : '✅ Aktif'}
        </label>
        {#if !layoutEditor.isBuiltinVehicle(v.id)}
          <button title="Hapus kendaraan ini" onclick={removeSelected}>🗑️ Hapus</button>
        {/if}
      </div>
      {#if layoutEditor.isBuiltinVehicle(v.id)}
        <p class="hint">Ini kendaraan bawaan game — tidak bisa dihapus, cuma bisa dinonaktifkan lewat tombol Aktif di atas.</p>
      {/if}
      <div class="path-mode-row">
        <label class="chk">
          <input type="checkbox" bind:checked={addPointMode} />
          📍 Mode tambah titik (klik peta untuk menambah)
        </label>
      </div>
      <p class="hint">
        {#if addPointMode}Klik di atas peta untuk menambah titik di ujung jalur.{:else}Seret titik yang sudah ada di peta, atau nyalakan mode tambah titik untuk menambah yang baru.{/if}
      </p>
      <div class="point-list">
        {#each v.points as p, i (i)}
          <div class="point-row">
            <b>#{i + 1}</b>
            <label>x <input type="number" step="0.1" bind:value={p.x} /></label>
            <label>y <input type="number" step="0.1" bind:value={p.y} /></label>
            <label>jeda(ms) <input type="number" step="500" value={p.pauseMs ?? 0} oninput={(e) => (p.pauseMs = +e.currentTarget.value || 0)} /></label>
            <label>sudut(°) <input type="number" step="5" value={p.rotateDeg ?? 0} oninput={(e) => (p.rotateDeg = +e.currentTarget.value || 0)} /></label>
            <label class="chk"><input type="checkbox" checked={!!p.flipAfter} onchange={() => toggleFlip(i)} /> balik arah setelah ini</label>
            <button title="Naik" onclick={() => movePoint(i, -1)}>↑</button>
            <button title="Turun" onclick={() => movePoint(i, 1)}>↓</button>
            <button title="Hapus" onclick={() => removePoint(i)} disabled={v.points.length <= 2}>✕</button>
          </div>
        {/each}
      </div>

      <div class="timing-row">
        <label>Total putaran (ms) <input type="number" step="1000" bind:value={v.cycleMs} /></label>
        <label>Lama tampak (ms) <input type="number" step="1000" bind:value={v.driveMs} /></label>
        <label>Selisih awal (ms) <input type="number" step="1000" bind:value={v.delayMs} /></label>
      </div>

      <div class="action-row">
        <button onclick={preview}>▶ Pratinjau Jalur</button>
      </div>
    {:else}
      <p class="hint">Pilih salah satu kendaraan/kapal di atas untuk menyusun jalurnya, atau centang/hilangkan centang untuk aktif-nonaktifkan.</p>
    {/if}
    <button class="btn-save" onclick={() => layoutEditor.saveTraffic()}>💾 Simpan Jalur Kendaraan</button>
  </section>

  {#if layoutEditor.status}
    <p class="status">{layoutEditor.status}</p>
  {/if}

  <footer>
    <button onclick={() => layoutEditor.reset()}>↺ Batalkan Perubahan</button>
    <button onclick={() => (layoutEditor.active = false)}>✕ Tutup Editor</button>
  </footer>
</div>

<style>
  .path-overlay {
    position: fixed;
    z-index: 45;
  }

  svg {
    overflow: visible;
  }

  .ghost-path {
    fill: none;
    stroke: rgba(255, 255, 255, 0.25);
    stroke-width: 2;
    stroke-dasharray: 4 4;
    pointer-events: none;
  }

  .active-path {
    fill: none;
    stroke: var(--lampu-terang);
    stroke-width: 2.5;
    pointer-events: none;
  }

  .point {
    fill: var(--lampu-terang);
    stroke: rgba(8, 23, 41, 0.9);
    stroke-width: 2;
    cursor: grab;
    /* Titik harus tetap bisa diseret walau overlay induknya pointer-events:none
       (saat mode tambah-titik nonaktif) — pointer-events itu properti yang
       diwariskan, jadi harus di-override eksplisit di sini. */
    pointer-events: auto;
  }

  .point:active {
    cursor: grabbing;
  }

  .point-label {
    fill: white;
    font-size: 13px;
    font-weight: 800;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }

  .preview-ghost {
    position: absolute;
    width: 4%;
    left: 0;
    top: 0;
    opacity: 0;
    pointer-events: none;
    filter: drop-shadow(0 6px 10px rgba(2, 8, 20, 0.4));
  }

  .editor-panel {
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 50;
    width: 360px;
    max-height: calc(100vh - 16px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: rgba(8, 23, 41, 0.96);
    border: 1px solid var(--garis-buih);
    border-radius: var(--radius-s);
    box-shadow: var(--shadow-panel);
    color: var(--busa);
    font-size: 12.5px;
  }

  .editor-panel header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hint {
    color: var(--busa-redup);
    font-size: 11.5px;
    line-height: 1.4;
  }

  h4 {
    margin: 0 0 6px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--lampu);
  }

  .fac-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .fac-row {
    display: grid;
    grid-template-columns: 1.3fr 0.8fr 0.8fr 0.8fr;
    gap: 4px;
    align-items: center;
  }

  .decor-row {
    grid-template-columns: 1fr 0.7fr 0.7fr 0.7fr 0.7fr auto;
  }

  .fac-name {
    font-size: 11.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  label {
    display: flex;
    flex-direction: column;
    font-size: 10px;
    color: var(--busa-redup);
    gap: 2px;
  }

  label.chk {
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }

  input[type='number'] {
    width: 100%;
    padding: 3px 5px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--garis-buih);
    border-radius: 4px;
    color: var(--busa);
    font-size: 11.5px;
  }

  .veh-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }

  .add-veh {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .add-veh select {
    flex: 1;
    min-width: 120px;
    padding: 4px 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--garis-buih);
    border-radius: 4px;
    color: var(--busa);
    font-size: 11px;
  }

  .upload-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: 6px;
    border: 1px solid var(--garis-buih);
    background: rgba(255, 255, 255, 0.06);
    cursor: pointer;
  }

  .upload-btn input[type='file'] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .path-mode-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .veh-tab {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid var(--garis-buih);
    background: rgba(255, 255, 255, 0.05);
    font-size: 11px;
  }

  .veh-tab img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .veh-tab.vdisabled {
    opacity: 0.4;
  }

  .off-dot {
    color: var(--karang);
    font-size: 10px;
  }

  .veh-tab.vdisabled img {
    filter: grayscale(1);
  }

  .veh-tab.active {
    border-color: var(--lampu);
    background: rgba(245, 184, 65, 0.15);
  }

  .point-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .point-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: end;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .point-row label {
    width: 52px;
  }

  .point-row .chk {
    flex-direction: row;
    align-items: center;
    width: auto;
  }

  .timing-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
  }

  .action-row {
    display: flex;
    gap: 8px;
  }

  button {
    font-size: 11.5px;
    padding: 5px 9px;
    border-radius: 6px;
    border: 1px solid var(--garis-buih);
    background: rgba(255, 255, 255, 0.06);
    color: var(--busa);
  }

  .btn-save {
    font-weight: 700;
    color: var(--lampu-terang);
    border-color: var(--lampu);
    background: rgba(245, 184, 65, 0.12);
  }

  .status {
    font-size: 11.5px;
    font-weight: 700;
    padding: 6px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
  }

  .editor-panel footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
</style>
