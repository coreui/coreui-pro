import {
  findOptionByLabel, flattenOptions, getOptionLabel, getOptionValue, getSelectableOptions, isOptionDisabled, isOptionGroup
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

  describe('findOptionByLabel', () => {
    it('should find the first option with the label, ignoring case', () => {
      expect(findOptionByLabel(options, 'option 2')).toBe(options[2].options[0])
      expect(findOptionByLabel(options, 'PLAIN')).toBe('Plain')
      expect(findOptionByLabel(options, 'deep')).toEqual({ label: 'Deep' })
      expect(findOptionByLabel(options, 'option 3')).toBe(options[2].options[1])
      expect(findOptionByLabel(options, 'option')).toBeNull()
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
})
