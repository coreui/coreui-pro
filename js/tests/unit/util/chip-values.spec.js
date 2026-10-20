import {
  appendChipValues, getChipAnnouncement, getChipRemoveLabel, getChipValues, resolveChipClassName, splitChipText
} from '../../../src/util/chip-values.js'

describe('Chip value utilities', () => {
  describe('getChipValues', () => {
    it('should trim, drop the empty values and keep the first of each repeat', () => {
      expect(getChipValues([' apple ', '', 'banana', '  ', 'apple', 'banana '])).toEqual(['apple', 'banana'])
      expect(getChipValues([])).toEqual([])
    })

    it('should drop null and undefined, and turn other values into text', () => {
      expect(getChipValues(['apple', null, undefined, 42])).toEqual(['apple', '42'])
    })
  })

  describe('appendChipValues', () => {
    it('should add the new candidates in order, trimmed, and skip empty and known ones', () => {
      expect(appendChipValues(['apple'], [' banana', 'apple', '', 'cherry ', 'banana'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should stop at maxChips', () => {
      expect(appendChipValues(['apple'], ['banana', 'cherry', 'date'], 3)).toEqual(['apple', 'banana', 'cherry'])
      expect(appendChipValues(['apple'], ['apple', 'banana'], 2)).toEqual(['apple', 'banana'])
      expect(appendChipValues(['apple', 'banana'], ['cherry'], null)).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should add nothing when the list already holds maxChips values or more', () => {
      expect(appendChipValues(['apple', 'banana'], ['cherry'], 2)).toEqual(['apple', 'banana'])
      expect(appendChipValues(['apple', 'banana', 'cherry'], ['date', 'elder'], 1)).toEqual(['apple', 'banana', 'cherry'])
      expect(appendChipValues([], ['apple'], 0)).toEqual([])
    })

    it('should skip null and undefined candidates', () => {
      expect(appendChipValues(['apple'], [null, undefined, 'banana'])).toEqual(['apple', 'banana'])
    })

    it('should return a new list', () => {
      const values = ['apple']

      expect(appendChipValues(values, [])).not.toBe(values)
      expect(values).toEqual(['apple'])
    })
  })

  describe('splitChipText', () => {
    it('should split at every separator and keep the pieces untrimmed', () => {
      expect(splitChipText('apple, banana,', ',')).toEqual(['apple', ' banana', ''])
      expect(splitChipText('apple;banana', ';')).toEqual(['apple', 'banana'])
    })

    it('should give null when the text holds no separator or there is none', () => {
      expect(splitChipText('apple', ',')).toBeNull()
      expect(splitChipText('apple,banana', null)).toBeNull()
      expect(splitChipText('apple,banana', '')).toBeNull()
      expect(splitChipText('apple,banana')).toBeNull()
    })
  })

  describe('resolveChipClassName', () => {
    it('should give a class string as it is', () => {
      expect(resolveChipClassName('chip-primary', 'apple')).toBe('chip-primary')
    })

    it('should call a function with the value and keep only a string result', () => {
      expect(resolveChipClassName(value => `chip-${value}`, 'apple')).toBe('chip-apple')
      expect(resolveChipClassName(() => 42, 'apple')).toBe('')
      expect(resolveChipClassName(() => null, 'apple')).toBe('')
    })

    it('should give an empty string when there is no class', () => {
      expect(resolveChipClassName(null, 'apple')).toBe('')
      expect(resolveChipClassName(undefined, 'apple')).toBe('')
      expect(resolveChipClassName('', 'apple')).toBe('')
    })
  })

  describe('getChipAnnouncement', () => {
    it('should name every added value, in the order of the list', () => {
      expect(getChipAnnouncement(['a'], ['a', 'b'], 'added', 'removed')).toBe('b added')
      expect(getChipAnnouncement(['a'], ['c', 'a', 'b'], 'added', 'removed')).toBe('c, b added')
    })

    it('should name every removed value when none was added', () => {
      expect(getChipAnnouncement(['a', 'b', 'c'], ['b'], 'added', 'removed')).toBe('a, c removed')
    })

    it('should name only the added values when values were also removed', () => {
      expect(getChipAnnouncement(['a', 'b'], ['b', 'c'], 'added', 'removed')).toBe('c added')
    })

    it('should leave empty values out', () => {
      expect(getChipAnnouncement(['React'], [''], 'added', 'removed')).toBe('React removed')
      expect(getChipAnnouncement(['a'], ['a', '', 'b'], 'added', 'removed')).toBe('b added')
      expect(getChipAnnouncement(['a'], ['a', ''], 'added', 'removed')).toBeNull()
    })

    it('should name a value once, however many chips carry it', () => {
      expect(getChipAnnouncement([], ['a', 'a', 'b'], 'added', 'removed')).toBe('a, b added')
      expect(getChipAnnouncement(['a', 'a'], [], 'added', 'removed')).toBe('a removed')
      expect(getChipAnnouncement(['a'], ['a', 'a'], 'added', 'removed')).toBeNull()
    })

    it('should hand the values to a function label and use what it returns', () => {
      const added = values => `Dodano: ${values.join(' i ')}`
      const removed = values => `${values.length} removed`

      expect(getChipAnnouncement(['a'], ['a', 'b', 'c'], added, removed)).toBe('Dodano: b i c')
      expect(getChipAnnouncement(['a', 'b'], [], added, removed)).toBe('2 removed')
      expect(getChipAnnouncement([], ['a'], () => '', removed)).toBeNull()
    })

    it('should give null when nothing was added or removed', () => {
      expect(getChipAnnouncement(['a', 'b'], ['b', 'a'], 'added', 'removed')).toBeNull()
      expect(getChipAnnouncement([], [], 'added', 'removed')).toBeNull()
    })
  })

  describe('getChipRemoveLabel', () => {
    it.each([
      ['appends the label to a string without a placeholder', 'Remove', 'Remove React'],
      ['replaces every {label} in a string', 'Usuń {label} ({label})', 'Usuń React (React)'],
      ['passes the label to a function', label => `${label} entfernen`, 'React entfernen']
    ])('%s', (_, removeLabel, expected) => {
      expect(getChipRemoveLabel(removeLabel, 'React')).toBe(expected)
    })

    it('trims the name when the label is empty', () => {
      expect(getChipRemoveLabel('Remove', '')).toBe('Remove')
    })
  })
})
