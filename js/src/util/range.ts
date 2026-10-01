export type RangeTickPosition = {
  index: number
  ratio: number
  value: number
}

const TOLERANCE = 1e-9

/**
 * Counts the decimal places of a number, including those written in exponent notation.
 *
 * @param number - The number to read
 * @returns The number of decimal places, `0` for an integer
 */
const getDecimals = (number: number): number => {
  const [mantissa, exponent = '0'] = `${number}`.split('e')

  return Math.max(0, (mantissa.split('.')[1] || '').length - Number(exponent))
}

/**
 * Reads a numeric attribute of a range input, with the value the browser uses when it is missing.
 *
 * @param input - The range input
 * @param name - `'min'` or `'max'`
 * @returns The attribute as a number, `0` for a missing `min` and `100` for a missing `max`
 */
const getBound = (input: HTMLInputElement, name: 'max' | 'min'): number =>
  input[name] === '' ? (name === 'min' ? 0 : 100) : Number.parseFloat(input[name])

/**
 * Keeps a range input at least `distance` away from its neighbours, so the thumbs of a
 * multi-thumb range stay in order. A limit that is off the step grid moves the input to the
 * next step inside the limit.
 *
 * @param input - The input that moved
 * @param previous - The input before it, if any
 * @param next - The input after it, if any
 * @param distance - The smallest gap between neighbouring values
 */
export const constrainInput = (
  input: HTMLInputElement,
  previous: HTMLInputElement | undefined,
  next: HTMLInputElement | undefined,
  distance: number
): void => {
  if (previous && Number(input.value) < Number(previous.value) + distance - TOLERANCE) {
    setInputValue(input, Number(previous.value) + distance)

    if (Number(input.value) < Number(previous.value) + distance - TOLERANCE && input.step !== 'any') {
      input.stepUp()
    }
  }

  if (next && Number(input.value) > Number(next.value) - distance + TOLERANCE) {
    setInputValue(input, Number(next.value) - distance)

    if (Number(input.value) > Number(next.value) - distance + TOLERANCE && input.step !== 'any') {
      input.stepDown()
    }
  }
}

/**
 * Finds the enabled thumb a press on the track should move: the first one below its value,
 * the last one above it, and otherwise the closest, with a tie going to the thumb on the side
 * of the press.
 *
 * @param inputs - The range inputs in order
 * @param ratio - The pressed position, from `0` at `min` to `1` at `max`
 * @returns The input to move, or `null` when every input is disabled
 */
export const getNearestInput = (inputs: HTMLInputElement[], ratio: number): HTMLInputElement | null => {
  const enabled = inputs.filter(input => !input.matches(':disabled'))

  if (enabled.length === 0) {
    return null
  }

  const ratios = enabled.map(input => getRatio(input))

  if (ratio <= ratios[0]) {
    return enabled[0]
  }

  if (ratio >= ratios.at(-1)!) {
    return enabled.at(-1)!
  }

  const distances = ratios.map(value => Math.abs(value - ratio))
  const closest = Math.min(...distances)
  const first = distances.indexOf(closest)

  return enabled[ratio < ratios[first] ? first : distances.lastIndexOf(closest)]
}

/**
 * Reads where a range input's value sits on its track.
 *
 * @param input - The range input
 * @returns The value as a ratio from `0` at `min` to `1` at `max`, `0` when the span is empty
 */
export const getRatio = (input: HTMLInputElement): number => {
  const min = getBound(input, 'min')
  const span = getBound(input, 'max') - min

  return span > 0 ? (Number.parseFloat(input.value) - min) / span : 0
}

/**
 * Maps a pointer position to a ratio of the track, measured between the centres of the thumb
 * at either end, the way the browser places the thumb.
 *
 * @param point - The pointer position, such as a `PointerEvent`
 * @param point.clientX - The horizontal position in the viewport
 * @param point.clientY - The vertical position in the viewport
 * @param rect - The bounding box of the range input
 * @param thumb - The width of the thumb in pixels
 * @param vertical - Whether the value grows from the bottom
 * @param rtl - Whether a horizontal value grows from the right
 * @returns The ratio from `0` at `min` to `1` at `max`, clamped to the track
 */
