/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import * as util from './util.js'

const API_BASE = `https://hard-archive.com/api`

const fetchSonglist = async () => {
  const body = await fetch(API_BASE + '/song', {
    cf: {
      cacheTtl: 86400,
      cacheEverything: true
    }
  }).then(async _ => await _.json())

  return new Map(
    body.sort((a, b) => a.title.length - b.title.length)
        .map(song => [ song.title.toLowerCase(), song ])
  )
}

const findPattern = (patterns, key, pattern) => {
  const found = patterns[key + 'B']
  if(!found)
    return []

  const patternFound = pattern?
    found.find(p => p.startsWith(pattern))
  : found.at(-1)
  if(!patternFound)
    return []

  return [key + 'B', patternFound]
}

const wrapResponse = wrapOptions => (payload, options = {}) => {
  if(typeof payload === 'string')
    payload = { message: payload }

  if(wrapOptions.shouldEscape)
    payload.message = payload.message.replaceAll('`', '\'') // Nightbot… eval…

  payload.status = options.status
  options.status ||= 200

  if(wrapOptions.alwaysOk)
    options = { ...options, status: 200 }

  if(wrapOptions.responseType === 'json') {
    return new Response(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      ...options
    })
  } else {
    if((payload.status < 200 || (299 < payload.status && payload.status < 500)) && !wrapOptions.showError)
      payload.message = ' ' // Nightbot
    else
      payload.message += '\n'

    return new Response(payload.message, options)
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const [, path] = url.pathname.split('/')
    const sheet = path || 'hard'
    const query = url.searchParams.get('q')
    const flags = url.searchParams.get('f')?.split(',') ?? []

    if(path === '' || request.headers.has('Nightbot-Response-Url')) // dirty backward-compatiblity
      flags.push('nightbot')

    const responseType = flags.includes('json')? 'json' : 'text'
    const showError = flags.includes('error')
    const shouldEscape = flags.includes('nightbot') && !flags.includes('-escape')
    const alwaysOk = flags.includes('nightbot') || flags.includes('-error')

    const _response = wrapResponse({ responseType, showError, shouldEscape, alwaysOk })

    if(!query)
      return _response(`사용법: !전일 kick it 6sc https://github.com/hibiyasleep/djmax-topscore-worker`, { status: 404 })

    const parsed = util.parseCommand(query)
    if(!parsed)
      return _response(`검색어 '${query}'를 인식하지 못했습니다.`, { status: 404 })

    const songs = await fetchSonglist()
    if(!songs)
      return _response(`곡 목록을 받아오지 못했습니다.`, { status: 500 })

    const foundTitle = util.findFirst(songs.keys(), title => title?.includes(parsed.title))
    const found = songs.get(foundTitle)
    if(!found)
      return _response(`검색어 '${parsed.title}'로 찾은 곡이 없습니다.`, { status: 404 })

    const [ foundKeys, foundPattern ] = findPattern(found.pattern, parsed.button, parsed.pattern)
    if(!foundPattern)
      return _response(`'${found.title}'에 ${parsed.button}버튼 ${parsed.pattern || '시험범위'} 패턴이 있나?`, { status: 404 })

    const response = await fetch(API_BASE + '/record?' + new URLSearchParams({
      song_id: found.id,
      button: foundKeys,
      lv: foundPattern,
      judge: 'hard'
    })).then(_ => _.json())

    if(!response.status)
      if(response.message)
        return _response(`서버 오류: ${response.message}`, { status: 500 })
      else
        return _response(`알 수 없는 서버 오류`, { status: 500 })

    /*
    let rows = await env.dmrv_sheet.get(`dmrv-${sheet}-${button}b`, { type: 'json' })

    if(rows === null) {
      const doc = await fetchSheet(sheet)
      for(const [button, page] of doc.entries())
        await env.dmrv_sheet.put(`dmrv-${sheet}-${button}b`, JSON.stringify(page), { expirationTtl: SHEET_TTL })

      rows = doc.get(button)
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
    */

    const entry = response.data[0]

    let message = `${found.title} ${foundKeys}B ${foundPattern}`

    if(sheet === 'max' && !flags.includes('hidemode'))
      message += ' (MAX)'

    message += ':'

    if(entry?.score) {
      message += ` ${(entry.rate / 100).toFixed(2)}%, ${entry.score}`
      if(flags.includes('who'))
        message += ` (by ${entry.nickname})`
    } else {
      message += ' ---'
    }

    return _response({
      ...found,
      // button,
      message
    })
  }
}
