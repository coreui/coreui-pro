import Manipulator from '../dom/manipulator.js'
import SelectorEngine from '../dom/selector-engine.js'

export type RangeTick = number | string | { class?: string | string[], label?: string, style?: Record<string, string>, value?: number }

export type RangeTickPoint = {
  class?: string | string[]
  label: string
  ratio: number
  style?: Record<string, string>
  value: number
}

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
 * Builds the tick marks of a range: a grid whose tracks are the gaps between the ticks, so every
 * tick lands on a grid line, with a tick per point and its label beneath. A vertical range lays
 * the ticks out in rows from the bottom.
 *
 * @param points - The ticks, sorted along the track
 * @param vertical - Whether the range stands up
 * @returns The `.form-range-ticks` element, hidden from assistive technology
 */
export const createTicks = (points: RangeTickPoint[], vertical: boolean): HTMLElement => {
  const ticks = document.createElement('div')
  ticks.className = 'form-range-ticks'
  ticks.setAttribute('aria-hidden', 'true')

  const stops = [0, ...points.map(point => point.ratio), 1]
  const tracks = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`)

  if (vertical) {
    ticks.style.gridTemplateRows = tracks.toReversed().join(' ')
  } else {
    ticks.style.gridTemplateColumns = tracks.join(' ')
  }

  for (const [index, point] of points.entries()) {
    const tick = document.createElement('span')
    tick.className = 'form-range-tick'
    tick.classList.toggle('form-range-tick-start', point.ratio === 0)
    tick.classList.toggle('form-range-tick-end', point.ratio === 1)
    Manipulator.setDataAttribute(tick, 'value', `${point.value}`)

    if (vertical) {
      tick.style.gridRowStart = `${points.length - index + 1}`
    } else {
      tick.style.gridColumnStart = `${index + 2}`
    }

    if (point.class) {
      tick.classList.add(...[point.class].flat().flatMap(name => name.split(' ')).filter(Boolean))
    }

    if (point.style && typeof point.style === 'object') {
      Object.assign(tick.style, point.style)
    }

    if (point.label) {
      const label = document.createElement('span')
      label.className = 'form-range-tick-label'
      label.textContent = point.label
      tick.append(label)
    }

    ticks.append(tick)
  }

  return ticks
}

/**
 * Builds a value tooltip with the markup of the tooltip component, so it takes its look and
 * tokens. The arrow and the body are blocks, because `.tooltip-inner` has no `display` rule.
 *
 * @param placement - The placement class, such as `bs-tooltip-top`
 * @param tooltipClass - Extra classes, space separated
 * @param always - Whether the tooltip shows at all times
 * @returns The `.form-range-tooltip` element, hidden from assistive technology
 */
export const createTooltip = (placement: string, tooltipClass: string, always: boolean): HTMLElement => {
  const tooltip = document.createElement('div')
  tooltip.className = `form-range-tooltip tooltip ${placement}`
  tooltip.classList.toggle('show', always)
  tooltip.classList.add(...tooltipClass.split(' ').filter(Boolean))
  tooltip.setAttribute('aria-hidden', 'true')

  const arrow = document.createElement('div')
  arrow.className = 'tooltip-arrow'
  const inner = document.createElement('div')
  inner.className = 'tooltip-inner'
  tooltip.append(arrow, inner)

  return tooltip
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
 * Reads the step of a range input, with `step="any"` counted as a hundredth of the span.
 *
 * @param input - The range input
 * @returns The step as a number, `1` when the attribute is missing or invalid
 */
export const getStep = (input: HTMLInputElement): number =>
  input.step === 'any' ? (getBound(input, 'max') - getBound(input, 'min')) / 100 : (Number.parseFloat(input.step) || 1)

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
 * Finds the label of the tick a value sits on, within half a step of it.
 *
 * @param points - The ticks of the range
 * @param value - The value of the thumb
 * @param step - The step of the input
 * @returns The label, or `null` when the value sits on no labelled tick
 */
export const getTickLabel = (points: RangeTickPoint[], value: number, step: number): string | null =>
  points.find(point => point.label && Math.abs(point.value - value) < (step / 2) + TOLERANCE)?.label ?? null

/**
 * Reads the tick marks of a range input from the `ticks` option and from a linked `<datalist>`,
 * whose options become ticks at their values with their labels.
 *
 * @param input - The first range input, whose `min` and `max` place the ticks
 * @param ticks - The ticks option: numbers, labels or objects with `value`, `label`, `class` and `style`
 * @param list - The id of a datalist, or `null` to read the input's `list` attribute
 * @returns The ticks sorted along the track
 */
export const getTickPoints = (input: HTMLInputElement, ticks: RangeTick[] | boolean | string, list: string | null): RangeTickPoint[] => {
  const min = getBound(input, 'min')
  const max = getBound(input, 'max')
  const points: RangeTickPoint[] = []

  if (Array.isArray(ticks)) {
    for (const { index, ratio, value } of getTickPositions(min, max, ticks)) {
      const tick = ticks[index]
      const options = typeof tick === 'object' && tick !== null ? tick : undefined

      points.push({
        class: options?.class,
        label: typeof tick === 'string' ? tick : (options?.label ?? ''),
        ratio,
        style: options?.style,
        value
      })
    }
  }

  const listId = list ?? input.getAttribute('list')
  const datalist = listId ? document.getElementById(listId) : null

  if (datalist) {
    const options = SelectorEngine.find<HTMLOptionElement>('option', datalist)

    for (const { index, ratio, value } of getTickPositions(min, max, options.map(option => Number.parseFloat(option.value)))) {
      points.push({ label: options[index].label, ratio, value })
    }
  }

  return points.toSorted((a, b) => a.ratio - b.ratio)
}

/**
 * Places tick marks on a track. A number is a tick at that value, an object with a `value` is a
 * tick at that value read as a number (so `'50'` from a JSON attribute works), and anything else is
 * placed by its position in the list, the first at `min` and the last at `max`. Ticks whose value
 * is not a finite number are left out.
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
    .filter(position => Number.isFinite(position.value))
    .toSorted((a, b) => a.ratio - b.ratio)
}

/**
 * Composes the `aria-valuetext` of a thumb: the formatted value as text, followed by the label of
 * the tick it sits on when the two differ. Without a formatter the value is announced only with a
 * label, so the browser keeps reading the plain number.
 *
 * @param value - The value of the thumb
 * @param label - The label of the tick the thumb sits on, or `null`
 * @param html - The sanitized output of the value formatter, or `null` without one
 * @returns The text, or `null` when the browser's own announcement is enough
 */
export const getValueText = (value: number, label: string | null, html: string | null): string | null => {
  if (html === null) {
    return label === null ? null : `${value}, ${label}`
  }

  const template = document.createElement('template')
  template.innerHTML = html

  for (const lineBreak of template.content.querySelectorAll('br')) {
    lineBreak.replaceWith(' ')
  }

  const text = (template.content.textContent ?? '').replaceAll(/\s+/g, ' ').trim()
  return label === null || label === text ? text : `${text}, ${label}`
}

/**
 * Applies the value sanitization of `<input type="range">` with a `min` attribute to a number:
 * clamps it to the range, rounds it to the nearest step from `min` (half way rounds up, counted
 * in decimals like the browser) and steps back when the rounded value passes `max`. A value that
 * is not a finite number becomes the midpoint, a `max` below `min` counts as `min`, and a step
 * that is not above 0 counts as 1.
 *
 * @param value - The value to sanitize
 * @param min - The lowest value, which is also the step base
 * @param max - The highest value
 * @param step - The step, or `'any'` to leave the value unrounded
 * @returns The value the input would hold
 */
export const sanitizeValue = (value: number, min: number, max: number, step: number | 'any'): number => {
  const top = Math.max(max, min)
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : min + ((top - min) / 2), min), top)

  if (step === 'any') {
    return clamped
  }

  const size = step > 0 ? step : 1
  const decimals = Math.max(getDecimals(size), getDecimals(min))
  const steps = Math.round(Number(((clamped - min) / size).toFixed(9)))
  const rounded = Number((min + (steps * size)).toFixed(decimals))

  return rounded > top ? Number((rounded - size).toFixed(decimals)) : rounded
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
