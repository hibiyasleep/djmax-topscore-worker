const LINES = `
제목
#mine (feat. Riho Iwamoto)
공성전 ~Pierre Blanche, Yonce Remix~
광명의 루 : 루 라바다
너로 피어오라
너로피어오라
모짜르트 교향곡 40번 1악장
바람에게 부탁해 ~Live Mix~
복수혈전
부여성 ~Blosso Remix~
비상 ~Stay With Me~
소년 모험가 ~SiNA Remix~
연합군과 제국군
염라
전설이 시작된 곳 ~Void Rover Remix~	전시곳
죽음의 신 : 크로우 크루아흐
최종무곡
카트라이더 Mashup ~Cosmograph Remix~	코스모
카트라이더 Mashup ~Pure 100% Remix~	퓨백
카트라이더, 크레이지아케이드, 버블파이터 Main theme ~CHUCK Remix~	척	척리믹	배찌
피아노 협주곡 1번
AD2222
Airlock	에어락
Airwave
ALiCE
ANALYS
Angelic Sphere
Angelic Tears
ANiMA	아니마
Astro Fight
Attack
Aurora Borealis
AXION
Bamboo on Bamboo	밤부
Barbarous Funera
Beat U Down
BEE-U-TIFUL
Beyond the Future
Beyond Yourself
Binary World
BLACK GOLD
Black MInD	블랙마인드	블마
Black Swan
BlythE
Boom!
Brain Storm	브톰
Break a Spell
Break!
Bright Future
Chain of Gravity	체오그
Chemical Slave	케이컬
Child of Night	차오나
Chrysanthemum
Cocked Pistol	콕피
CODE NAME : ZERO	코넴제
Color
Comet Coaster	코멧	코멧코스터
conflict	컨플릭트	즈오르히
Cthugha	크투가
Cyberozar
Cypher Gate	사게	싸게
D2	디투
Dance of the Dead
Dancing Planet	댄싱플래닛	댄플
DARK ENVY
Dark Prism
DataErr0r	데이터에러
Daydream
Daylight
Deborah	데보라
Disappearing Act	퇴근	퇴근행동
Don't Die	돈다이
Dreadnought	드레드노트
Dream it
Dream of Winds	드오윈
Dream of you	드오유
Dual Strikers	듀스
Dysthymia	디스티미아
Electronics
EMber
Emblem
Emerge
Enemy Storm ~Dark Jungle Mix~
ENERGY SYNERGY MATRIX	esm
Enter The Universe	우주입갤
Entrance	엔트런스
Extreme Z4
Feel Ma Beat
Fermion
Festa Nova
FIGHT NIGHT
For Seasons ~Air Guitar Mix~	포시즌
For the IKARUS
Forgotten
Frontline
Fundamental
Fury
Garakuta Doll Play	가라쿠타
glory dat -JHS Remix-	glory day -JHS Remix-
glory day (Mintorment Remix)
Gone Astray
Good Night, Bad Luck
Got more raves?	갓모레
Grave Consequence
Grid System
Groove Prayer
HAMSIN	햄신
Hanz up!
Heart of Witch	하오위
HELIX	헬릭스
HEXAD	헥사드
Higher
Holy Orders (Be Just Or Be Dead)
I want You ~반짝 반짝 Sunshine~
I've got a feeling
Ikazuchi	이카즈치
Imaginary dance
In my Dream
It's my war now
JBG
Kal_wrnw
Kensei	켄세이	겐세이
Keys to the World
KICK IT	킥잇
KILLER BEE	킬러비
Knowledge System
KUDA
Kung Brother
L	ㄴ
La Campanella : Nu Rave	라캄	라캄파넬라
Landscape
Leave me alone
Lemonade
Liar
Light House
Lights of Muse	라오뮤
Lisrim	리즐림
Lost Temple
Mammal
Marionette
Marry me, Nightmare
MASAI
Melody
Melonaid
Mess it Up
Midnight Blood
Mind Control	마컨	마인드컨트롤
Minimal Life
Minus 3	마삼
Misty E'ra 'Mui'	무이
Moment (feat. Nauts)
Mr.Lonely
Mulch
MUSEDASH!!!!
Myosotis
NB Girls
NB POWER
NB RANGER
NB RANGER -Virgin Force	버진포스
NB RANGER -Virgin Force-
NB RANGERS - 운명의 Destiny	데스티니
NB Rangers -Returns-
Never Die	네버다이
Never let you go
Nevermind	네버마인드
Nightmare	나메
Obelisque	오벨리스크
OBLIVION
OBLIVION ~Rockin' Night Style~
Odysseus	오디	오디세우스
Old Gold
OrBiTal	오비탈
ouroboros -twin stroke of the end-	우로보로스
Out Law : Reborn	아웃로
Out of CTRL
Over Me	오버미
OVER THE NIGHT
Over the Rainbow
Para-Q
Plasma Sphere	플스
PUPA	푸파	나비
quixotic
Rage Of Demon	레오데
Ray of Illuminati
Ray Tuning
Real Over Drive
Red Eyes
Remains Of Doom
Remember Me
Renovation
Retention
Right Back
Rising The Sonic
Road Of Death	로오데
Rock Or Die
Rolling On the Duck
Royal Clown
Runaway
Ruti'n (GOTH Wild Electro Remix)	루틴리믹
Secret Dejavu
Seeker
Set Me Free	셋미프리
Showdown
SigNalize
Silent Clarity
SIN
SIN ~The Last Scene~
SON OF SUN	추장
Space Challenger
Space of Soul
SQUEEZE
STALKER
Start The Adventure ~SOPHI Remix~
STEP
Super lovely
Supernova	슈퍼노바
Supersonic 2011
Syriana ~Blast Wave Mix~
Techno Racer
The Clear Blue Sky
The Feelings
The Guilty
The Obliterator	오빌
The One
The Rain Maker
The wheel to the right
Thor	토르
Tic! Tac! Toe!	틱택토
Trrrickster	트릭스터
U.A.D
Urban Night
v o l d e n u i t	볼데누잇	voldenuit
Ventilator	벤틸
Vertical Floating
Vile Requiem
VORTEX
Waiting for you
Warrior	워리어
Watch Your Step	발조심
We're All Gonna Die	고너다이	거너다이	고나다이
What am I fighting for?
WhiteBlue
Winners	위너	위너즈
Won't Back Down	원백다운
WONDER $LOT 777
Xeus	제우스
XING
XLASHER	슬래셔
Yo Creo Que Si ~Live House Version~
Your Own Miracle
Zero to the hunnit
Zero-Break	제브
ZET
ZET ~Mr.Funky Remix~
`

const ALIASES = Object.fromEntries(LINES.split('\n').flatMap(line => {
  const [name, ...alias] = line.trim().split('\t')
  if(!name || !alias.length)
    return
  return alias.map(_ => [_, name])
}).filter(_ => _))

export default ALIASES
