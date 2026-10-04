import { getForwardedOptions } from '../../../src/util/composite.js'

describe('Composite Utilities', () => {
  describe('getForwardedOptions', () => {
    const original = { ariaDayLabel: 'Day', locale: 'default', size: null }

    it('should forward only the options the composite changed from its original default', () => {
      const config = {
        ariaDayLabel: 'Day', locale: 'pl-PL', size: null, unrelated: true
      }

      expect(getForwardedOptions(['ariaDayLabel', 'locale', 'size', 'missing'], config, original, original)).toEqual({ locale: 'pl-PL' })
    })

    it('should give an empty label the default the page set on the composite', () => {
      const config = { ariaDayLabel: '' }

      expect(getForwardedOptions(['ariaDayLabel'], config, { ...original, ariaDayLabel: 'Dzień' }, original)).toEqual({ ariaDayLabel: 'Dzień' })
      expect(getForwardedOptions(['ariaDayLabel'], config, original, original)).toEqual({})
    })

    it('should keep an empty value that is not a section or end label', () => {
      expect(getForwardedOptions(['locale'], { locale: '' }, original, original)).toEqual({ locale: '' })
      expect(getForwardedOptions(['ariaNothingToPickLabel'], { ariaNothingToPickLabel: '' }, { ariaNothingToPickLabel: 'Brak' }, {})).toEqual({ ariaNothingToPickLabel: '' })
    })
  })
})
