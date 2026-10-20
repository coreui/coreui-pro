describe('toThrowError', () => {
  const throwing = () => {
    throw new TypeError('Wrong type.')
  }

  it('should pass on the class and the exact message', () => {
    expect(throwing).toThrowError(TypeError, 'Wrong type.')
    expect(throwing).toThrowError(TypeError, /Wrong/)
    expect(throwing).toThrowError('Wrong type.')
    expect(throwing).toThrowError(TypeError)
    expect(throwing).toThrowError()
  })

  it('should fail on another message or another class', () => {
    expect(() => expect(throwing).toThrowError(TypeError, 'Other.')).toThrow('expected the function to throw TypeError with message Other., but it threw TypeError: Wrong type.')
    expect(() => expect(throwing).toThrowError('Wrong')).toThrow()
    expect(() => expect(throwing).toThrowError(RangeError, 'Wrong type.')).toThrow()
    expect(() => expect(() => {}).toThrowError(TypeError)).toThrow('but it did not throw')
  })

  it('should say what was not expected under not', () => {
    expect(() => expect(throwing).not.toThrowError(TypeError)).toThrow('expected the function not to throw TypeError')
  })

  it('should show a value thrown that is not an Error', () => {
    expect(() => expect(() => {
      throw 'stop' // eslint-disable-line no-throw-literal
    }).toThrowError()).toThrow('but it threw stop')
  })

  it('should read the reason of a rejected promise only with rejects', async () => {
    await expect(Promise.reject(new TypeError('Wrong type.'))).rejects.toThrowError(TypeError, 'Wrong type.')
    expect(() => expect(new TypeError('Wrong type.')).toThrowError(TypeError)).toThrow('toThrowError expects a function')
  })

  it('should refuse an argument it cannot read', () => {
    expect(() => expect(throwing).toThrowError(new TypeError('Wrong type.'))).toThrow('toThrowError takes an error class, a message or a RegExp')
    expect(() => expect(throwing).toThrowError('Wrong type.', 'Wrong type.')).toThrow('toThrowError takes a message after an error class only')
  })
})
