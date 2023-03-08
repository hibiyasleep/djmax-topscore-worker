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

const NotFound = async (request, reason = '지정된 값을 찾을 수 없습니다.') => {
  return new Response(' ' /*reason*/, {
    status: 404,
    headers: {
      Allow: 'GET'
    }
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    // const flags = url.searchParams.get('flags').split(',')

    if(!query) {
      return new Response(`사용법: !전일 <제목일부> <키+패턴> (예: Mui 6sc) https://pastebin.com/raw/sk3wq5SE`)
    }

    const [ title, button, pattern ] = parseCommand(query)
    if(!title) {
      return new Response(' ')
      // return Response(`검색어 '${query}'를 인식하지 못했습니다.`, { status: 422 })
    }

    let rows = await env.dmrv_sheet.get(`hard-${button}b`, { type: 'json' })

    if(rows === null) {
      const sheet = await fetchSheet()
      for(const [button, page] of sheet.entries()) {
        await env.dmrv_sheet.put(`hard-${button}b`, JSON.stringify(page), { expirationTtl: SHEET_TTL })
      }

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

    if(!found) {
      return new Response('')
      // return Request(`검색 조건 '${title}, ${button}키, ${pattern ?? '아무 패턴'}'에 일치하는 값이 없습니다.`, { status: 404 })
    }

    let result = `${found.title} ${button}B ${found.pattern}: ${found.percent ?? '---'} (${found.score ?? '---'})`
    return new Response(result)
  }
}
