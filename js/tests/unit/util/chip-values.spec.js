import {
  appendChipValues, getChipAnnouncement, getChipRemoveLabel, getChipValues, getNewChipPieces, removeChipText, resolveChipClassName, takeAcceptedChipText, withoutEach, splitChipText
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

    it('keeps replacement patterns in the label as they are', () => {
      expect(getChipRemoveLabel('Remove {label}', 'Q$&A $$')).toBe('Remove Q$&A $$')
    })

    it('trims the name when the label is empty', () => {
      expect(getChipRemoveLabel('Remove', '')).toBe('Remove')
    })
  })

  describe('removeChipText', () => {
    it('should take out the pieces that became chips with their separators', () => {
      expect(removeChipText('a,b,c', ['a', 'c'], ',')).toBe('b')
      expect(removeChipText('a,', ['a'], ',')).toBe('')
    })

    it('should take a repeated piece out once', () => {
      expect(removeChipText('a,a', ['a'], ',')).toBe('a')
    })

    it('should compare without the spaces around a piece', () => {
      expect(removeChipText(' a ,b', ['a'], ',')).toBe('b')
    })

    it('should treat the whole text as one piece without a separator', () => {
      expect(removeChipText('a,b', ['a,b'], null)).toBe('')
    })

    it('should leave nothing for blank pieces and keep the piece being typed', () => {
      expect(removeChipText(',', [], ',')).toBe('')
      expect(removeChipText('a, ,b', ['a'], ',')).toBe('b')
      expect(removeChipText('no,', [], ',')).toBe('no,')
    })
  })

  describe('withoutEach', () => {
    it('should take each value out once', () => {
      expect(withoutEach(['a', 'a', 'b'], ['a'])).toEqual(['a', 'b'])
    })

    it('should compare what read returns', () => {
      expect(withoutEach([' a ', 'b'], ['a'], piece => piece.trim())).toEqual(['b'])
    })
  })

  describe('getNewChipPieces', () => {
    it('should return the pieces a new separator completed', () => {
      expect(getNewChipPieces('a,b,', '', ',')).toEqual(['a', 'b'])
    })

    it('should skip a piece that was complete before', () => {
      expect(getNewChipPieces('no,a,', 'no,a', ',')).toEqual(['a'])
      expect(getNewChipPieces('a,a,', 'a,', ',')).toEqual(['a'])
    })

    it('should complete nothing without a new separator', () => {
      expect(getNewChipPieces('V,', 'React,', ',')).toEqual([])
      expect(getNewChipPieces('ab', 'a', ',')).toEqual([])
      expect(getNewChipPieces('a,', '', null)).toEqual([])
    })
  })

  describe('takeAcceptedChipText', () => {
    it('should take the texts found among the new values', () => {
      expect(takeAcceptedChipText(['a', 'b'], [], ['b'])).toEqual(['b'])
    })

    it('should match a value the page changed the letter case of', () => {
      expect(takeAcceptedChipText(['Foo', 'Bar'], ['x'], ['x', 'foo'])).toEqual(['Foo'])
    })

    it('should not take a request for a value from somewhere else', () => {
      expect(takeAcceptedChipText(['bad'], [], ['other'])).toEqual([])
    })

    it('should take nothing when no value is new', () => {
      expect(takeAcceptedChipText(['a'], ['x'], ['x'])).toEqual([])
      expect(takeAcceptedChipText(['x'], ['x'], ['x'])).toEqual([])
    })
  })
})
