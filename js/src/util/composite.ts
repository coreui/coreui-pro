/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/composite.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

/**
 * Picks the options a composite component hands to one of its parts: each
 * option of the part that the composite's config holds with a value other
 * than the composite's original default. An empty section label of a date
 * field (`ariaDayLabel` … `ariaMeridiemLabel`) or end label of a range
 * (`ariaStartLabel`, `ariaEndLabel`), which the field reads as not given,
 * takes the composite's current default, so a label the page set globally
 * on the composite wins over the part's own default.
 *
 * @param keys - The options of the part
 * @param config - The composite's config
 * @param defaults - The composite's defaults as the page may have changed them
 * @param original - The composite's defaults as its module declared them
 * @returns The options to pass to the part
 */
export const getForwardedOptions = (keys: string[], config: Record<string, any>, defaults: Record<string, any>, original: Record<string, any>): Record<string, any> => {
  const forwarded: Record<string, any> = {}

  for (const key of keys) {
    const value = config[key] === '' && /^aria(?:Day|End|Hour|Meridiem|Minute|Month|Quarter|Second|Start|Week|Year)Label$/.test(key) ? defaults[key] : config[key]

    if (key in config && value !== original[key]) {
      forwarded[key] = value
    }
  }

  return forwarded
}
