import ALIASES from './alias.js'

export const parseCommand = message => {
  let match, title, button, pattern

  ;[match, title, button, pattern] = /^(.+?) ?([4568])[bk]? ?(mx|sc)?$/i.exec(message) || []
  if(match) {
    title = ALIASES[title] || title
    return {
      title: title.toLowerCase(),
      button,
      pattern: (pattern ?? 'SC').toUpperCase()
    }
  }

  ;[match, button, title] = /^([4568]) ?(.+?)$/i.exec(message) || []
  if(match) {
    title = ALIASES[title] || title
    return {
      title: title.toLowerCase(),
      button,
      pattern: '' ?? 'SC'
    }
  }

  return null
}

export const findFirst = (iterator, condition) => {
  let item
  while(item = iterator.next()) {
    if(condition(item)) {
      return item
    }
  }
}