export const getRatioAt = (
  point: { clientX: number, clientY: number },
  rect: DOMRect,
  thumb: number,
  vertical: boolean,
  rtl: boolean
): number => {
  const length = (vertical ? rect.height : rect.width) - thumb
  const offset = vertical ?
    rect.bottom - point.clientY :
    (rtl ? rect.right - point.clientX : point.clientX - rect.left)

  return length > 0 ? Math.min(Math.max((offset - (thumb / 2)) / length, 0), 1) : 0
}

/**
 * Orders overlapping thumbs so the one that can still move stays on top: a thumb past the
 * middle of the track goes above the thumbs after it, and one before the middle above those
 * before it.
 *
 * @param ratio - Where the thumb sits, from `0` to `1`
 * @param index - The position of the thumb among the thumbs
 * @param total - The number of thumbs
 * @returns The `z-index` of the thumb
 */
export const getStackOrder = (ratio: number, index: number, total: number): number =>
  ratio > 0.5 ? total - index : index + 1

/**
 * Measures the thumb width of a range by laying out a hidden probe that reads
 * `--cui-range-thumb-width`, which may be set in any unit.
 *
 * @param element - The element the token resolves on, usually the `.form-range` wrapper
 * @returns The width of the thumb in pixels
 */
export const getThumbSize = (element: HTMLElement): number => {
  const probe = document.createElement('div')
  probe.style.cssText = 'position: absolute; visibility: hidden; width: var(--cui-range-thumb-width);'
  element.append(probe)
  const { width } = probe.getBoundingClientRect()
  probe.remove()

  return width
}

/**
 * Places tick marks on a track. A number is a tick at that value, an object with a `value` is a
 * tick at that value read as a number (so `'50'` from a JSON attribute works), and anything else is
 * placed by its position in the list, the first at `min` and the last at `max`. Ticks whose value
 * is not a number are left out.
 *
 * @param min - The lowest value of the track
 * @param max - The highest value of the track
 * @param ticks - The ticks as given
 * @returns The ticks sorted along the track, each with its index in `ticks`, its value and its ratio clamped to the track
 */
export const getTickPositions = (min: number, max: number, ticks: unknown[]): RangeTickPosition[] => {
  const span = max - min || 1

  return ticks
    .map((tick, index) => {
      const own = tick !== null && typeof tick === 'object' ? (tick as { value?: unknown }).value : undefined
      const value = typeof tick === 'number' ?
        tick :
        (own === undefined || own === null ?
          min + (ticks.length === 1 ? 0 : (index / (ticks.length - 1)) * span) :
          Number(own))

      return { index, ratio: Math.min(Math.max((value - min) / span, 0), 1), value }
    })
    .filter(position => !Number.isNaN(position.value))
    .toSorted((a, b) => a.ratio - b.ratio)
}

/**
 * Applies the value sanitization of `<input type="range">` to a number: clamps it to the range,
 * rounds it to the nearest step from `min` (half way rounds up, counted in decimals like the
 * browser) and steps back when the rounded value passes `max`. A value that is not a finite number
 * becomes the midpoint, and a `max` below `min` counts as `min`.
 *
 * @param value - The value to sanitize
 * @param min - The lowest value
 * @param max - The highest value
 * @param step - The step, or `0` and below for `step="any"`
 * @returns The value the input would hold
 */
export const sanitizeValue = (value: number, min: number, max: number, step: number): number => {
  const top = Math.max(max, min)
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : min + ((top - min) / 2), min), top)

  if (!(step > 0)) {
    return clamped
  }

  const decimals = Math.max(getDecimals(step), getDecimals(min))
  const steps = Math.round(Number(((clamped - min) / step).toFixed(9)))
  const rounded = Number((min + (steps * step)).toFixed(decimals))

  return rounded > top ? Number((rounded - step).toFixed(decimals)) : rounded
}

/**
 * Writes a value to an input through the prototype setter, so a framework that wraps the
 * instance setter to track values still sees the next input event as a change.
 *
 * @param input - The input to write
 * @param value - The value to write; the browser sanitizes it like any assignment
 */
export const setInputValue = (input: HTMLInputElement, value: number): void => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, `${value}`)
}
