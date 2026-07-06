import { FACILITIES } from '../data/facilities';
import { TRAFFIC } from '../data/traffic';
import { DECOR } from '../data/decor';
import type { FacilityDef, TrafficVehicle, DecorItem } from '../types';

/**
 * State untuk "🛠️ Edit Tata Letak" (hanya aktif saat `npm run dev`).
 * `facilities`/`vehicles`/`decor` adalah salinan kerja (bukan data asli) —
 * supaya bisa diseret/diedit bebas dan hanya benar-benar tertulis ke file
 * saat tombol Simpan ditekan. Lihat LayoutEditor.svelte untuk UI-nya, dan
 * vite.config.ts untuk endpoint yang menulis ke facilities.ts/traffic.ts/decor.ts.
 *
 * Menulis file lewat endpoint itu memicu Vite HMR, yang di proyek ini
 * ujung-ujungnya me-remount seluruh App (kembali ke layar judul) — bukan
 * cuma modul yang berubah. Daripada melawan itu, draf disimpan ke
 * sessionStorage lalu halaman dimuat ulang dengan sengaja setelah Simpan:
 * hasilnya lebih pasti (memuat file yang benar-benar baru) dan draf +
 * status tersimpan otomatis dipulihkan setelahnya. Lihat App.svelte untuk
 * kode yang melanjutkan permainan otomatis setelah reload.
 */
const DRAFT_KEY = 'ph-editor-draft-v2';
const JUST_SAVED_KEY = 'ph-editor-just-saved';
export const RELOAD_FLAG_KEY = 'ph-editor-reload';

interface Draft {
  active: boolean;
  facilities: FacilityDef[];
  vehicles: TrafficVehicle[];
  decor: DecorItem[];
  selectedVehicleId: string | null;
}

function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

const draft = loadDraft();
const justSaved = sessionStorage.getItem(JUST_SAVED_KEY);
sessionStorage.removeItem(JUST_SAVED_KEY);

/**
 * Kendaraan bawaan game (dibaca dari traffic.ts SAAT MODUL INI PERTAMA KALI
 * dimuat, sebelum ada penambahan apa pun) tidak boleh dihapus lewat editor —
 * cuma bisa dinonaktifkan. Ini menutup celah yang pernah membuat "kargo"
 * (elemen game asli, kapal yang singgah ke dermaga) terhapus tak sengaja
 * lewat tombol 🗑️ yang tadinya sama-sama berlaku untuk kendaraan bawaan
 * maupun kendaraan yang baru ditambahkan sendiri.
 */
const BUILTIN_VEHICLE_IDS = new Set(TRAFFIC.map((v) => v.id));

const SAVE_LABEL: Record<string, string> = {
  facilities: '✅ Posisi bangunan tersimpan ke facilities.ts',
  traffic: '✅ Jalur kendaraan tersimpan ke traffic.ts',
  decor: '✅ Dekorasi tersimpan ke decor.ts',
};

class LayoutEditorStore {
  active = $state(draft?.active ?? false);
  facilities = $state<FacilityDef[]>(draft?.facilities ?? cloneFacilities());
  vehicles = $state<TrafficVehicle[]>(draft?.vehicles ?? cloneVehicles());
  decor = $state<DecorItem[]>(draft?.decor ?? cloneDecor());
  selectedVehicleId = $state<string | null>(draft?.selectedVehicleId ?? null);
  status = $state(justSaved ? (SAVE_LABEL[justSaved] ?? '') : '');
  /** Nama file gambar yang sudah ada di public/assets/images/, diisi oleh loadSprites(). */
  availableSprites = $state<string[]>([]);

  get selectedVehicle(): TrafficVehicle | null {
    return this.vehicles.find((v) => v.id === this.selectedVehicleId) ?? null;
  }

  isBuiltinVehicle(id: string): boolean {
    return BUILTIN_VEHICLE_IDS.has(id);
  }

  async loadSprites() {
    try {
      const res = await fetch('/__editor/sprites');
      if (res.ok) this.availableSprites = await res.json();
    } catch {
      // diam saja — daftar aset cuma kemudahan, bukan hal wajib.
    }
  }

