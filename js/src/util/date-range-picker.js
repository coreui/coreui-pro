/**
 * Generates input IDs or names based on the provided attributes, range, and position.
 *
 * @param attribute - A single string or a tuple of two strings representing the attribute names.
 * @param range - A boolean indicating whether the input is part of a range.
 * @param position - Optional. Specifies the position ('start' or 'end') when `range` is true.
 * @returns A string representing the input ID or name.
 */
export const getInputIdOrName = (attribute, range, position) => {
  if (range && !Array.isArray(attribute)) {
    return `${attribute}-${position}-date`
  }

  if (Array.isArray(attribute)) {
    return position === "start" ? attribute[0] : attribute[1]
  }

  return attribute
}
