import { background } from './BackgroundsByType';
import { PokeType } from '../interfaces/types';

describe('BackgroundsByType', () => {
  it('should return correct color for normal type', () => {
    expect(background.normal).toBe('#AAA67F');
  });

  it('should have colors for all defined types', () => {
    const allTypes: PokeType[] = [
      'normal', 'fighting', 'flying', 'ground', 'poison',
      'rock', 'bug', 'ghost', 'steel', 'fire', 'water',
      'grass', 'electric', 'psychic', 'ice', 'dragon',
      'dark', 'fairy', 'unknown', 'shadow'
    ] as unknown as PokeType[];

    allTypes.forEach(type => {
      expect(background[type as unknown as keyof typeof background]).toBeDefined();
      expect(background[type as unknown as keyof typeof background]).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});