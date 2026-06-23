export const tarotImageMap: Record<string, any> = {
  ar00: require('../../assets/tarot/ar00.jpg'),
  ar01: require('../../assets/tarot/ar01.jpg'),
  ar02: require('../../assets/tarot/ar02.jpg'),
  ar03: require('../../assets/tarot/ar03.jpg'),
  ar04: require('../../assets/tarot/ar04.jpg'),
  ar05: require('../../assets/tarot/ar05.jpg'),
  ar06: require('../../assets/tarot/ar06.jpg'),
  ar07: require('../../assets/tarot/ar07.jpg'),
  ar08: require('../../assets/tarot/ar08.jpg'),
  ar09: require('../../assets/tarot/ar09.jpg'),
  ar10: require('../../assets/tarot/ar10.jpg'),
  ar11: require('../../assets/tarot/ar11.jpg'),
  ar12: require('../../assets/tarot/ar12.jpg'),
  ar13: require('../../assets/tarot/ar13.jpg'),
  ar14: require('../../assets/tarot/ar14.jpg'),
  ar15: require('../../assets/tarot/ar15.jpg'),
  ar16: require('../../assets/tarot/ar16.jpg'),
  ar17: require('../../assets/tarot/ar17.jpg'),
  ar18: require('../../assets/tarot/ar18.jpg'),
  ar19: require('../../assets/tarot/ar19.jpg'),
  ar20: require('../../assets/tarot/ar20.jpg'),
  ar21: require('../../assets/tarot/ar21.jpg'),

  cuac: require('../../assets/tarot/cuac.jpg'),
  cu02: require('../../assets/tarot/cu02.jpg'),
  cu03: require('../../assets/tarot/cu03.jpg'),
  cu04: require('../../assets/tarot/cu04.jpg'),
  cu05: require('../../assets/tarot/cu05.jpg'),
  cu06: require('../../assets/tarot/cu06.jpg'),
  cu07: require('../../assets/tarot/cu07.jpg'),
  cu08: require('../../assets/tarot/cu08.jpg'),
  cu09: require('../../assets/tarot/cu09.jpg'),
  cu10: require('../../assets/tarot/cu10.jpg'),
  cupa: require('../../assets/tarot/cupa.jpg'),
  cukn: require('../../assets/tarot/cukn.jpg'),
  cuqu: require('../../assets/tarot/cuqu.jpg'),
  cuki: require('../../assets/tarot/cuki.jpg'),

  swac: require('../../assets/tarot/swac.jpg'),
  sw02: require('../../assets/tarot/sw02.jpg'),
  sw03: require('../../assets/tarot/sw03.jpg'),
  sw04: require('../../assets/tarot/sw04.jpg'),
  sw05: require('../../assets/tarot/sw05.jpg'),
  sw06: require('../../assets/tarot/sw06.jpg'),
  sw07: require('../../assets/tarot/sw07.jpg'),
  sw08: require('../../assets/tarot/sw08.jpg'),
  sw09: require('../../assets/tarot/sw09.jpg'),
  sw10: require('../../assets/tarot/sw10.jpg'),
  swpa: require('../../assets/tarot/swpa.jpg'),
  swkn: require('../../assets/tarot/swkn.jpg'),
  swqu: require('../../assets/tarot/swqu.jpg'),
  swki: require('../../assets/tarot/swki.jpg'),

  waac: require('../../assets/tarot/waac.jpg'),
  wa02: require('../../assets/tarot/wa02.jpg'),
  wa03: require('../../assets/tarot/wa03.jpg'),
  wa04: require('../../assets/tarot/wa04.jpg'),
  wa05: require('../../assets/tarot/wa05.jpg'),
  wa06: require('../../assets/tarot/wa06.jpg'),
  wa07: require('../../assets/tarot/wa07.jpg'),
  wa08: require('../../assets/tarot/wa08.jpg'),
  wa09: require('../../assets/tarot/wa09.jpg'),
  wa10: require('../../assets/tarot/wa10.jpg'),
  wapa: require('../../assets/tarot/wapa.jpg'),
  wakn: require('../../assets/tarot/wakn.jpg'),
  waqu: require('../../assets/tarot/waqu.jpg'),
  waki: require('../../assets/tarot/waki.jpg'),

  peac: require('../../assets/tarot/peac.jpg'),
  pe02: require('../../assets/tarot/pe02.jpg'),
  pe03: require('../../assets/tarot/pe03.jpg'),
  pe04: require('../../assets/tarot/pe04.jpg'),
  pe05: require('../../assets/tarot/pe05.jpg'),
  pe06: require('../../assets/tarot/pe06.jpg'),
  pe07: require('../../assets/tarot/pe07.jpg'),
  pe08: require('../../assets/tarot/pe08.jpg'),
  pe09: require('../../assets/tarot/pe09.jpg'),
  pe10: require('../../assets/tarot/pe10.jpg'),
  pepa: require('../../assets/tarot/pepa.jpg'),
  pekn: require('../../assets/tarot/pekn.jpg'),
  pequ: require('../../assets/tarot/pequ.jpg'),
  peki: require('../../assets/tarot/peki.jpg'),
};

const numNames = ['ac','02','03','04','05','06','07','08','09','10','pa','kn','qu','ki'];
const suitCodes: Record<string, string> = {
  wands: 'wa', cups: 'cu', swords: 'sw', pentacles: 'pe',
};

export function getImageFile(cardType: 'major' | 'minor', imgIdx: number, suit?: string, number?: number): string | null {
  if (cardType === 'major') {
    return `ar${String(imgIdx).padStart(2, '0')}`;
  }
  if (suit && number && suitCodes[suit]) {
    return `${suitCodes[suit]}${numNames[number - 1]}`;
  }
  return null;
}
