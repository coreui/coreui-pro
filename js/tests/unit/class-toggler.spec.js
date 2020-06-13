import ClassToggler from '../../src/class-toggler'

/** Test helpers */
import { getFixture, clearFixture, jQueryMock } from '../helpers/fixture'

describe('ClassToggler', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('attach', () => {
    it('should add the add-this-class class to c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-attach="add-this-class"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classattached', () => {
        expect(c.classList.contains('add-this-class')).toEqual(true)
        done()
      })

      toggler.click()
    })
  })

  describe('detach', () => {
    it('should remove the add-this-class class from c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app add-this-class">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-detach="add-this-class"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classdetached', () => {
        expect(c.classList.contains('add-this-class')).toEqual(false)
        done()
      })

      toggler.click()
    })

    it('should remove following classes from tc-app element `test-xl-show`, `test-lg-show`, `test-md-show`, `test-sm-show`, `test-show`', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app test-xl-show test-lg-show test-md-show test-sm-show test-show">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-detach="test-xl-show" data-responsive="true"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classdetached', () => {
        setTimeout(function() {
          expect(c.classList.contains('test-xl-show')).toEqual(false)
          expect(c.classList.contains('test-lg-show')).toEqual(false)
          expect(c.classList.contains('test-md-show')).toEqual(false)
          expect(c.classList.contains('test-sm-show')).toEqual(false)
          expect(c.classList.contains('test-show')).toEqual(false)
          done()
        }, 1000);

      })

      toggler.click()
    })
  })

  describe('toggle', () => {
    it('should add the `toggle` class to c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-toggle="toggle"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classattached', () => {
        expect(c.classList.contains('toggle')).toEqual(true)
        done()
      })

      toggler.click()
    })

    it('should remove the `toggle` class from c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app toggle">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-toggle="toggle"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classdetached', () => {
        expect(c.classList.contains('toggle')).toEqual(false)
        done()
      })

      toggler.click()
    })
  })

  describe('class', () => {
    it('should add the `toggle` class to c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-toggle="toggle"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classattached', () => {
        expect(c.classList.contains('toggle')).toEqual(true)
        done()
      })

      toggler.click()
    })

    it('should remove the `toggle` class from c-app element', done => {
      fixtureEl.innerHTML = [
        '<div class="c-app toggle">',
        '  <button type="button" class="c-class-toggler" data-target=".c-app" data-toggle="toggle"></div>',
        '</div>'
      ].join('')

      const c = document.querySelector('.c-app')
      const toggler = document.querySelector('.c-class-toggler')

      c.addEventListener('classdetached', () => {
        expect(c.classList.contains('toggle')).toEqual(false)
        done()
      })

      toggler.click()
    })
  })
})
