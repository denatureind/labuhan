import type { Npc, NpcId } from '../types';

export const NPCS: Record<NpcId, Npc> = {
  'pak-hendra': {
    id: 'pak-hendra',
    name: 'Pak Hendra',
    role: 'Pengusaha Lokal',
    color: '#e8a33d',
    icon: '💼',
  },
  'mbok-sari': {
    id: 'mbok-sari',
    name: 'Mbok Sari',
    role: 'Sesepuh Nelayan',
    color: '#5fb573',
    icon: '🐟',
  },
  'dr-laut': {
    id: 'dr-laut',
    name: 'Dr. Laut',
    role: 'Ilmuwan Kelautan',
    color: '#4db8d4',
    icon: '🔬',
  },
  petugas: {
    id: 'petugas',
    name: 'Petugas Pelabuhan',
    role: 'Staf Operasional',
    color: '#8b9bb4',
    icon: '📋',
  },
  warga: {
    id: 'warga',
    name: 'Warga Pesisir',
    role: 'Kampung Muara',
    color: '#c98fd6',
    icon: '🏘️',
  },
  narator: {
    id: 'narator',
    name: 'Muara Harapan',
    role: '',
    color: '#7ba7d9',
    icon: '⚓',
  },
};
