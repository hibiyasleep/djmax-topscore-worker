/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import * as htmlparser2 from 'htmlparser2'
import * as CSSSelect from 'css-select'

import ALIASES from './alias.js'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/16Lece3Rbov14mb6Jf7C8iCrDDr6lyXkn-pra8QJPcaw/htmlview'
const SHEET_MAPPING = {
  '4': '0',
  '5': '1602629531',
  '6': '87242412',
  '8': '1815765540'
}

const SHEET_TTL = 600

const parseCommand = message => {
  let match, title, button, pattern

  ;[match, title, button, pattern] = /^(.+?) ?([4568])[bk ]?(mx|sc)?$/i.exec(message) || []
  if(match) {
    title = ALIASES[title] || title
    return [ title.toLowerCase(), button, (pattern ?? '').toUpperCase() ]
  }

  ;[match, button, title] = /^([4568]) ?(.+?)$/i.exec(message) || []
  if(match) {
    title = ALIASES[title] || title
    return [ title.toLowerCase(), button, '' ]
  }

  return []
}

const wrapResponse = wrapOptions => (payload, options = {}) => {
  if(typeof payload === 'string')
    payload = { message: payload }

  payload.message = payload.message.replaceAll('`', '\'') // Nightbot… eval…

  payload.status = options.status
  options.status ||= 200

  if(!wrapOptions.sendError)
    options = { ...options, status: 200 }

  if(wrapOptions.responseType === 'json')
    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      ...options
    })
  else {
    if(!wrapOptions.sendError)
      payload.message = ' ' // Nightbot
    else
      payload.message += '\n'

    return new Response(payload.message, options)
  }
}

const fetchSheet = async () => {
  const body = await fetch(SHEET_URL).then(_ => _.text())

  const dom = htmlparser2.parseDocument(body)
  const pages = new Map(
    Object.entries(SHEET_MAPPING).map(([ buttons, id ]) => [
      buttons,
      CSSSelect
        .selectAll(`[id="${id}"] tbody > tr`, dom)
        .map(({ children }) => [ children[2], children[4], children[5], children[6], children[7] ])
        .map(row => row.map(el => el.children[0]?.data))
        .filter(row => row[0])
        .map(row => row.slice(0, 5))
    ])
  )

  return pages
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    const flags = url.searchParams.get('f')?.split(',') ?? []

    const responseType = flags.includes('json')? 'json' : 'text'
    // '+' means '%20' in URL, but just gonna ignoring this fact
    const sendError = responseType === 'text'? flags.includes(' error') : !flags.includes('-error')
    const _response = wrapResponse({ responseType, sendError })

    if(!query)
      return _response(`사용법: !전일 kick it 6sc https://github.com/hibiyasleep/djmax-topscore-worker`, { status: 404 })

    const [ title, button, pattern ] = parseCommand(query)
    if(!title)
      return _response(`검색어 '${query}'를 인식하지 못했습니다.`, { status: 404 })

    let rows = await env.dmrv_sheet.get(`hard-${button}b`, { type: 'json' })

    if(rows === null) {
      const sheet = await fetchSheet()
      for(const [button, page] of sheet.entries())
        await env.dmrv_sheet.put(`hard-${button}b`, JSON.stringify(page), { expirationTtl: SHEET_TTL })

      rows = sheet.get(button)
    }

    const found = rows.map(row => ({
        title: row[0],
        pattern: row[1],
        score: row[2],
        percent: row[3],
        player: row[4]
      }))
      .sort((a, b) => a.title.length - b.title.length)
      .find(row => row.title.toLowerCase().includes(title) && row.pattern.includes(pattern))

    if(!found)
      return _response(`검색 조건 '${title}, ${button}키, ${pattern || '아무 패턴'}'에 일치하는 항목이 없습니다.`, { status: 404 })

    let message = `${found.title} ${button}B ${found.pattern}:`

    if(found.score) {
      message += ` ${found.percent}, ${found.score}`
      if(flags.includes('who'))
        message += ` (by ${found.player})`
    } else {
      message += ' ---'
    }

    return _response({
      ...found,
      button,
      message
    })
  }
}
