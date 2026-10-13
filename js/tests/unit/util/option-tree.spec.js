import {
  filterOptionTree, findOptionByLabel, findOptionByValue, flattenOptions, getOptionLabel, getOptionValue, getSelectableOptions, isOptionDisabled,
  isOptionGroup, normalizeSearchText
} from '../../../src/util/option-tree.js'

describe('Option tree utilities', () => {
  const options = [
    'Plain',
    { label: 'Option 1', value: '1' },
    {
      label: 'Group',
      options: [
        { label: 'Option 2', value: 2 },
        { disabled: true, label: 'Option 3', value: '3' },
        { label: 'Inner', options: [{ label: 'Deep' }] }
      ]
    }
  ]

  describe('isOptionGroup', () => {
    it('should tell groups by their options array', () => {
      expect(isOptionGroup({ label: 'Group', options: [] })).toBeTrue()
      expect(isOptionGroup({ label: 'No options array' })).toBeFalse()
      expect(isOptionGroup({ label: 'Not an array', options: 'x' })).toBeFalse()
      expect(isOptionGroup('Plain')).toBeFalse()
      expect(isOptionGroup(null)).toBeFalse()
    })
  })

  describe('flattenOptions', () => {
    it('should replace every group, at any depth, with its options in order', () => {
      expect(flattenOptions(options).map(getOptionLabel)).toEqual(['Plain', 'Option 1', 'Option 2', 'Option 3', 'Deep'])
      expect(flattenOptions([])).toEqual([])
      expect(flattenOptions([{ label: 'Empty', options: [] }, 'A'])).toEqual(['A'])
    })
  })

  describe('getOptionLabel', () => {
    it('should read the label, the string itself for a plain option', () => {
      expect(getOptionLabel('Plain')).toBe('Plain')
      expect(getOptionLabel({ label: 'Option 1', value: '1' })).toBe('Option 1')
      expect(getOptionLabel({ value: '1' })).toBe('')
    })
  })

  describe('getOptionValue', () => {
    it('should read the value as a string, falling back to the label', () => {
      expect(getOptionValue('Plain')).toBe('Plain')
      expect(getOptionValue({ label: 'Option 2', value: 2 })).toBe('2')
      expect(getOptionValue({ label: 'Deep' })).toBe('Deep')
      expect(getOptionValue({ label: 'Zero', value: 0 })).toBe('0')
      expect(getOptionValue({ label: 'Null', value: null })).toBe('Null')
      expect(getOptionValue({})).toBe('')
    })
  })

  describe('isOptionDisabled', () => {
    it('should read disabled, never for a plain option', () => {
      expect(isOptionDisabled('Plain')).toBeFalse()
      expect(isOptionDisabled({ disabled: true, label: 'Off' })).toBeTrue()
      expect(isOptionDisabled({ label: 'On' })).toBeFalse()
    })
  })

  describe('getSelectableOptions', () => {
    it('should list the enabled options with the groups flattened', () => {
      expect(getSelectableOptions(options).map(getOptionLabel)).toEqual(['Plain', 'Option 1', 'Option 2', 'Deep'])
    })
  })

  describe('findOptionByValue', () => {
    it('should find the first option with the value, compared as text', () => {
      expect(findOptionByValue(options, '1')).toEqual({ label: 'Option 1', value: '1' })
      expect(findOptionByValue(options, 1)).toEqual({ label: 'Option 1', value: '1' })
      expect(findOptionByValue([{ label: 'One', value: 1 }], '1')).toEqual({ label: 'One', value: 1 })
      expect(findOptionByValue([{ label: 'A', value: 'x' }, { label: 'B', value: 'x' }], 'x')).toEqual({ label: 'A', value: 'x' })
    })

    it('should find an option without a value by its label, and a plain string option by itself', () => {
      expect(findOptionByValue(options, 'Deep')).toEqual({ label: 'Deep' })
      expect(findOptionByValue(options, 'Plain')).toBe('Plain')
    })

    it('should not match a label that differs from the value, nor a group', () => {
      expect(findOptionByValue(options, 'Option 1')).toBeNull()
      expect(findOptionByValue(options, 'Group')).toBeNull()
      expect(findOptionByValue(options, 'missing')).toBeNull()
    })

    it('should match the value exactly and find a disabled option', () => {
      expect(findOptionByValue([{ label: 'A', value: 'x' }], 'X')).toBeNull()
      expect(findOptionByValue([{ label: 'A', value: 'x' }], ' x ')).toBeNull()
      expect(findOptionByValue(options, '3')).toBe(options[2].options[1])
    })
  })

  describe('findOptionByLabel', () => {
    it('should find the first option with the label, ignoring case', () => {
      expect(findOptionByLabel(options, 'option 2')).toBe(options[2].options[0])
      expect(findOptionByLabel(options, 'PLAIN')).toBe('Plain')
      expect(findOptionByLabel(options, 'deep')).toEqual({ label: 'Deep' })
      expect(findOptionByLabel(options, 'option 3')).toBe(options[2].options[1])
      expect(findOptionByLabel(options, 'option')).toBeNull()
      expect(findOptionByLabel([' Apple '], 'apple')).toBe(' Apple ')
      expect(findOptionByLabel(['Apple'], '  APPLE ')).toBe('Apple')
      expect(findOptionByLabel([{ label: 'A', value: 1 }, { label: 'a', value: 2 }], 'a')).toEqual({ label: 'A', value: 1 })
    })

    it('should read the label only when there is an option to compare', () => {
      expect(findOptionByLabel([], null)).toBeNull()
    })

    it('should not match a group label', () => {
      expect(findOptionByLabel(options, 'Group')).toBeNull()
      expect(findOptionByLabel(options, 'Inner')).toBeNull()
    })
  })

  describe('normalizeSearchText', () => {
    it('should trim and lowercase, and remove combining accents only when asked', () => {
      expect(normalizeSearchText('  Café ')).toBe('café')
      expect(normalizeSearchText('  Café ', true)).toBe('cafe')
      expect(normalizeSearchText('Ångström', true)).toBe('angstrom')
      expect(normalizeSearchText('èç', true)).toBe('ec')
      expect(normalizeSearchText('が', true)).toBe('か')
      expect(normalizeSearchText('مُحَمَّد', true)).toBe('محمد')
      expect(normalizeSearchText('が')).toBe('が')
      expect(normalizeSearchText('c^2 ´x`', true)).toBe('c^2 ´x`')
      expect(normalizeSearchText('מִ', true)).toBe('מ')
      expect(normalizeSearchText('कि कु', true)).toBe('कि कु')
    })
  })

  describe('filterOptionTree', () => {
    it('should keep every option and drop only the empty groups for an empty or blank query', () => {
      expect(filterOptionTree(options, '')).toEqual(options)
      expect(filterOptionTree(options, '   ')).toEqual(options)
      expect(filterOptionTree([{ label: 'Empty', options: [] }, 'A'], '')).toEqual(['A'])
    })

    it('should keep the options whose label contains the query, trimmed and in any case', () => {
      expect(filterOptionTree(options, '  PLAIN ')).toEqual(['Plain'])
      expect(filterOptionTree(options, 'option 1')).toEqual([options[1]])
      expect(filterOptionTree(options, 'ption 2')).toEqual([{ label: 'Group', options: [options[2].options[0]] }])
    })

    it('should keep a group with the options of it that match, and drop it when none does', () => {
      const filtered = filterOptionTree(options, 'option 3')

      expect(filtered).toEqual([{ label: 'Group', options: [options[2].options[1]] }])
      expect(filtered[0]).not.toBe(options[2])
      expect(options[2].options).toHaveSize(3)
      expect(filterOptionTree(options, 'deep')).toEqual([{ label: 'Group', options: [{ label: 'Inner', options: [{ label: 'Deep' }] }] }])
      expect(filterOptionTree(options, 'group')).toEqual([])
    })

    it('should compare without accents only when asked', () => {
      expect(filterOptionTree(['Café', 'Tea'], 'cafe')).toEqual([])
      expect(filterOptionTree(['Café', 'Tea'], 'cafe', true)).toEqual(['Café'])
      expect(filterOptionTree(['Cafe'], 'café', true)).toEqual(['Cafe'])
    })
  })
})
