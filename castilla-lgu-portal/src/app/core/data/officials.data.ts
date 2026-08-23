import { Official } from '../models/official.model';

// Elected officials for the 2025–2028 term, sourced 2026-08-23 from the
// 2025 local election results (Rappler's live results page, cross-checked
// against Wikipedia's "Castilla, Sorsogon" infobox and a BicolTV Facebook
// congratulatory post naming the same winners). See SB_EXOFFICIO_MEMBERS
// below for the two ex-officio seats.
export const MAYOR: Official = {
  name: 'Isagani "Bong" B. Mendoza',
  position: 'Municipal Mayor',
  office: 'Office of the Municipal Mayor',
  initials: 'IM',
  isPlaceholder: false,
};

export const VICE_MAYOR: Official = {
  name: 'Jesus "Boy" Agarap',
  position: 'Municipal Vice Mayor',
  office: 'Office of the Municipal Vice Mayor',
  initials: 'JA',
  isPlaceholder: false,
};

// "Kap Luna Luna" and "Kap Budoy Mirandilla" are reported this way in every
// source found (ballot/press name, "Kap" denoting a sitting or former
// barangay captain) — their full legal given names weren't found and
// aren't invented here.
export const SB_MEMBERS: Official[] = [
  {
    name: 'Camille Mendoza',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'CM',
    isPlaceholder: false,
  },
  {
    name: 'Vicente Manata',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'VM',
    isPlaceholder: false,
  },
  {
    name: 'Erick Navas',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'EN',
    isPlaceholder: false,
  },
  {
    name: 'Joel Agripa',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'JA',
    isPlaceholder: false,
  },
  {
    name: 'Allan Canon',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'AC',
    isPlaceholder: false,
  },
  {
    name: 'Kap Luna Luna',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'LL',
    isPlaceholder: false,
  },
  {
    name: 'Kap Budoy Mirandilla',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'BM',
    isPlaceholder: false,
  },
  {
    name: 'Ian Llona',
    position: 'Sangguniang Bayan Member',
    office: 'Sangguniang Bayan',
    initials: 'IL',
    isPlaceholder: false,
  },
];

export const SB_EXOFFICIO_MEMBERS: Official[] = [
  {
    // Every source found names only the *provincial*-level ABC President
    // (a different office) — Castilla's own municipal-chapter president
    // wasn't identified, so this stays unconfirmed rather than risk
    // attributing the wrong office to a real person.
    name: 'Name pending confirmation',
    position: 'ABC President (Liga ng mga Barangay)',
    office: 'Sangguniang Bayan',
    initials: 'LB',
    isPlaceholder: true,
  },
  {
    // Sourced 2026-08-23: Brigada News (Nov 15, 2023 election), with
    // continuity through 2025 in municipal SK documents and a 2025
    // Binibining Castilla proposal bearing Mayor Mendoza's approval. A
    // 2026 SB roster would be the ideal freshness check, but this is
    // well-corroborated across independent sources through 2025.
    name: 'Hon. Ronard L. Lladones',
    position: 'SK Federation President',
    office: 'Sangguniang Bayan',
    initials: 'RL',
    isPlaceholder: false,
  },
];
