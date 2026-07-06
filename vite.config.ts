import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface TrafficPointPayload {
  x: number;
  y: number;
  pauseMs?: number;
  flipAfter?: boolean;
  rotateDeg?: number;
}

interface TrafficVehiclePayload {
  id: string;
  sprite: string;
  width: number;
  cycleMs: number;
  driveMs: number;
  delayMs: number;
  bob?: boolean;
  enabled?: boolean;
  points: TrafficPointPayload[];
}

interface DecorItemPayload {
  id: string;
  sprite: string;
  x: number;
  y: number;
  w: number;
  rotateDeg?: number;
}

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : ({} as T));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function generateTrafficFile(vehicles: TrafficVehiclePayload[]): string {
  const lines: string[] = [
    `import type { TrafficVehicle } from '../types';`,
    '',
    `const IMG = './assets/images';`,
    '',
    '/**',
    ' * Dekorasi ambient yang bergerak sendiri di peta (mobil + kapal kargo).',
    ' * Ditulis otomatis oleh "🛠️ Edit Tata Letak" (lihat LayoutEditor.svelte) —',
    ' * jangan diedit dengan tangan, perubahan akan tertimpa saat disimpan lagi',
    ' * lewat tool tersebut. Buka mode edit itu untuk mengubah jalurnya.',
    ' */',
    'export const TRAFFIC: TrafficVehicle[] = [',
  ];
  for (const v of vehicles) {
    const spriteRest = v.sprite.replace('./assets/images/', '');
    lines.push('  {');
    lines.push(`    id: '${v.id}',`);
    lines.push(`    sprite: \`\${IMG}/${spriteRest}\`,`);
    lines.push(`    width: ${v.width},`);
    lines.push(`    cycleMs: ${v.cycleMs},`);
    lines.push(`    driveMs: ${v.driveMs},`);
    lines.push(`    delayMs: ${v.delayMs},`);
    if (v.bob) lines.push(`    bob: true,`);
    if (v.enabled === false) lines.push(`    enabled: false,`);
    lines.push(`    points: [`);
    for (const p of v.points) {
      const extras: string[] = [];
      if (p.pauseMs) extras.push(`pauseMs: ${p.pauseMs}`);
      if (p.flipAfter) extras.push(`flipAfter: true`);
      if (p.rotateDeg) extras.push(`rotateDeg: ${p.rotateDeg}`);
      lines.push(`      { x: ${p.x}, y: ${p.y}${extras.length ? ', ' + extras.join(', ') : ''} },`);
    }
    lines.push(`    ],`);
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

function generateDecorFile(items: DecorItemPayload[]): string {
  const lines: string[] = [
    `import type { DecorItem } from '../types';`,
    '',
    '/**',
    ' * Aset hias statis di peta (bangunan tambahan, orang, properti dekoratif).',
    ' * Ditulis otomatis oleh "🛠️ Edit Tata Letak" (lihat LayoutEditor.svelte) —',
    ' * jangan diedit dengan tangan, perubahan akan tertimpa saat disimpan lagi',
    ' * lewat tool tersebut.',
    ' */',
    'export const DECOR: DecorItem[] = [',
  ];
  for (const d of items) {
    const extras: string[] = [];
    if (d.rotateDeg) extras.push(`rotateDeg: ${d.rotateDeg}`);
    lines.push(
      `  { id: '${d.id}', sprite: '${d.sprite}', x: ${d.x}, y: ${d.y}, w: ${d.w}${extras.length ? ', ' + extras.join(', ') : ''} },`,
    );
  }
  lines.push('];');
  lines.push('');
  return lines.join('\n');
}

/**
 * Endpoint dev-only untuk "🛠️ Edit Tata Letak" di GameScreen.svelte: menulis
 * hasil seret-menyeret bangunan/jalur kendaraan/dekorasi langsung ke
 * facilities.ts, traffic.ts, dan decor.ts. Hanya aktif saat `npm run dev` —
 * tidak pernah ikut ter-bundle ke build produksi.
 */
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;
/** Nama file aman: huruf/angka/strip/underscore + satu ekstensi gambar. Tanpa ini,
 * nama file dari unggahan bisa dipakai untuk keluar dari folder images/ (path traversal). */
const SAFE_FILENAME = /^[a-zA-Z0-9_-]+\.(png|jpe?g|webp|gif|svg)$/i;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function layoutEditorPlugin(): Plugin {
  const facilitiesPath = path.resolve(process.cwd(), 'src/lib/data/facilities.ts');
  const trafficPath = path.resolve(process.cwd(), 'src/lib/data/traffic.ts');
  const decorPath = path.resolve(process.cwd(), 'src/lib/data/decor.ts');
  const imagesDir = path.resolve(process.cwd(), 'public/assets/images');

  function respondJson(res: ServerResponse, code: number, message: string) {
    res.statusCode = code;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(message);
  }

  function respondData(res: ServerResponse, code: number, data: unknown) {
    res.statusCode = code;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
  }

  return {
    name: 'layout-editor-dev-endpoints',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__editor/facilities', async (req, res) => {
        if (req.method !== 'POST') return respondJson(res, 405, 'method not allowed');
        try {
          const body = await readJsonBody<Record<string, { x: number; y: number; w: number }>>(req);
          let src = fs.readFileSync(facilitiesPath, 'utf-8');
          for (const [id, pos] of Object.entries(body)) {
            const re = new RegExp(
              `(id:\\s*'${id}'[\\s\\S]*?pos:\\s*\\{\\s*x:\\s*)-?[\\d.]+(,\\s*y:\\s*)-?[\\d.]+(,\\s*w:\\s*)-?[\\d.]+(\\s*\\})`,
            );
            if (!re.test(src)) throw new Error(`fasilitas '${id}' tidak ditemukan di facilities.ts`);
            src = src.replace(re, `$1${pos.x}$2${pos.y}$3${pos.w}$4`);
          }
          fs.writeFileSync(facilitiesPath, src);
          respondJson(res, 200, 'ok');
        } catch (e) {
          respondJson(res, 500, String(e));
        }
      });

      server.middlewares.use('/__editor/traffic', async (req, res) => {
        if (req.method !== 'POST') return respondJson(res, 405, 'method not allowed');
        try {
          const vehicles = await readJsonBody<TrafficVehiclePayload[]>(req);
          fs.writeFileSync(trafficPath, generateTrafficFile(vehicles));
          respondJson(res, 200, 'ok');
        } catch (e) {
          respondJson(res, 500, String(e));
        }
      });

      server.middlewares.use('/__editor/decor', async (req, res) => {
        if (req.method !== 'POST') return respondJson(res, 405, 'method not allowed');
        try {
          const items = await readJsonBody<DecorItemPayload[]>(req);
          fs.writeFileSync(decorPath, generateDecorFile(items));
          respondJson(res, 200, 'ok');
        } catch (e) {
          respondJson(res, 500, String(e));
        }
      });

      server.middlewares.use('/__editor/sprites', (req, res) => {
        if (req.method !== 'GET') return respondJson(res, 405, 'method not allowed');
        try {
          const files = fs.readdirSync(imagesDir).filter((f) => IMAGE_EXT.test(f));
          respondData(res, 200, files);
        } catch (e) {
          respondJson(res, 500, String(e));
        }
      });

      server.middlewares.use('/__editor/upload-sprite', async (req, res) => {
        if (req.method !== 'POST') return respondJson(res, 405, 'method not allowed');
        try {
          const body = await readJsonBody<{ filename: string; dataUrl: string }>(req);
          const match = /^data:image\/[a-zA-Z+.-]+;base64,(.+)$/.exec(body.dataUrl ?? '');
          if (!match) throw new Error('format gambar tidak dikenali (harus data URL base64)');
          const buffer = Buffer.from(match[1], 'base64');
          if (buffer.byteLength > MAX_UPLOAD_BYTES) throw new Error('gambar terlalu besar (maks 8MB)');

          const ext = (body.filename.match(IMAGE_EXT)?.[0] ?? '.png').toLowerCase();
          const stem = (path.basename(body.filename, path.extname(body.filename)) || 'aset')
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'aset';

          let filename = `${stem}${ext}`;
          let n = 1;
          while (!SAFE_FILENAME.test(filename) || fs.existsSync(path.join(imagesDir, filename))) {
            filename = `${stem}-${n++}${ext}`;
          }
          fs.writeFileSync(path.join(imagesDir, filename), buffer);
          respondData(res, 200, { filename });
        } catch (e) {
          respondJson(res, 500, String(e));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [svelte(), layoutEditorPlugin()],
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 8192,
  },
});
