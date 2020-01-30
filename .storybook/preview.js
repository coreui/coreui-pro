// Import from @storybook/X where X is your framework
import {
  addDecorator,
  addParameters,
} from '@storybook/html'
import { withRootAttribute } from 'storybook-addon-root-attribute'

// global
addDecorator(withRootAttribute);
addParameters({
  rootAttribute: {
    root: 'body',
    defaultState: {
      name: 'Default Theme',
      value: 'c-app p-5'
    },
    states: [
      {
        name: 'Dark Theme',
        value: 'c-app p-5 c-dark-theme'
      },
      {
        name: 'Legacy Theme',
        value: 'c-app p-5 c-legacy-theme'
      }
    ]
  }
})
