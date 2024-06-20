import * as handlebars from 'handlebars'
import { get, take } from 'lodash'

// Function to do basic mathematical operation in handlebars
handlebars.helpers.math = function (lvalue, operator, rvalue) {
  lvalue = parseFloat(lvalue)
  rvalue = parseFloat(rvalue)
  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator]
}

/**
 * The {{#exists}} helper checks if a variable is defined.
 * {{#exists myvar}}
 *  <p>Value of myvar is ... {{myvar}}</p>
 * {{else}}
 *  <p>Please supply a myvar</p>
 * {{/exists}}
 */
handlebars.helpers.exists = function (variable, options) {
  if (typeof variable !== 'undefined') {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
}

// Function to convert salutations into hindi salutations
// Last argument is handlebars option
handlebars.helpers.salutation = function (salutation: string, defaultSalutation?: string) {
  if (typeof salutation === 'object') {
    throw new Error("Salutation can'\t be an object")
  }

  if (typeof salutation === 'string' && salutation.trim() !== '') {
    switch (salutation.trim().toLowerCase()) {
      case 'mr':
        return 'श्री'
      case 'miss':
        return 'कुमारी'
      case 'mrs':
        return 'श्रीमती'
      case 'son':
        return 'पुत्र'
      case 'daughter':
        return 'पुत्री'
      case 'wife':
        return 'पत्नी'
      default:
        return salutation
    }
  }

  return typeof defaultSalutation === 'string' ? defaultSalutation ?? salutation : salutation
}

// Function to convert salutations into english salutations
// Last argument is handlebars option
handlebars.helpers.englishSalutation = function (salutation: string, defaultSalutation?: string) {
  if (typeof salutation === 'object') {
    throw new Error("Salutation can'\t be an object")
  }

  if (typeof salutation === 'string' && salutation.trim() !== '') {
    switch (salutation.trim().toLowerCase()) {
      case 'mr':
        return 'Mr'
      case 'miss':
        return 'Miss'
      case 'mrs':
        return 'Mrs'
      case 'son':
        return 'Son'
      case 'daughter':
        return 'Daughter'
      case 'wife':
        return 'Wife'
      default:
        return salutation
    }
  }

  return typeof defaultSalutation === 'string' ? defaultSalutation ?? salutation : salutation
}

handlebars.registerHelper('ifEqual', function (arg1, arg2, options) {
  // @ts-expect-error
  return arg1 === arg2 ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('ifNotEqual', function (arg1, arg2, options) {
  // @ts-expect-error
  return arg1 !== arg2 ? options.fn(this) : options.inverse(this)
})

handlebars.registerHelper('get', function (obj, dataIndex) {
  return get(obj, dataIndex)
})

handlebars.registerHelper('ifIn', function (elem, list, options) {
  if (list.indexOf(elem) > -1) {
    // @ts-expect-error
    return options.fn(this)
  }

  // @ts-expect-error
  return options.inverse(this)
})

handlebars.registerHelper('ifSome', function (...values) {
  // Array cannot be passed directly through templates
  const options = values[values.length - 1]
  const list = values[values.length - 2]
  const elements = take(values, values.length - 2)

  const isValid = elements.some((item) => list.indexOf(item) > -1)
  if (isValid) {
    // @ts-expect-error
    return options.fn(this)
  }

  // @ts-expect-error
  return options.inverse(this)
})

export default handlebars
