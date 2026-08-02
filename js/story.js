/* ============================================================
   story.js — 게임의 모든 대사/텍스트가 여기 들어 있습니다.
   내용 수정은 이 파일만 고치면 됩니다.

   치환 토큰:
     %NAME%      → 플레이어 이름 (성+이름으로 입력 → 성을 뺀 이름으로 호칭)
     %NAME_EUN%  → 이름 + 은/는
     %NAME_YI%   → 이름 + 이/가
     %NAME_EUL%  → 이름 + 을/를
     %CALL%      → 형제님 / 자매님

   { type: "date", value: "7월 5일 (일)" } → 씬 우상단에 작은 흰 글씨로 날짜 표시
   { type: "choice", flag, options } → 선택지, 결과는 say-if 로 분기
   아무 스텝에나 if: { flag, value } 를 붙이면
   해당 선택을 한 사람에게만 그 스텝이 보입니다 (bg/sms/notify 등 전부 가능)

   sprite 값 "이름@g" 는 성별에 따라 이미지가 자동 선택됩니다.
   (예: "think@g" → assets/sprite-think-m.png / sprite-think-f.png)
   sprite 값 "" 는 캐릭터 숨김.
   ============================================================ */

const STORY = [

  /* ⏳ 전원 입장 후 함께 시작 */
  { type: "sync", key: "scene_intro",
    title: "모든 참가자를 기다리는 중",
    sub: "전원이 입장하면 함께 시작합니다." },

  /* ───────── 프롤로그 0: 하계수양회의 기억 ───────── */
  { type: "bg", value: "bg-retreat" },
  { type: "sprite", value: "" },
  { type: "place", value: "하계수양회 대강당" },
  { type: "date", value: "하계수양회 마지막 날" },
  { type: "say", text: "뜨거웠던 하계수양회, 그 마지막 날. 대강당을 가득 채운 찬양과 선포되는 말씀이 %NAME%의 마음을 뜨겁게 채우고 있었다." },
  { type: "bg", value: "bg-retreat-out" },
  { type: "place", value: "수양회장 앞" },
  { type: "say", text: "모든 일정을 마치고 강당을 나서는 길 — 올려다본 하늘이 유난히 파랗고 눈부셨다." },
  { type: "say", speaker: "%NAME%", text: "이렇게 많은 복음의 역사가 일어나고 있다니… 나도 이제부터 신앙생활 열심히 해야지!" },
  { type: "transition", text: "며칠 후…" },

  /* ───────── 인트로 내레이션: 일상으로 돌아온 도시 전경 ───────── */
  { type: "bg", value: "bg-city" },
  { type: "sprite", value: "" },
  { type: "place", value: "" },
  { type: "date", value: "" },
  { type: "say", text: "일상으로 돌아온 %NAME_EUN% 다시 반복되는 하루하루를 살아가고 있다." },
  { type: "say", text: "쏟아지는 일과 밀려드는 약속들. 세상에 치여 바쁘게 사는 동안 — 그날의 뜨거웠던 다짐도, 주님의 은혜도 조금씩 잊혀져 갔다." },
  { type: "transition", text: "그러던 어느 날…" },
  { type: "sync", key: "scene_room" },
  { type: "bgm", play: "room" }, /* 🎵 방 프롤로그 시작 */

  /* ───────── 프롤로그: 방 안, 일요일 오전 11시 ───────── */
  { type: "bg", value: "bg-room" },
  { type: "sprite", value: "basic@g" },
  { type: "place", value: "주인공의 방" },
  { type: "date", value: "7월 5일 (일) 오전 11시" },

  /* 🎬 기상 영상 (클립 B — 알람에 깨서 눈 비빔, 파일 없으면 자동 스킵) */
  { type: "video", src: "clip-wake@g" },

  { type: "say", text: "커튼 사이로 들어온 햇살이 얼굴에 닿는다. 시계는 벌써 오전 11시를 가리키고 있다." },
  { type: "say", speaker: "%NAME%", text: "(음… 11시…?)" },
  { type: "sprite", value: "shock@g" },
  { type: "say", speaker: "%NAME%", text: "아… 늦잠 잤다. 지금쯤 교회 말씀 시작했겠는데…" },
  { type: "sprite", value: "roomthink@g" },
  { type: "say", speaker: "%NAME%", text: "(수양회 다녀온 게 엊그제 같은데… 그때 그 뜨거웠던 마음이 왜 이렇게 가물가물하지.)" },
  { type: "say", speaker: "%NAME%", text: "(교회… 가야 되긴 하는데…)" },

  /* 🔀 선택지 — 어느 쪽을 골라도 결국 교회에는 가지 못한다 */
  { type: "choice", flag: "wake",
    options: [
      { label: "지금이라도 간다", value: "go" },
      { label: "그냥 더 잔다", value: "sleep" },
    ] },
  { type: "say-if", flag: "wake", value: "sleep",
    lines: [
      { speaker: "%NAME%", text: "(너무 피곤해… 다음에 가자, 다음에…)" },
      { text: "%NAME_EUN% 이불을 머리끝까지 끌어올린 채, 다시 스르르 눈을 감았다." },
    ] },
  { type: "say-if", flag: "wake", value: "go",
    lines: [
      { speaker: "%NAME%", text: "그래, 지금 나가면 말씀 절반은 들을 수 있어. 가자!" },
      { text: "힘차게 몸을 일으키려는 순간 — 어라…? 침대가 %NAME_EUL% 놓아주지 않는다." },
      { speaker: "%NAME%", text: "(이불이… 원래 이렇게 포근했었나. 딱 5분만… 5분만 더…)" },
      { text: "그렇게 %NAME_EUN% 이불 속으로 다시 빨려 들어가고 말았다." },
    ] },

  { type: "sprite", value: "phone@g" },
  { type: "say", text: "얼마나 잤을까 — 다시 눈을 뜬 %NAME_EUN% 이불 속에서 습관처럼 핸드폰을 집어 들었다." },
  { type: "say", text: "화면 속 사람들은 저마다 반짝이며, 열심히 살아가고 있는 것처럼 보였다." },
  { type: "sprite", value: "roomthink@g" },
  { type: "say", speaker: "%NAME%", text: "(수양회 때는 신앙생활 열심히 하겠다고 그렇게 다짐했는데… 지금 나는 뭘 하고 있는 거지.)" },
  { type: "say", text: "마음 한구석이 헛헛해지던 바로 그 순간 — 화면 위로 알림 하나가 떠올랐다." },

  /* ───────── 푸시 알림 ───────── */
  { type: "notify",
    app: "사랑인 SarangIn",
    title: "[채용알림] 천국상사(주) 동역자 모집 📢",
    body: "주님의 일을 함께할 '동역자'를 모집합니다. #바울처럼 #다윗처럼",
  },

  { type: "bg", value: "bg-room" },
  { type: "sprite", value: "notice@g" },
  { type: "place", value: "" },
  { type: "date", value: "7월 5일 (일)" },
  { type: "say", speaker: "%NAME%", text: "천국상사…? 주님의 동역자… 채용?" },
  { type: "say", speaker: "%NAME%", text: "(주님의 동역자라… 왠지 마음이 가는데. 한번 들어나 볼까?)" },
  { type: "say", text: "%NAME%의 손가락은 어느새 공고를 누르고 있었다." },

  /* ───────── 채용공고 (사람인 앱 포맷) ───────── */
  { type: "jobpost",
    reward: "합격 시 천국 상급",
    company: "(주)천국상사",
    title: "주님의 동역자 부문 신입 채용공고",
    badges: [
      { icon: "💼", label: "정규직" },
      { icon: "📝", label: "신입" },
      { icon: "🔥", label: "주님을 향한\n열정" },
    ],
    info: [
      { k: "마감일", v: "미정" },
      { k: "급여", v: "땅에서와 천국의 상금" },
      { k: "지역", v: "삶의 모든 자리" },
    ],
    foot: "*하단에 명시된 내용보다 넘치도록 부어 주시는 경우가 많습니다.",
    sections: [
      { h: "자격 요건", items: ["구원받은 그리스도인"] },
      { h: "담당 업무", items: ["하나님을 사랑하고 감사하기", "복음 전하기", "주어진 자리에서 빛과 소금 되기", "형제 자매를 섬기기"] },
      { h: "우대 사항", items: ["심령이 가난한 자", "애통하는 자", "온유한 자", "의에 주리고 목마른 자"] },
      { h: "급여 및 복리후생", items: ["급여: 땅에서와 천국의 상금", "성과급: 물 한 잔의 섬김까지 모두 포함", "복리후생: 말씀을 삶에서 경험 가능, 세상이 줄 수 없는 평안", "동행 서비스: 24시간 365일 함께하심"] },
      { h: "상세 일정", items: ["서류 전형", "면접 전형", "최종 발표"] },
    ],
    button: "입사지원",
  },

  /* ───────── 지원 망설임 선택지 ───────── */
  { type: "bg", value: "bg-room" },
  { type: "sprite", value: "roomthink@g" },
  { type: "say", text: "「입사지원」 버튼 위에서, %NAME%의 손가락이 멈칫했다." },
  { type: "choice", flag: "apply",
    options: [
      { label: "지원 버튼을 누른다", value: "yes" },
      { label: "아직 자신이 없다…", value: "no" },
    ] },

  /* 바로 지원하는 경우 */
  { type: "say-if", flag: "apply", value: "yes",
    lines: [
      { speaker: "%NAME%", text: "(그래, 밑져야 본전이지. 한번 지원해 보자!)" },
      { text: "%NAME_EUN% 지원 버튼을 눌렀다." },
    ] },

  /* 망설이는 경우 — 다음 날, 복지 홍보 재알림이 한 번 더 온다 */
  { type: "say-if", flag: "apply", value: "no",
    lines: [
      { speaker: "%NAME%", text: "(주님을 위해 살아온 것도 없는데… 이런 내가 무슨 동역자야.)" },
      { text: "%NAME_EUN% 조용히 핸드폰 화면을 껐다. 하지만 이상하게, 공고 문구가 머릿속을 떠나지 않았다." },
    ] },
  { type: "transition", text: "다음 날…", if: { flag: "apply", value: "no" } },
  { type: "notify", if: { flag: "apply", value: "no" },
    app: "사랑인 SarangIn",
    title: "[재알림] 천국상사(주) 공고, 아직 마감 전입니다 ⏰",
    body: "경력 무관, 지금 모습 그대로 지원 가능! 💚 복리후생: 세상이 줄 수 없는 평안, 24시간 365일 동행 서비스, 물 한 잔의 섬김까지 성과급 지급",
  },
  { type: "bg", value: "bg-room", if: { flag: "apply", value: "no" } },
  { type: "sprite", value: "notice@g", if: { flag: "apply", value: "no" } },
  { type: "say-if", flag: "apply", value: "no",
    lines: [
      { speaker: "%NAME%", text: "또 알림이 왔네…? '경력 무관, 지금 모습 그대로'…" },
      { text: "마치 %NAME%의 망설임을 다 알고 있다는 듯한 문구였다." },
      { speaker: "%NAME%", text: "…그래. 지금 모습 그대로라면, 나도… 한번 지원해 보자." },
    ] },

  /* ───────── 카페: 지원서 작성 (서류 전형) ───────── */
  { type: "sync", key: "scene_cafe" },
  { type: "bg", value: "bg-cafe" },
  { type: "sprite", value: "think@g" },
  { type: "place", value: "동네 카페" },
  { type: "date", value: "7월 13일 (월) — 서류 접수 마감일" },
  { type: "say", text: "%NAME_EUN% 노트북을 챙겨 카페로 나왔다. 화면에는 천국상사 지원서 양식이 떠 있다." },
  { type: "say", speaker: "%NAME%", text: "주님을 위해 살아온 경력이라…" },
  { type: "say", speaker: "%NAME%", text: "(나는 지금껏 주님을 위해 무엇을 하며 살았을까…?)" },
  { type: "bgm", stop: true }, /* 🔇 대기 화면 진입 — 지원서 작성 동안 무음 */

  /* ⛔ 진행자 게이트: 전원 도착 → 진행자가 열면 지원서 작성 시작 */
  { type: "waitAll",
    key: "resume_ready",
    title: "잠시 기다려 주세요",
    sub: "모든 지원자가 도착하면\n진행자가 지원서 작성을 시작합니다." },

  { type: "overlay",
    icon: "✍️",
    title: "지원서 작성 중",
    sub: "책상 위에 놓인 지원서를 작성해 주세요.\n다 작성하셨다면 아래 버튼을 눌러 주세요.",
    button: "작성 완료",
  },
  { type: "waitAll",
    key: "resume_done",
    title: "지원서 제출 완료!",
    sub: "다른 지원자들이 작성을 마칠 때까지 잠시 기다려 주세요.\n진행자가 확인 후 다음으로 넘어갑니다." },

  /* ───────── 서류 합격 문자 ───────── */
  { type: "transition", text: "며칠 후…" },

  { type: "sms",
    from: "천국상사 인재채용팀",
    num: "1004-1004",
    messages: [
      "[Web발신]\n천국상사(주) 인재채용팀입니다.",
      "%NAME%님, 축하드립니다! 🎉\n서류전형에 「합격」하셨습니다.",
      "이어서 면접전형이 진행됩니다.\n\n📅 면접 일시: 8월 8일(토) 오후 2시\n📍 장소: 천국상사(주) 본사 7층 면접장",
    ],
    button: "확인",
  },

  /* ───────── 방: 기쁨 + 스터디 검색 ───────── */
  { type: "sync", key: "scene_room2" },
  { type: "bgm", play: "pass" }, /* 🎵 서류 합격 */
  { type: "bg", value: "bg-room" },
  { type: "sprite", value: "shock@g" },
  { type: "place", value: "" },
  { type: "date", value: "7월 17일 (금) — 서류 합격 발표" },
  { type: "say", speaker: "%NAME%", text: "하… 합격?! 진짜로?!" },
  { type: "sprite", value: "joy@g" },
  { type: "say", text: "%NAME_EUN% 자리에서 벌떡 일어났다. 이렇게 심장이 뛰는 게 얼마 만인지 모르겠다." },

  { type: "sprite", value: "phone@g" },
  { type: "say", speaker: "%NAME%", text: "(면접까지 얼마 안 남았네… 혼자 준비하긴 막막한데.)" },
  { type: "say", text: "%NAME_EUN% 곧바로 핸드폰을 켜고 면접 스터디를 검색하기 시작했다." },
  { type: "say", speaker: "%NAME%", text: "광주교회 스터디… 음, 여긴 너무 멀어." },
  { type: "say", speaker: "%NAME%", text: "서울중앙교회… 여긴 사람이 너무 많을 것 같은데." },
  { type: "say", speaker: "%NAME%", text: "강릉교회… 여기까지 가는 건 거의 여행이잖아." },
  { type: "sprite", value: "found@g" },
  { type: "say", speaker: "%NAME%", text: "시흥서부교회…? 오, 여기가 제일 가깝네. 좋아, 여기로 가봐야겠다!" },

  /* ───────── 면접 스터디 (교회) ───────── */
  { type: "bgm", stop: true }, /* 🔇 스터디 장소는 브금 없음 */
  { type: "transition", text: "스터디 모임 날…" },
  { type: "sync", key: "scene_church" },

  { type: "bg", value: "bg-study" }, /* 실제 교회 스터디룸 사진 (assets/study.png) */
  { type: "sprite", value: "" },
  { type: "place", value: "면접 스터디 모임 장소" },
  { type: "date", value: "7월 19일 (일)" },
  { type: "say", text: "모임 장소에 들어서자, 같은 공고를 보고 지원한 사람들이 둘러앉아 있었다." },
  { type: "say", speaker: "%NAME%", text: "(다들 나랑 같은 공고를 보고 온 사람들이구나… 어? 그런데 왠지 낯익은 얼굴들인데?)" },
  { type: "sprite", value: "img:면접스터디원2@95" },
  { type: "say", speaker: "배강준", text: "%NAME% %CALL%, 오랜만이에요! 너무 반가워요. 그동안 어떻게 지내셨나요?" },
  { type: "say", speaker: "배강준", text: "저도 이번에 지원했거든요. 우리 꼭 같이 붙어요!" },
  { type: "say", text: "%NAME_YI% 반가운 마음에 막 입을 떼려던 그때—" },
  { type: "sprite", value: "img:면접스터디원@150,190" },
  { type: "say", speaker: "송강혁", text: "자자, 면접 스터디 시작하시죠!" },
  { type: "say", speaker: "송강혁", text: "오늘은 각자 지원서에 쓴 내용—지금까지 주님을 위해 어떻게 살아왔는지를 나눠 볼 거예요." },
  { type: "sprite", value: "think@g" },
  { type: "say", speaker: "%NAME%", text: "(주님을 위해 살아온 이야기라… 막상 말하려니, 나는 뭐라고 하지?)" },

  /* ⛔ 진행자 게이트: 전원 도착 → 진행자가 열면 교제 시작 */
  { type: "waitAll",
    key: "study_ready",
    title: "잠시 기다려 주세요",
    sub: "모든 스터디원이 모이면\n진행자가 교제를 시작합니다." },

  { type: "overlay",
    icon: "💬",
    title: "면접 스터디 중",
    sub: "지원서에 적은 내용을 바탕으로,\n지금까지 주님을 위해 무엇을 해왔는지 교제해 주세요.\n교제가 끝나면 완료 버튼을 눌러 주세요.",
    button: "완료",
  },
  { type: "waitAll",
    key: "study_done",
    title: "스터디 종료!",
    sub: "다른 스터디의 교제가 끝날 때까지 잠시 기다려 주세요.\n진행자가 확인 후 다음으로 넘어갑니다." },

  /* ───────── 면접 당일 ───────── */
  { type: "transition", text: "그리고, 면접 당일…" },
  { type: "sync", key: "scene_interview" },

  { type: "bg", value: "bg-interview-wait" },
  { type: "sprite", value: "suit@g" },
  { type: "place", value: "천국상사(주) 면접장 앞" },
  { type: "date", value: "8월 8일 (토) — 면접 전형" },
  { type: "say", text: "%NAME_EUN% 지원서를 손에 꼭 쥔 채, 면접장 앞 의자에 앉아 순서를 기다리고 있다." },
  { type: "sprite", value: "breath@g" },
  { type: "say", speaker: "%NAME%", text: "(떨린다… 나 같은 사람이 정말 합격할 수 있을까.)" },
  { type: "sprite", value: "suit@g" },
  { type: "say", speaker: "직원", text: "%NAME% 지원자님, 들어오세요." },
  { type: "say", text: "문이 열리고, 면접장 안으로 발을 내딛는 순간—" },
  { type: "say", text: "…눈앞이 하얘졌다." },

  /* ───────── 면접관 시점 (화이트 전환, 캐릭터 스프라이트 없음) ───────── */
  { type: "whiteout" },
  { type: "bg", value: "bg-interview-room@g" },
  { type: "sprite", value: "" },
  { type: "place", value: "" },
  { type: "whitein" },
  { type: "say", speaker: "%NAME%", text: "어라… 이게 뭐야..!" },
  { type: "say", text: "정신을 차려 보니, 당신은 면접관의 자리에 앉아 지원자를 바라보고 있습니다. 그 지원자는… 바로 당신입니다." },
  { type: "say", text: "면접관이 된 당신은, 맞은편에 앉은 지원자에게 첫 질문을 던졌다." },
  { type: "say", speaker: "면접관이 된 나", text: "지원자님은… 지금까지 주님을 위해 무엇을 하며 살아오셨습니까?" },
  { type: "say", text: "맞은편의 %NAME_EUN% 쉽게 입을 열지 못했다. 길어지는 그 침묵이 어떤 대답인지 — 당신은 누구보다 잘 알고 있다." },

  { type: "interview",
    q: "지금 손에 들고 있는 지원서를\n면접관의 시점으로 다시 읽어 보세요.\n\n그리고 결정해 주세요.\n당신이 면접관이라면, 이 지원자를…",
    passLabel: "합격",
    failLabel: "불합격",
  },

  { type: "bg", value: "bg-interview-room@g" },
  { type: "sprite", value: "" },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { text: "…당신은 지원자 %NAME_EUL% 「불합격」시켰습니다." },
      { text: "부족한 경력. 빈칸이 많은 지원서. 어쩌면, 당연한 판단일지도 모릅니다." },
    ] },
  { type: "say-if", flag: "verdict", value: "pass",
    lines: [
      { text: "…당신은 지원자 %NAME_EUL% 「합격」시켰습니다." },
      { text: "그런데, 정말 그 서류만 보고 내린 판단이었나요? 어딘가 마음에 걸리는 부분은 없었나요?" },
    ] },

  { type: "waitAll",
    key: "interview_done",
    title: "심사 결과 제출 완료",
    sub: "모든 면접관이 심사를 마칠 때까지 잠시 기다려 주세요.\n진행자가 확인 후 다음으로 넘어갑니다." },

  /* ───────── 면접 후: 낙담한 귀갓길 → 발길이 멈춘 교회 → 조각말씀 (영상) ─────────
     낙심한 걸음이 교회로 이끌리고, 강단에서 선포되는 말씀("그래도 하나님은")이
     이후 "사장님 특별 결재" 최종합격 문자로 회수되는 구조 */
  { type: "bgm", play: "alley" }, /* 🎵 면접 후 돌아가는 길 — 조각말씀 직전까지 유지 */
  { type: "bg", value: "bg-interview-wait" },
  { type: "sprite", value: "somber@g" },
  { type: "place", value: "면접장 앞 복도" },
  { type: "say", text: "면접장을 나선 %NAME_EUN% 복도 의자에 힘없이 주저앉았다." },
  { type: "say", speaker: "%NAME%", text: "(그 지원서가… 나였구나. 빈칸투성이인 그 서류가, 지금까지의 나였어.)" },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { speaker: "%NAME%", text: "(내가 나를 불합격시켰는데… 사장님이라고 다를까.)" },
    ] },
  { type: "say-if", flag: "verdict", value: "pass",
    lines: [
      { speaker: "%NAME%", text: "(합격을 주긴 했지만… 알고 있다. 그 서류만 봐서는, 뽑힐 이유가 없다는 걸.)" },
    ] },

  { type: "bg", value: "bg-alley" },
  { type: "place", value: "집으로 돌아가는 길" },
  { type: "say", text: "%NAME_EUN% 무거운 발걸음으로 집을 향해 걸었다." },
  { type: "say", speaker: "%NAME%", text: "(망했어… 무슨 낯으로 합격을 바라겠어.)" },
  { type: "say", text: "터덜터덜 걷던 그때 — 어디선가 익숙한 찬양 소리가 들려왔다." },

  { type: "bg", value: "bg-church-out" },
  { type: "sprite", value: "wonder@g" },
  { type: "say", speaker: "%NAME%", text: "(여긴… 스터디로 모였던 그 교회잖아. 오늘 말씀이 있었나?)" },
  { type: "say", text: "그냥 지나치려 했는데… 이상하게 발이 떨어지지 않았다." },

  { type: "bgm", stop: true }, /* 🔇 조각말씀 직전 정지 (설교 후 귀갓길에서 이어서 재생) */
  /* 대강당 내부: assets/bg-hall.png 를 넣으면 자동 적용, 없으면 bg-church 로 대체 */
  { type: "bg", value: "bg-hall" },
  { type: "sprite", value: "" },
  { type: "place", value: "교회 대강당" },
  { type: "say", text: "%NAME_EUN% 홀린 듯 대강당 뒷자리에 조용히 앉았다. 마침 강단에서 말씀이 선포되고 있었다." },

  { type: "cue",
    icon: "✝️",
    title: "말씀이 선포되고 있습니다",
    sub: "대강당 뒷자리에 앉았습니다.\n잠시 화면에서 눈을 떼고, 앞의 스크린(강단)을 봐 주세요.\n설교가 끝나면 아래 버튼을 눌러 주세요.",
    button: "말씀 다 들었어요",
  },

  /* ───────── 설교 후: 달라진 발걸음 (assets/bg-alley-dusk.png — 더 어두워진 귀갓길) ───────── */
  { type: "bgm", play: "alley" }, /* 🎵 같은 곡 이어서 재생 — 최종 발표 카페 전까지 */
  { type: "bg", value: "bg-alley-dusk" },
  { type: "sprite", value: "somber@g" },
  { type: "place", value: "집으로 돌아가는 길" },
  { type: "say", text: "교회당을 나서는 %NAME%의 발걸음은, 올 때와는 조금 달라져 있었다." },
  { type: "say", speaker: "%NAME%", text: "(빈손으로 온 나를… 그래도 부르시는 하나님이라니.)" },
  { type: "sprite", value: "hope@g" },
  { type: "say", speaker: "%NAME%", text: "(정말일까. 이런 나에게도… 아직 기회가 있는 걸까.)" },
  { type: "say", text: "가슴 깊은 곳에서, 꺼진 줄로만 알았던 무언가가 다시 희미하게 데워지고 있었다." },

  /* ───────── 최종 합격 확인 (카페) & 사원증 ───────── */
  { type: "transition", text: "며칠 후, 최종 발표 날…" },
  { type: "sync", key: "scene_cafe2" },
  { type: "bgm", play: "cafe2" }, /* 🎵 최종 합격 — 계획서 작성 전까지 유지 */

  { type: "bg", value: "bg-cafe-wait" },
  { type: "sprite", value: "" },
  { type: "place", value: "동네 카페" },
  { type: "date", value: "8월 16일 (일) — 최종 발표" },
  { type: "say", text: "%NAME_EUN% 카페에 앉아 노트북 앞에서 최종 발표를 기다리고 있었다. 새로고침을 누르는 손끝이 떨린다." },

  /* ── 면접에서 「합격」을 준 사람: 최종 합격 화면 ── */
  { type: "bg", value: "bg-cafe-pass", if: { flag: "verdict", value: "pass" } },
  { type: "place", value: "", if: { flag: "verdict", value: "pass" } },
  { type: "say-if", flag: "verdict", value: "pass",
    lines: [
      { text: "그 순간, 화면이 바뀌었다 — 「최종 합격」." },
    ] },
  { type: "sprite", value: "cry@g", if: { flag: "verdict", value: "pass" } },
  { type: "say-if", flag: "verdict", value: "pass",
    lines: [
      { speaker: "%NAME%", text: "…최종 합격. 이런 나를… 정말 뽑아 주셨구나." },
      { speaker: "%NAME%", text: "(나는 어딘가 마음에 걸리는 합격을 줬었는데… 사장님은 내 부족함을 다 아시고도, 진짜 합격을 주셨어.)" },
      { text: "뜨거운 것이 차올라, %NAME%의 눈에서 눈물이 흘러내렸다. 부족한 모습 그대로 불러 주신 그 사랑이 너무나 감사해서." },
    ] },
  { type: "sprite", value: "grateful@g", if: { flag: "verdict", value: "pass" } },
  { type: "say-if", flag: "verdict", value: "pass",
    lines: [
      { speaker: "%NAME%", text: "감사합니다… 정말 감사합니다." },
    ] },
  { type: "sms", if: { flag: "verdict", value: "pass" },
    from: "천국상사 인재채용팀",
    num: "1004-1004",
    messages: [
      "[Web발신]\n천국상사(주) 인재채용팀입니다.",
      "%NAME%님, 최종 「합격」을 진심으로 축하드립니다! 🎉🎉",
      "사실 인사팀에서는 반대 의견도 있었습니다.\n하지만 당신의 부족함까지 다 아시는 사장님께서\n특별 결재로 직접 합격시키셨습니다.",
      "첨부된 사원증을 확인하세요.",
    ],
    button: "사원증 확인하기",
  },

  /* ── 면접에서 「불합격」을 준 사람: 불합격 화면 → 나가려는 순간 추가합격 문자 ── */
  { type: "bg", value: "bg-cafe-fail", if: { flag: "verdict", value: "fail" } },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { text: "그 순간, 화면이 바뀌었다 — 「불합격」." },
    ] },
  { type: "sprite", value: "somber@g", if: { flag: "verdict", value: "fail" } },
  { type: "place", value: "", if: { flag: "verdict", value: "fail" } },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { speaker: "%NAME%", text: "…그래. 그럴 줄 알았어. 나라도… 나를 떨어뜨렸으니까." },
      { text: "%NAME_EUN% 조용히 노트북을 덮었다. 이상하게, 눈물조차 나오지 않았다." },
      { text: "무거운 몸을 일으켜 카페 문을 나서려던 — 바로 그 순간, 핸드폰이 울렸다." },
    ] },
  { type: "sms", if: { flag: "verdict", value: "fail" },
    from: "천국상사 인재채용팀",
    num: "1004-1004",
    messages: [
      "[Web발신]\n천국상사(주) 인재채용팀입니다.",
      "%NAME%님, 「추가 합격」을 진심으로 축하드립니다! 🎉",
      "사실 인사팀 심사 결과는 불합격이었습니다.\n하지만 당신의 부족함까지 다 아시는 사장님께서\n특별 결재로 직접 합격시키셨습니다.",
      "첨부된 사원증을 확인하세요.",
    ],
    button: "확인",
  },
  { type: "bg", value: "bg-cafe", if: { flag: "verdict", value: "fail" } },
  { type: "sprite", value: "cry@g", if: { flag: "verdict", value: "fail" } },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { speaker: "%NAME%", text: "추가… 합격? 인사팀에서는 불합격이었는데… 사장님이, 직접…?" },
      { text: "뜨거운 것이 차올라, %NAME%의 눈에서 눈물이 터져 나왔다. 나조차 떨어뜨렸던 나를, 끝까지 붙들어 주신 그 사랑 때문에." },
    ] },
  { type: "sprite", value: "grateful@g", if: { flag: "verdict", value: "fail" } },
  { type: "say-if", flag: "verdict", value: "fail",
    lines: [
      { speaker: "%NAME%", text: "감사합니다… 정말 감사합니다." },
    ] },

  { type: "idcard",
    role: "주님의 동역자",
    hint: "📸 사진 칸을 눌러 본인 사진을 넣고,\n「사원증 이미지 저장」을 눌러 간직하세요!",
    button: "입사하기",
  },

  /* ───────── 출근길: 지하철 안 ───────── */
  { type: "sync", key: "scene_subway" },
  { type: "bg", value: "bg-subway" },
  { type: "sprite", value: "idcard@g" },
  { type: "place", value: "출근 첫날 — 지하철 안" },
  { type: "date", value: "8월 17일 (월)" },
  { type: "say", text: "입사 첫날 아침. %NAME_EUN% 사원증을 목에 걸고, 회사로 향하는 지하철에 올랐다." },
  { type: "say", speaker: "%NAME%", text: "(이런 나를… 뽑아 주셨구나. 부족한 걸 다 아시면서도.)" },
  { type: "sprite", value: "officethink@g" },
  { type: "say", speaker: "%NAME%", text: "(그 일요일 아침, 이불 속에서 알림 하나를 받았을 땐… 내가 여기까지 오게 될 줄은 몰랐는데.)" },
  { type: "sprite", value: "resolve1@g" },
  { type: "say", speaker: "%NAME%", text: "지금부터라도 주님을 위해 열심히 살아야겠어!" },
  { type: "sprite", value: "officethink@g" },
  { type: "say", speaker: "%NAME%", text: "(…아니, 잠깐. 수양회 끝날 때도 똑같이 다짐했었잖아. 그리고 며칠 만에 다 잊어버렸었지.)" },
  { type: "sprite", value: "resolve1@g" },
  { type: "say", speaker: "%NAME%", text: "(하지만 이번엔 달라. 그때는 나 혼자 한 결심이었지만 — 지금은 부족한 나를 다 아시고도 뽑아 주신 사장님이 계시잖아.)" },
  { type: "sprite", value: "puzzled@g" },
  { type: "say", speaker: "%NAME%", text: "그런데… 어떻게 사는 게 주님을 위해 사는 걸까?" },
  { type: "say", text: "그때, 핸드폰이 짧게 울렸다." },

  /* ───────── 사장님의 첫 업무 지시 ───────── */
  { type: "notify",
    app: "천국상사 사내메신저",
    title: "[업무지시] 사장님으로부터 첫 업무가 도착했습니다 📋",
    body: "신입 동역자님, 입사를 환영합니다. 첫 업무: 「이제 주님을 위해 어떻게 살 것인지」 실천 계획서를 작성해 제출해 주세요.",
  },

  { type: "bg", value: "bg-subway" },
  { type: "sprite", value: "officenotice@g" },
  { type: "say", speaker: "%NAME%", text: "첫 업무가… 실천 계획서 제출이라고?" },
  { type: "sprite", value: "resolve1@g" },
  { type: "say", speaker: "%NAME%", text: "(그래. 마음만 앞서지 말고, 하나씩 구체적으로 적어 보자.)" },

  { type: "bgm", stop: true }, /* 🔇 계획서 작성 중에는 무음 */
  { type: "overlay",
    icon: "📝",
    title: "계획서 작성 중",
    sub: "나눠 드린 종이에 “이제 주님을 위해 어떻게 살 것인지”\n구체적인 실천 계획을 적어 주세요.\n작성이 끝나면 아래 버튼을 눌러 주세요.",
    button: "작성 완료",
  },
  { type: "waitAll",
    key: "plan_written",
    title: "작성 완료!",
    sub: "다른 분들이 작성을 마칠 때까지 잠시 기다려 주세요.\n전원이 완료되면 진행자가 교제를 시작합니다." },

  { type: "overlay",
    icon: "💬",
    title: "교제 나누는 중",
    sub: "작성한 실천 계획을 형제자매님들과 함께 나눠 주세요.\n교제가 끝나면 아래 버튼을 눌러 주세요.",
    button: "교제 완료",
  },
  { type: "waitAll",
    key: "plan_done",
    title: "교제 완료!",
    sub: "다른 팀의 교제가 끝날 때까지 잠시 기다려 주세요.\n진행자가 확인 후 다음으로 넘어갑니다." },

  /* ───────── 엔딩 영상: 회사 앞, 두 사람이 힘차게 뛰어 들어감 ─────────
     (두 번째 조각말씀 영상은 사용하지 않기로 함 — 교제 후 바로 엔딩) */
  { type: "bgm", play: "ending" }, /* 🎵 엔딩 — "지하철에서 내려" 전환부터 */
  { type: "transition", text: "지하철에서 내려, 회사 앞…" },
  /* 🎬 엔딩 영상 — 성별별 (assets/ending-m.mp4 / ending-f.mp4, 무음) */
  { type: "video", src: "ending@g" },

  /* ───────── 엔딩 크레딧: 최종 합격자 명단 롤 ───────── */
  { type: "credits" },

  /* ───────── 에필로그 & 크레딧 (2026-07-31 제거: 엔딩 영상으로 종료) ─────────
  { type: "sync", key: "scene_ending" },
  { type: "ending",
    verse1: "“그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라\n이전 것은 지나갔으니 보라 새 것이 되었도다”",
    ref1: "고린도후서 5:17 — REMIND",
    verse2: "“푯대를 향하여 그리스도 예수 안에서\n하나님이 위에서 부르신 부름의 상을 위하여 좇아가노라”",
    ref2: "빌립보서 3:14 — RESTART",
    msg: "%NAME% %CALL%의 입사를 진심으로 축하합니다.",
  },
  ───────────────────────────────────────────────────────── */
];
