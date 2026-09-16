import EventHandler from '../dom/event-handler.js'

export const addHostClassNames = (element, classNames) => {
  const added = classNames.filter(className => className && !element.classList.contains(className))
  element.classList.add(...added)

  return added
}

export const restoreHost = (element, { classNames, eventKey, nodes }) => {
  for (const node of nodes) {
    if (node) {
      EventHandler.off(node, eventKey)
      node.remove()
    }
  }

  element.classList.remove(...classNames)
}
