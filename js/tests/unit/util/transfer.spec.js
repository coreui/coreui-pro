import { getMovableValues, pickMovableValues, splitTransferOptions } from '../../../src/util/transfer.js'

const FRUIT = [
  { label: 'Apple', value: 'apple' },
  { disabled: true, label: 'Apricot', value: 'apricot' },
  { label: 'Banana', value: 'banana' },
  { hidden: true, label: 'Cherry', value: 'cherry' }
]

describe('Transfer utilities', () => {
  describe('splitTransferOptions', () => {
    it('should keep the source in the order of the options and the target in the order of the value', () => {
      const { source, target } = splitTransferOptions(FRUIT, ['cherry', 'apple'])

      expect(source.map(option => option.value)).toEqual(['apricot', 'banana'])
      expect(target.map(option => option.value)).toEqual(['cherry', 'apple'])
      expect(source[0]).toBe(FRUIT[1])
      expect(target[0]).toBe(FRUIT[3])
    })

    it('should leave out a chosen value that no option carries', () => {
      const { source, target } = splitTransferOptions(FRUIT, ['gone', 'banana'])

      expect(source.map(option => option.value)).toEqual(['apple', 'apricot', 'cherry'])
      expect(target.map(option => option.value)).toEqual(['banana'])
    })

    it('should put every option in the source when nothing is chosen', () => {
      expect(splitTransferOptions(FRUIT, [])).toEqual({ source: FRUIT, target: [] })
      expect(splitTransferOptions([], ['apple'])).toEqual({ source: [], target: [] })
    })
  })

  describe('getMovableValues', () => {
    it('should list the options that are neither hidden nor disabled, in list order', () => {
      expect(getMovableValues(FRUIT)).toEqual(['apple', 'banana'])
      expect(getMovableValues([])).toEqual([])
    })
  })

  describe('pickMovableValues', () => {
    it('should take the wanted enabled options in list order, hidden ones included', () => {
      expect(pickMovableValues(FRUIT, ['cherry', 'banana', 'apple'])).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should leave out a disabled option and a value the list does not hold', () => {
      expect(pickMovableValues(FRUIT, ['apricot', 'gone'])).toEqual([])
      expect(pickMovableValues(FRUIT, [])).toEqual([])
    })
  })
})
