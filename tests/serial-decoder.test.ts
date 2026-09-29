import { describe, it, expect } from 'vitest';
import { decodeSerial } from '../src/lib/utils/serialDecoder';

describe('Serial Decoder Engine', () => {
  it('detects known counterfeit serial numbers', () => {
    const res = decodeSerial('017160628', 'gibson');
    expect(res.counterfeitRisk).toBe('High (Known Fake Serial)');
    expect(res.notes).toContain('counterfeit');
  });

  it('decodes modern standard 8-digit Gibson serials (YDDDYRRR)', () => {
    // 92357412 -> Year 1997, Day 235 (Aug 23), Factory Nashville (412 >= 300)
    const res = decodeSerial('92357412', 'gibson');
    expect(res.year).toContain('1997');
    expect(res.factory).toContain('Nashville');
    expect(res.counterfeitRisk).toBe('Low');
  });

  it('decodes modern standard 9-digit Gibson serials (YDDDYBRRR)', () => {
    // 012350412 -> Year 2005, Day 123, Batch 0, Nashville
    const res = decodeSerial('012350412', 'gibson');
    expect(res.year).toContain('2005');
    expect(res.factory).toContain('Nashville');
  });

  it('decodes modern USA Fender serials (US + 2 digits)', () => {
    // US21045892 -> Year 2021, Corona CA
    const res = decodeSerial('US21045892', 'fender');
    expect(res.year).toBe('2021');
    expect(res.factory).toContain('Corona');
  });

  it('decodes vintage Corona Fender serials (V + 5-6 digits)', () => {
    const res = decodeSerial('V123456', 'fender');
    expect(res.factory).toContain('Corona');
  });

  it('decodes Ensenada Mexico Fender serials (MZ, MX)', () => {
    const res = decodeSerial('MX18049281', 'fender');
    expect(res.year).toBe('2018');
    expect(res.factory).toContain('Ensenada');
  });

  it('decodes Martin sequential serials', () => {
    // Serial 2000000 -> 2020
    const res = decodeSerial('2000000', 'martin');
    expect(res.year).toContain('2020');
    expect(res.factory).toContain('Nazareth');
  });

  it('decodes Fujigen Japan Ibanez serials (F + 7 digits)', () => {
    // F2012345 -> FujiGen Gakki, Japan, 2020
    const res = decodeSerial('F2012345', 'ibanez');
    expect(res.factory).toContain('Fujigen');
    expect(res.year).toBe('2020');
  });
});