  /** Tambah kendaraan/kapal baru pakai gambar yang sudah ada di public/assets/images/. */
  addVehicle(spriteFilename: string) {
    const id = nextId(this.vehicles, 'custom');
    const vehicle: TrafficVehicle = {
      id,
      sprite: `./assets/images/${spriteFilename}`,
      width: 4,
      cycleMs: 50000,
      driveMs: 28000,
      delayMs: 0,
      points: [
        { x: 45, y: 45 },
        { x: 55, y: 55 },
      ],
    };
    this.vehicles = [...this.vehicles, vehicle];
    this.selectedVehicleId = id;
  }

  removeVehicle(id: string) {
    if (BUILTIN_VEHICLE_IDS.has(id)) {
      this.status = `❌ "${id}" bagian dari game bawaan, tidak bisa dihapus — nonaktifkan saja lewat tombol Aktif.`;
      return;
    }
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
    if (this.selectedVehicleId === id) this.selectedVehicleId = null;
  }

  /** Tambah aset hias statis baru (bangunan tambahan, orang, properti) di tengah peta. */
  addDecor(spriteFilename: string) {
    const id = nextId(this.decor, 'dekor');
    const item: DecorItem = { id, sprite: `./assets/images/${spriteFilename}`, x: 50, y: 50, w: 8 };
    this.decor = [...this.decor, item];
  }

  removeDecor(id: string) {
    this.decor = this.decor.filter((d) => d.id !== id);
  }

  /** Unggah gambar baru ke public/assets/images/ lewat endpoint dev. Mengembalikan nama file bila berhasil. */
  async uploadSprite(file: File): Promise<string | null> {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const res = await fetch('/__editor/upload-sprite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      if (!res.ok) {
        this.status = `❌ Gagal mengunggah gambar (${res.status})`;
        return null;
      }
      const { filename } = (await res.json()) as { filename: string };
      await this.loadSprites();
      return filename;
    } catch {
      this.status = '❌ Tidak bisa menghubungi server dev (npm run dev jalan?)';
      return null;
    }
  }

  /** Buang semua perubahan yang belum disimpan, kembali ke data file saat ini. */
  reset() {
    this.facilities = cloneFacilities();
    this.vehicles = cloneVehicles();
    this.decor = cloneDecor();
    this.status = 'Dikembalikan ke data tersimpan.';
  }

  #persistDraft() {
    const snapshot: Draft = {
      active: this.active,
      facilities: this.facilities,
      vehicles: this.vehicles,
      decor: this.decor,
      selectedVehicleId: this.selectedVehicleId,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
  }

  async #saveTo(endpoint: string, key: string, body: unknown): Promise<void> {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        this.status = `❌ Gagal menyimpan (${res.status})`;
        return;
      }
      this.#persistDraft();
      sessionStorage.setItem(JUST_SAVED_KEY, key);
      sessionStorage.setItem(RELOAD_FLAG_KEY, '1');
      location.reload();
    } catch {
      this.status = '❌ Tidak bisa menghubungi server dev (npm run dev jalan?)';
    }
  }

  async saveFacilities() {
    const payload: Record<string, { x: number; y: number; w: number }> = {};
    for (const f of this.facilities) payload[f.id] = f.pos;
    await this.#saveTo('/__editor/facilities', 'facilities', payload);
  }

  async saveTraffic() {
    await this.#saveTo('/__editor/traffic', 'traffic', this.vehicles);
  }

  async saveDecor() {
    await this.#saveTo('/__editor/decor', 'decor', this.decor);
  }
}

function nextId(list: { id: string }[], prefix: string): string {
  let n = 1;
  while (list.some((x) => x.id === `${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

function cloneFacilities(): FacilityDef[] {
  return FACILITIES.map((f) => ({ ...f, pos: { ...f.pos } }));
}

function cloneVehicles(): TrafficVehicle[] {
  return TRAFFIC.map((v) => ({ ...v, points: v.points.map((p) => ({ ...p })) }));
}

function cloneDecor(): DecorItem[] {
  return DECOR.map((d) => ({ ...d }));
}

export const layoutEditor = new LayoutEditorStore();
