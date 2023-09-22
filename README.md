## 스트리머용 설정법

### Nightbot

1. https://nightbot.tv/ 에서 채널에 Nightbot을 추가합니다.
2. [명령어 생성기](https://hibiyasleep.github.io/djmax-topscore-worker/generate-url.html)에서 원하는 대로 명령어를 구성한 다음, Twitch 채팅창에 붙여넣으세요.

### 이외

빵떡이는 안 됨

무봇은 좀 어려운데 되긴 함


---


# 디맥하판전일봇(가)

- v0.1.1

- 데이터 제공: 하드판정 전일 기록 아카이브
  - [하드판정 시트](https://docs.google.com/spreadsheets/d/16Lece3Rbov14mb6Jf7C8iCrDDr6lyXkn-pra8QJPcaw/edit)
  - [맥스판정 시트](https://docs.google.com/spreadsheets/d/1YQ4q4T_tIuQG2g442sxtrhSXvI2iUCvU8nHAyQ4G0Vk/edit)
  - [Discord](https://discord.gg/F7qkTr2NJ4)

- 문의: hibiya (hibiya#8268, [@hibiyasleep](https://twitter.com/hibiyasleep))


## 사용법

- `!전일 <검색어/별칭> <키>`
- `!전일 <검색어/별칭> <키><패턴>`
- `!전일 <키><검색어/별칭>`

<details>
<summary> 문법 정확히 보기 </summary>

- 요청 := `<곡 검색어>` ` `? `<패턴 검색어>` | `<키>` ` `? `<곡 검색어>`
- 곡 검색어 := `곡명의 일부` | `약칭`
- 패턴 검색어 := `<키>` (`b` | `k` | ` `)? `<난이도>`
- 키 := `4` | `5` | `6` | `8`
- 난이도 := `sc` | `mx`

</details>

### 용례

* 검색어는 '곡명의 일부'가 일치하면 검색됩니다. (대소문자 무관, 특수문자 포함)
  - `!전일 Mui 6bsc`
  - `!전일 quixotic 4kmx`
  - `!전일 6 fundamental`

* 별칭은 등록된 별칭 중에서 정확히 일치하는 게 있을 때만 검색합니다.
  - `!전일 voldenuit 5 sc` (됨)
  - `!전일 vold 5 sc` (안됨)
  - `!전일 v o l d e 5 sc` (됨)
  - `!전일 8킥잇` (됨)
  - `!전일 5디세우스` (됨...등록해둠)

* 없는 패턴을 검색할 경우 다른 곡이 튀어나올 수 있으나 버그가 아닙니다.
  - `!전일 Nightmare 6 SC` (Marry Me, **Nightmare** SC가 나옴)
  - `!전일 D2 6 SC` (A**D2**222 SC가 나옴)

### 검색어 예시

검색어 | 결과 | 비고
------ | ---- | ----
nightmare | Nightmare | 곡명이 짧은 것부터 찾습니다
marry me | Marry Me, Nightmare
orbit | OrBiTal
운명의 | NB RANGERS - 운명의 Destiny
g a | Disappearing Act | 가끔 오타나있는 곡이 (니힐리즘이라던가) 안 나올 수 있음
\# | \#mine (feat. Riho Iwamoto)
$ | WONDER $LOT 777
`l` | L

## 별칭

- 곡명이 너무 긴 경우
- 유저 사이에서 약칭이 자주 쓰이는 경우
- 또는 그냥 누가 그렇게 찔러볼 거 같다는 생각이 드는 경우

[목록](https://github.com/hibiyasleep/djmax-topscore-worker/blob/main/src/alias.js)에 있는 것에만 대응합니다  
목록이 완전하지 않으므로 필요한 것은 요청 주시면 감사하겠습니다 (진짜아무거나막넣었어요…)



---



## API

뭔가 이상하다면 다 나봇 탓입니다  
내탓아님  
아마도

* GET /hard, GET /max
  * 요청 (params)
    - `q`: 검색어
    - `f`: 플래그 (쉼표로 구분됨)
      - `json`: JSON으로 응답합니다.
      - `who`: 응답 메시지에 누구 기록인지를 추가합니다.
      - `error`: 오류가 발생했을 때 오류 메시지를 보냅니다.
      - `nightbot`: Nightbot용 처리를 켭니다.
        - eval용 이스케이프
        - 에러가 발생해도 200으로 반환
  * 응답
    - 평문일 경우
      사용자에게 출력할 텍스트를 반환합니다.  
      `nightbot` 플래그가 켜져있으면 `'`, <code>\`</code>을 escape하고,
      오류 메시지를 404 대신 200으로 보냅니다.
    - JSON일 경우
      - 기본 응답: `status` (HTTP 응답 코드), `message`
      - 정상 응답일 때: `title`, `pattern`, `score`, `percent`, `player`, `button`
