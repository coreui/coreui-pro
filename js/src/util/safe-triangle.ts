export type Point = { x: number, y: number }

export type Triangle = [Point, Point, Point]

const APEX_OFFSET = 4

/**
 * Tells whether a point lies inside a triangle, edges included.
 *
 * @param point - The point
 * @param a - First corner
 * @param b - Second corner
 * @param c - Third corner
 * @returns `true` when the point is inside the triangle
 */
export const isInTriangle = (point: Point, a: Point, b: Point, c: Point): boolean => {
  const side = (p: Point, q: Point, r: Point): number => ((p.x - r.x) * (q.y - r.y)) - ((q.x - r.x) * (p.y - r.y))
  const sides = [side(point, a, b), side(point, b, c), side(point, c, a)]
  return !(sides.some(value => value < 0) && sides.some(value => value > 0))
}

/**
 * Returns the triangle between the point where the pointer left an anchor and the edge of a
 * floating element that faces it. The apex moves a few pixels away from the floating element,
 * so a pointer that has just left the anchor towards it counts as inside.
 *
 * @param exit - The point where the pointer left the anchor
 * @param rect - The floating element's rectangle
 * @param placement - Its side: `top`, `bottom`, `left` or `right`, with an optional `-start` or `-end`
 * @returns The apex and the two corners of the facing edge
 */
export const safeTriangle = ({ x, y }: Point, rect: DOMRect, placement: string): Triangle => {
  if (placement.startsWith('top')) {
    return [{ x, y: y + APEX_OFFSET }, { x: rect.left, y: rect.bottom }, { x: rect.right, y: rect.bottom }]
  }

  if (placement.startsWith('bottom')) {
    return [{ x, y: y - APEX_OFFSET }, { x: rect.left, y: rect.top }, { x: rect.right, y: rect.top }]
  }

  if (placement.startsWith('left')) {
    return [{ x: x + APEX_OFFSET, y }, { x: rect.right, y: rect.top }, { x: rect.right, y: rect.bottom }]
  }

  return [{ x: x - APEX_OFFSET, y }, { x: rect.left, y: rect.top }, { x: rect.left, y: rect.bottom }]
}

/**
 * Follows a pointer that has left an anchor towards a floating element. It keeps following while
 * each `pointermove` stays inside the safe triangle and calls `onLeave` once the pointer leaves the
 * triangle or rests for `rest` milliseconds. A `pointermove` over the floating element ends the
 * following without `onLeave`.
 *
 * @param options - What to follow
 * @param options.exit - The point where the pointer left the anchor
 * @param options.floating - The floating element the pointer may be heading for
 * @param options.onLeave - Called once when the pointer stops heading for the floating element
 * @param options.onReach - Called once when the pointer reaches the floating element
 * @param options.placement - The floating element's side, as for `safeTriangle()`
 * @param options.point - The pointer's current position
 * @param options.rest - How long the pointer may rest before `onLeave`, in milliseconds
 * @returns A function that stops following, or `null` when `point` is not heading for the floating element
 */
export const followPointerIntent = ({ exit, floating, onLeave, onReach, placement, point, rest }: {
  exit: Point
  floating: HTMLElement
  onLeave: () => void
  onReach?: () => void
  placement: string
  point: Point
  rest: number
}): (() => void) | null => {
  const triangle = safeTriangle(exit, floating.getBoundingClientRect(), placement)

  if (!isInTriangle(point, ...triangle)) {
    return null
  }

  const { ownerDocument } = floating
  let timeout = 0
  const stop = () => {
    clearTimeout(timeout)
    ownerDocument.removeEventListener('pointermove', onMove)
  }

  const leave = () => {
    stop()
    onLeave()
  }

  const onMove = (event: PointerEvent) => {
    clearTimeout(timeout)

    if (floating.contains(event.composedPath()[0] as Node)) {
      stop()
      onReach?.()
    } else if (isInTriangle({ x: event.clientX, y: event.clientY }, ...triangle)) {
      timeout = setTimeout(leave, rest)
    } else {
      leave()
    }
  }

  ownerDocument.addEventListener('pointermove', onMove)
  timeout = setTimeout(leave, rest)
  return stop
}
