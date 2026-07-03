// ============================================================
// PELABUHAN HIJAU v3 — SkillSystem
// Mengelola skill aktif karakter dan perhitungan waktu cooldown
// ============================================================

import type { Resources, Skill, KarakterId } from '../types/index';
import { getKarakter } from '../data/characters';

const DAFTAR_SKILL: Record<string, Skill> = {
  musyawarah_nelayan: {
    id: 'musyawarah_nelayan',
    nama: 'Musyawarah Nelayan',
    deskripsi: 'Mendamaikan konflik dan merangkul warga. (+20 Komunitas, +10 Lingkungan)',
    cooldownHari: 5,
    effect: { komunitas: 20, lingkungan: 10 }
  },
  kampanye_reputasi: {
    id: 'kampanye_reputasi',
    nama: 'Kampanye Reputasi',
    deskripsi: 'Memperbaiki citra pelabuhan di mata publik. (+25 Reputasi, -10 Dana)',
    cooldownHari: 4,
    effect: { reputasi: 25, dana: -10 },
    syarat: { dana: 10 } // Butuh minimal 10 dana untuk kampanye
  },
  negosiasi_kontrak: {
    id: 'negosiasi_kontrak',
    nama: 'Negosiasi Kontrak',
    deskripsi: 'Mendapatkan suntikan dana cepat dari investor. (+40 Dana, -15 Reputasi)',
    cooldownHari: 6,
    effect: { dana: 40, reputasi: -15 }
  }
};

export class SkillSystem {
  private skillId: string;
  private cooldownSisa: number = 0;

  constructor(karakterId: KarakterId) {
    const karakter = getKarakter(karakterId);
    this.skillId = karakter.skillId;
  }

  getSkill(): Skill {
    return DAFTAR_SKILL[this.skillId];
  }

  tickHari(): void {
    if (this.cooldownSisa > 0) this.cooldownSisa--;
  }

  alasanTidakBisa(resources: Resources): string | null {
    if (this.cooldownSisa > 0) return `Cooldown: ${this.cooldownSisa} hari`;
    const skill = this.getSkill();
    if (skill.syarat) {
      for (const [key, value] of Object.entries(skill.syarat)) {
        if (resources[key as keyof Resources] < (value as number)) {
          return `${key.charAt(0).toUpperCase() + key.slice(1)} tidak cukup`;
        }
      }
    }
    return null;
  }

  aktifkan(resources: Resources): Partial<Resources> | null {
    if (this.alasanTidakBisa(resources)) return null;
    this.cooldownSisa = this.getSkill().cooldownHari;
    return this.getSkill().effect;
  }
}