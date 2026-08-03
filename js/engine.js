/* ============================================================
   engine.js — 화면을 그리고 스토리를 진행시키는 엔진
   (내용 수정은 story.js에서 하세요)
   ============================================================ */

const app = document.getElementById("app");

const player = {
  name: "",     // 성을 뺀 "이름" — 게임 속 호칭용 (%NAME%)
  fullName: "", // 성+이름 — 서류/사원증/명단 표기용
  gender: "male", // male=형제, female=자매
  flags: {},
};

/* ---------- 성+이름에서 "이름"만 추출 ---------- */
const TWO_CHAR_SURNAMES = ["남궁", "황보", "제갈", "사공", "선우", "서문", "독고", "동방"];
function givenNameOf(full) {
  const n = full.replace(/\s+/g, "");
  if (!/^[가-힣]{2,5}$/.test(n)) return full; // 한글 성명 꼴이 아니면 그대로 사용
  if (n.length >= 3 && TWO_CHAR_SURNAMES.includes(n.slice(0, 2))) return n.slice(2);
  return n.slice(1);
}

/* ---------- 한글 조사 처리 ---------- */
function hasBatchim(str) {
  if (!str) return false;
  const code = str.charCodeAt(str.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false; // 한글 아니면 받침 없음 취급
  return (code - 0xac00) % 28 > 0;
}
function sub(text) {
  if (!text) return "";
  const n = player.name;
  const b = hasBatchim(n);
  return text
    .replaceAll("%NAME_EUN%", n + (b ? "은" : "는"))
    .replaceAll("%NAME_YI%", n + (b ? "이" : "가"))
    .replaceAll("%NAME_EUL%", n + (b ? "을" : "를"))
    .replaceAll("%NAME%", n)
    .replaceAll("%CALL%", player.gender === "male" ? "형제님" : "자매님");
}
function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}
function nl2br(s) { return esc(s).replaceAll("\n", "<br>"); }

function screen(cls, html) {
  app.innerHTML = "";
  const el = document.createElement("div");
  el.className = "screen " + cls;
  el.innerHTML = html;
  app.appendChild(el);
  return el;
}

const spriteFor = () => (player.gender === "male" ? "🧑🏻" : "👩🏻");

/* ---------- 타이틀 ---------- */
function showTitle() {
  return new Promise((resolve) => {
    const el = screen("title-screen", `
      <div class="title-main">REMIND<br>RESTART</div>
      <div class="title-touch">화면을 터치하면 시작됩니다</div>
    `);
    el.onclick = resolve;
  });
}

/* ---------- 캐릭터 생성 ---------- */
function showCreate() {
  return new Promise((resolve) => {
    const el = screen("create-screen", `
      <h2>이름을 적어주세요</h2>
      <div class="gender-row">
        <div class="gender-card" data-g="male"><img class="char-img" src="assets/char-male.png" alt="형제"><span class="label">형제</span></div>
        <div class="gender-card" data-g="female"><img class="char-img" src="assets/char-female.png" alt="자매"><span class="label">자매</span></div>
      </div>
      <input class="name-input" id="nameInput" maxlength="10" placeholder="성과 이름을 함께 적어주세요">
      <div class="name-hint">예) 김믿음 — 게임 속에서는 "믿음"으로 불러 드려요</div>
      <button class="btn" id="goBtn">확인</button>
    `);
    el.querySelectorAll(".char-img").forEach((img) => {
      img.onerror = () => {
        const fb = document.createElement("span");
        fb.className = "face";
        fb.textContent = img.alt === "형제" ? "🙋‍♂️" : "🙋‍♀️";
        img.replaceWith(fb);
      };
    });
    const cards = el.querySelectorAll(".gender-card");
    cards.forEach((c) => {
      c.onclick = () => {
        cards.forEach((x) => x.classList.remove("sel"));
        c.classList.add("sel");
        player.gender = c.dataset.g;
      };
    });
    cards[0].classList.add("sel");
    el.querySelector("#goBtn").onclick = () => {
      const full = el.querySelector("#nameInput").value.trim();
      if (!full) { el.querySelector("#nameInput").focus(); return; }
      player.fullName = full;
      player.name = givenNameOf(full); // 게임 속에서는 성을 뺀 이름으로 부름
      Sync.join({ name: full, gender: player.gender });
      resolve();
    };
  });
}

/* ---------- 영상 재생 (스토리 중간 삽입용, 파일 없으면 자동 스킵) ----------
   src: "ending@g" → assets/ending-m.mp4 / ending-f.mp4 (성별 자동)
        "clip-wake@g" → assets/clip-wake-m.mp4 / clip-wake-f.mp4 (성별 자동) */
function showVideo(step) {
  return new Promise((resolve) => {
    const src = `assets/${resolveBg(step.src)}.mp4`;
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const el = screen("video-screen", `
      <video id="introVid" src="${src}" autoplay muted playsinline></video>
    `);
    const v = el.querySelector("#introVid");
    v.muted = true; // 모든 삽입 영상은 무음 재생
    v.onended = finish;
    v.onerror = finish; // 영상 파일이 없으면 조용히 넘어감
    v.play().catch(finish);
  });
}

/* ---------- 인트로 영상 (성별별, 파일 없으면 자동 스킵) ---------- */
function showIntroVideo() {
  return showVideo({ src: "intro@g" });
}

/* ---------- 시작 전 터치 스플래시 ----------
   브라우저는 사용자가 화면을 터치하기 전엔 오디오 재생을 막기 때문에,
   여기서 터치를 한 번 받아야 시작 영상 첫 화면부터 BGM이 나올 수 있음 */
function showTapStart() {
  return new Promise((resolve) => {
    const el = screen("tap-screen", `
      <div class="tap-wait">잠시만 기다려 주세요<span class="dots"></span></div>
    `);
    el.onclick = () => {
      // 첫 터치를 이용해 전체화면 전환 → 주소창 숨김 (미지원 브라우저는 그냥 진행)
      const rt = document.documentElement;
      if (rt.requestFullscreen) rt.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
      resolve();
    };
  });
}

/* ---------- 화면 꺼짐 방지 (Wake Lock) ----------
   설교 시청·실물 작성 중 폰 화면이 꺼지면 브라우저가 리로드될 수 있음.
   미지원 브라우저는 조용히 무시. 화면이 다시 보이면 자동 재획득 */
async function keepAwake() {
  try { await navigator.wakeLock.request("screen"); } catch {}
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") keepAwake();
});

/* ---------- 진행 저장 / 이어하기 ----------
   매 스텝 위치와 선택(flags)을 폰에 저장 → 새로고침·리로드 시
   "이어하기"로 그 장면부터 복구 (12시간 지난 기록은 무시) */
const SAVE_KEY = "hs_save";
function saveProgress(i) {
  if (!player.fullName) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1, i, flags: player.flags,
      fullName: player.fullName, gender: player.gender, ts: Date.now(),
    }));
  } catch {}
}
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s || s.v !== 1 || !s.fullName) return null;
    if (!(s.i > 0 && s.i < STORY.length)) return null;
    if (Date.now() - s.ts > 12 * 3600 * 1000) return null; // 12시간 경과 → 무시
    return s;
  } catch { return null; }
}
/* 저장 지점까지 배경/스프라이트/장소/날짜 상태를 재구성 (화면 렌더링 없이) */
function fastForward(end) {
  let lastBgm = null;
  for (let j = 0; j < end; j++) {
    const s = STORY[j];
    if (s.if && player.flags[s.if.flag] !== s.if.value) continue;
    if (s.type === "bg") vn.bg = s.value;
    else if (s.type === "sprite") vn.sprite = s.value;
    else if (s.type === "place") vn.place = s.value;
    else if (s.type === "date") vn.date = s.value;
    else if (s.type === "bgm") lastBgm = s.stop ? null : s.play;
  }
  if (lastBgm) demoBgm(lastBgm); // 데모 모드일 때만 재생됨
}
function showResumePrompt(save) {
  return new Promise((resolve) => {
    const el = screen("cue-screen", `
      <div class="cue-icon">🔄</div>
      <div class="cue-title">진행하던 기록이 있습니다</div>
      <div class="cue-sub">${esc(save.fullName)} ${save.gender === "male" ? "형제" : "자매"}님,<br>중단된 장면부터 이어서 진행할 수 있습니다.</div>
      <button class="btn" id="resumeBtn" style="max-width:300px">이어하기</button>
      <button class="btn ghost" id="restartBtn" style="max-width:300px;margin-top:12px">처음부터 시작</button>
    `);
    el.querySelector("#resumeBtn").onclick = () => resolve(true);
    el.querySelector("#restartBtn").onclick = () => resolve(false);
  });
}

/* ---------- 게임 시작 게이트 ----------
   탭 화면 터치 직후 기기를 접속자로 등록(이름 입력 전, 인원수만 집계)하고,
   진행자가 admin.html 에서 [게임 시작]을 열 때까지 대기.
   → 전원이 같은 순간에 시작 영상부터 시작 + 그 순간 시작곡 자동 재생 */
function waitGameStart() {
  if (Sync.isDemo) return Promise.resolve();
  return new Promise((resolve) => {
    // 참가자에게는 탭 화면과 똑같은 "잠시만 기다려 주세요"만 보여줌
    // (접속 인원은 진행자 콘솔에서만 확인)
    screen("tap-screen", `
      <div class="tap-wait">잠시만 기다려 주세요<span class="dots"></span></div>
    `);
    Sync.connect(); // 전체 참가자 수에 즉시 집계 (이름은 입력 후 채워짐)
    Sync.submit("game_start", { name: "" });
    Sync.waitForAll("game_start", () => {}).then(resolve);
  });
}

/* ---------- 에셋 미리 내려받기 (장면 전환 시 사진이 늦게 뜨는 딜레이 방지) ---------- */
function preloadQueue(urls) {
  const q = [...new Set(urls)];
  const next = () => {
    if (!q.length) return;
    const img = new Image();
    img.onload = img.onerror = next;
    img.src = q.shift();
  };
  for (let i = 0; i < 3; i++) next(); // 동시에 3개씩
}
function preloadBackgrounds() {
  // CSS에 등록된 모든 배경 이미지를 수집해 미리 받는다
  const urls = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules || []) {
      const bg = r.style && r.style.backgroundImage;
      if (!bg) continue;
      for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) urls.push(m[1]);
    }
  }
  preloadQueue(urls);
}
function preloadSprites() {
  // 스토리에 등장하는 스프라이트(선택한 성별)를 전부 미리 받는다
  const g = player.gender === "male" ? "m" : "f";
  const urls = [];
  for (const s of STORY) {
    if (s.type !== "sprite" || typeof s.value !== "string") continue;
    if (s.value.endsWith("@g")) urls.push(`assets/sprite-${s.value.slice(0, -2)}-${g}.png`);
    else if (s.value.startsWith("img:")) urls.push(`assets/${s.value.slice(4).replace(/@[\d,-]*$/, "")}.png`);
  }
  preloadQueue(urls);
}

/* ---------- 시작 영상 (start.mp4 무음 재생) ----------
   영상 자체에 "화면을 터치하세요" 문구가 들어 있음 → 영상이 끝나면
   마지막 프레임에 멈춘 상태로 터치를 기다렸다가 다음으로 진행.
   영상이 없거나 재생 실패 시 기존 타이틀 화면으로 폴백 */
function showStartVideo() {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const el = screen("video-screen", `
      <video id="startVid" src="assets/start.mp4" autoplay muted playsinline></video>
    `);
    const v = el.querySelector("#startVid");
    v.muted = true;
    demoBgm("start"); // 시작곡 — 첫 영상 시작과 동시에 (데모 모드 전용)
    // 영상 속 "화면을 터치하세요" 문구에 맞춰, 끝나기 7초 전부터 터치 허용
    v.ontimeupdate = () => {
      if (v.duration && v.currentTime >= v.duration - 7) {
        el.onclick = finish;
        v.ontimeupdate = null;
      }
    };
    v.onended = () => { el.onclick = finish; }; // 안전망
    v.onerror = () => { if (!done) showTitle().then(finish); };
    v.play().catch(() => { el.onclick = finish; });
  });
}

/* ---------- 비주얼노벨 대사 ---------- */
const vn = { bg: "bg-room", sprite: "", place: "", date: "", el: null };

function ensureVN() {
  if (vn.el && document.body.contains(vn.el)) return vn.el;
  const el = screen("vn-screen", `
    <div class="vn-bg ${vn.bg}"></div>
    <div class="vn-place" style="display:none"></div>
    <div class="vn-date" style="display:none"></div>
    <div class="vn-sprite" style="display:none"></div>
    <div class="vn-box">
      <span class="vn-name" style="display:none"></span>
      <div class="vn-text"></div>
      <span class="vn-next">▼ 탭해서 계속</span>
    </div>
  `);
  vn.el = el;
  return el;
}
/* 배경 값이 "@g"로 끝나면 성별에 따라 -m / -f 클래스로 변환 */
function resolveBg(v) {
  if (!v) return v;
  return v.endsWith("@g") ? v.slice(0, -2) + (player.gender === "male" ? "-m" : "-f") : v;
}

function refreshVN() {
  const el = ensureVN();
  el.querySelector(".vn-bg").className = "vn-bg " + resolveBg(vn.bg);
  const pl = el.querySelector(".vn-place");
  pl.style.display = vn.place ? "" : "none";
  pl.textContent = vn.place;
  const dt = el.querySelector(".vn-date");
  dt.style.display = vn.date ? "" : "none";
  dt.textContent = vn.date;
  const sp = el.querySelector(".vn-sprite");
  // img: 스프라이트(성별 무관 실사 인물)는 잘라내지 않고 대사창 위에 전체를 보여줌
  sp.classList.toggle("fit", vn.sprite.startsWith("img:"));
  if (!vn.sprite) {
    sp.style.display = "none";
    sp.innerHTML = "";
  } else if (vn.sprite.endsWith("@g")) {
    // "think@g" → assets/sprite-think-m.png / sprite-think-f.png
    const src = `assets/sprite-${vn.sprite.slice(0, -2)}-${player.gender === "male" ? "m" : "f"}.png`;
    sp.style.display = "";
    sp.innerHTML = `<img src="${src}" alt="" onerror="this.parentElement.style.display='none'">`;
  } else if (vn.sprite.startsWith("img:")) {
    // "img:면접스터디원2@80" → assets/면접스터디원2.png 를 80% 크기로 표시
    // "img:면접스터디원@135,18" → 135% 크기 + 18px 아래로 이동
    // (@숫자 생략 시 100%. 사진 하단은 화면 하단에 붙음)
    let name = vn.sprite.slice(4), scale = 100, dy = 0;
    const m = name.match(/@(\d+)(?:,(-?\d+))?$/);
    if (m) { scale = +m[1]; dy = +(m[2] || 0); name = name.slice(0, -m[0].length); }
    const src = `assets/${name}.png`;
    sp.style.display = "";
    sp.innerHTML = `<img src="${src}" alt="" style="width:${scale}%;height:${scale}%;margin-bottom:${-dy}px" onerror="this.parentElement.style.display='none'">`;
  } else {
    sp.style.display = "";
    sp.textContent = vn.sprite === "auto" ? spriteFor() : vn.sprite;
  }
}

function showSay(step) {
  return new Promise((resolve) => {
    const el = ensureVN();
    refreshVN();
    const nameEl = el.querySelector(".vn-name");
    const textEl = el.querySelector(".vn-text");
    const speaker = step.speaker ? sub(step.speaker) : "";
    nameEl.style.display = speaker ? "" : "none";
    nameEl.textContent = speaker;

    const full = sub(step.text);
    let idx = 0;
    let typing = true;
    textEl.textContent = "";
    const timer = setInterval(() => {
      idx++;
      textEl.textContent = full.slice(0, idx);
      if (idx >= full.length) { clearInterval(timer); typing = false; }
    }, 28);

    el.onclick = () => {
      if (typing) {
        clearInterval(timer);
        textEl.textContent = full;
        typing = false;
      } else {
        el.onclick = null;
        resolve();
      }
    };
  });
}

/* ---------- 선택지 ----------
   { type: "choice", flag: "wake", options: [{ label, value }, …] }
   선택 결과는 player.flags[flag] 에 저장 → say-if 로 분기 */
function showChoice(step) {
  return new Promise((resolve) => {
    const el = ensureVN();
    refreshVN();
    const wrap = document.createElement("div");
    wrap.className = "vn-choices";
    wrap.innerHTML = step.options
      .map((o) => `<button class="vn-choice" data-v="${esc(o.value)}">${esc(sub(o.label))}</button>`)
      .join("");
    el.appendChild(wrap);
    wrap.querySelectorAll(".vn-choice").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        player.flags[step.flag] = b.dataset.v;
        wrap.remove();
        resolve();
      };
    });
  });
}

/* ---------- 푸시 알림 ---------- */
function showNotify(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("notify-screen", `
      <div class="phone-clock">
        <div class="time">3:14</div>
        <div class="date">7월 5일 일요일</div>
      </div>
      <div class="notify-card">
        <div class="notify-head">
          <div class="notify-appicon">✝️</div>
          <div class="notify-app">${esc(step.app)}</div>
          <div class="notify-time">지금</div>
        </div>
        <div class="notify-title">${esc(step.title)}</div>
        <div class="notify-body">${esc(step.body)}</div>
      </div>
      <div class="notify-hint">알림을 눌러 확인하세요</div>
    `);
    el.querySelector(".notify-card").onclick = resolve;
  });
}

/* ---------- 채용공고 (사람인 앱 스타일) ---------- */
function showJobpost(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const badges = step.badges.map((b) => `
      <div class="sr-badge"><div class="ic">${b.icon}</div><span>${esc(b.label)}</span></div>`).join("");
    const infos = step.info.map((r) => `
      <div class="sr-info-row">
        <span class="k">${esc(r.k)}</span>
        <span class="v">${esc(r.v)}${r.d ? `&ensp;<b class="dday">| ${esc(r.d)}</b>` : ""}</span>
      </div>`).join("");
    const secs = step.sections.map((s) => `
      <div class="sr-sec">
        <h4>${esc(s.h)}</h4>
        <ul>${s.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
      </div>`).join("");
    const el = screen("jobpost-screen", `
      <div class="sr-appbar">
        <span class="sr-back">〈</span>
        <span class="sr-abtitle">채용정보 <span class="cnt">(1/1)</span></span>
        <span class="sr-share"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="12" r="2.3"/><circle cx="17.5" cy="5.5" r="2.3"/><circle cx="17.5" cy="18.5" r="2.3"/><path d="M8.1 10.9l7.3-4.3M8.1 13.1l7.3 4.3"/></svg></span>
      </div>
      <div class="sr-scroll">
        <div class="sr-card">
          <div class="sr-reward">✝ ${esc(step.reward)}</div>
          <div class="sr-co"><span class="heart">♡</span> ${esc(step.company)}</div>
          <div class="sr-title">${esc(step.title)}</div>
          <div class="sr-badges">${badges}</div>
          <div class="sr-divider"></div>
          ${step.banner ? `<div class="sr-banner">${esc(step.banner[0])}<br><b>${esc(step.banner[1])}</b></div>` : ""}
          <div class="sr-infos">${infos}</div>
          ${step.foot ? `<div class="sr-foot-note">${esc(step.foot)}</div>` : ""}
          ${secs}
        </div>
      </div>
      <div class="sr-bottom">
        <button class="sr-scrap" id="scrapBtn"><span class="star">☆</span> 스크랩</button>
        <button class="sr-apply" id="applyBtn">${esc(step.button)}</button>
      </div>
    `);
    const scrap = el.querySelector("#scrapBtn");
    scrap.onclick = () => {
      scrap.classList.toggle("on");
      scrap.querySelector(".star").textContent = scrap.classList.contains("on") ? "★" : "☆";
    };
    el.querySelector("#applyBtn").onclick = resolve;
  });
}

/* ---------- 문자 메시지 ---------- */
function showSms(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const bubbles = step.messages.map((m, i) =>
      `<div class="sms-bubble" style="animation-delay:${i * 0.9}s">${nl2br(sub(m))}</div>`).join("");
    const el = screen("sms-screen", `
      <div class="sms-appbar">
        <div class="from">${esc(step.from)}</div>
        <div class="num">${esc(step.num || "")}</div>
      </div>
      <div class="sms-body">${bubbles}</div>
      <div class="sms-foot"><button class="btn" id="okBtn" style="visibility:hidden">${esc(step.button)}</button></div>
    `);
    const btn = el.querySelector("#okBtn");
    setTimeout(() => { btn.style.visibility = "visible"; }, step.messages.length * 900 + 400);
    btn.onclick = resolve;
  });
}

/* ---------- 작성 중 오버레이 ---------- */
function showOverlay(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("overlay-screen", `
      <div class="overlay-icon">${step.icon || "✍️"}</div>
      <div class="overlay-title">${esc(step.title)}<span class="dots"></span></div>
      <div class="overlay-sub">${nl2br(sub(step.sub))}</div>
      <button class="btn" id="doneBtn">${esc(step.button)}</button>
    `);
    let done = false, off = () => {};
    const finish = () => { if (!done) { done = true; off(); resolve(); } };
    // 진행자가 게이트를 열면 완료 버튼을 누르지 않아도 진행
    if (step.gate) off = Sync.onGateOpen(step.gate, finish);
    el.querySelector("#doneBtn").onclick = finish;
  });
}

/* ---------- 데모 모드 BGM (파이어베이스 없이 혼자 테스트용) ----------
   story.js 의 { type: "bgm", play: "키" } / { type: "bgm", stop: true }
   스텝이 정확한 대사 지점에서 켜고 끔. 실전(Firebase) 모드에서는 재생 안 됨
   — 진행자 콘솔(admin.html)의 BGM 패널이 스피커로 트는 방식이 정식 운영. */
const DEMO_BGM = {
  start:  "assets/start_bgm.mp3",  // 첫 영상 시작 시 (showStartVideo에서 직접 호출)
  room:   "assets/room_bgm.mp3",
  pass:   "assets/pass_bgm.mp3",
  alley:  "assets/alley_bgm.mp3", // 면접 후 돌아가는 길
  cafe2:  "assets/cafe2_bgm.mp3",
  ending: "assets/ending_bgm.mp3",
};
const demoBgmEl = new Audio();
demoBgmEl.loop = true;
demoBgmEl.volume = 0.8;
function demoBgm(key) {
  if (!Sync.isDemo) return; // 실전 모드에서는 폰에서 BGM 재생 금지
  const f = DEMO_BGM[key];
  if (!f) return;
  // 같은 곡이 일시정지 상태면 처음부터 다시 틀지 않고 이어서 재생
  if (demoBgmEl.src && demoBgmEl.src.endsWith(encodeURI(f))) {
    demoBgmEl.play().catch(() => {});
    return;
  }
  demoBgmEl.src = f;
  demoBgmEl.play().catch(() => {
    // 페이지 로드 직후엔 자동재생이 막힐 수 있음 → 첫 터치 때 재생
    const once = () => { demoBgmEl.play().catch(() => {}); document.removeEventListener("pointerdown", once); };
    document.addEventListener("pointerdown", once);
  });
}
function demoBgmStop() {
  if (!Sync.isDemo) return;
  demoBgmEl.pause();
}

/* ---------- 전원 완료 대기 ---------- */
function showWaitAll(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("wait-screen", `
      <div class="spinner"></div>
      <div class="wait-title">${esc(step.title)}</div>
      <div class="wait-count">- / -</div>
      <div class="wait-sub">${nl2br(sub(step.sub))}</div>
      ${Sync.isDemo ? `<div class="demo-tag">데모 모드 — 화면을 탭하면 다음으로 진행됩니다</div>` : ""}
    `);
    const countEl = el.querySelector(".wait-count");
    Sync.submit(step.key, { name: player.fullName, flags: player.flags });
    Sync.waitForAll(step.key, (done, total) => {
      countEl.textContent = `${done} / ${total}`;
    }).then(resolve);
    if (Sync.isDemo) {
      el.onclick = () => Sync._tapToResolve && Sync._tapToResolve();
    }
  });
}

/* ---------- 장면 동기화 (전원 도착 시 자동 진행) ---------- */
function showSyncPoint(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("wait-screen", `
      <div class="spinner"></div>
      <div class="wait-title">${esc(step.title || "잠시 대기 중")}</div>
      <div class="wait-count">- / -</div>
      <div class="wait-sub">${nl2br(sub(step.sub || "모든 인원이 도착하면 자동으로 넘어갑니다."))}</div>
      ${Sync.isDemo ? `<div class="demo-tag">데모 모드 — 잠시 후 자동 진행</div>` : ""}
    `);
    const countEl = el.querySelector(".wait-count");
    Sync.submit(step.key, { name: player.fullName });
    Sync.waitForBarrier(step.key, (done, total) => {
      countEl.textContent = `${done} / ${total}`;
    }).then(resolve);
  });
}

/* ---------- 전환 (3일 후…) ---------- */
function showTransition(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("transition-screen", `
      <div class="transition-text">${nl2br(sub(step.text))}</div>
    `);
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    setTimeout(finish, 2400);
    el.onclick = finish;
  });
}

/* ---------- 면접관 시점 ---------- */
function showInterview(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const today = new Date();
    const el = screen("interview-screen", `
      <div class="pov-label">— INTERVIEWER MODE —</div>
      <div class="resume-paper">
        <h3>이 력 서</h3>
        <div class="resume-row"><span class="k">지원자</span><span class="v">${esc(player.fullName)}</span></div>
        <div class="resume-row"><span class="k">지원 분야</span><span class="v">주님의 동역자 (신입)</span></div>
        <div class="resume-row"><span class="k">접수일</span><span class="v">${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}</span></div>
        <div class="resume-note">※ 상세 내용은 지금 손에 들고 계신 서류입니다.<br>면접관의 눈으로 천천히 다시 읽어 보세요.</div>
      </div>
      <div class="interview-q">${nl2br(sub(step.q))}</div>
      <div class="interview-btns">
        <button class="btn pass" id="passBtn">${esc(step.passLabel)}</button>
        <button class="btn fail" id="failBtn">${esc(step.failLabel)}</button>
      </div>
      ${step.note ? `<div class="private-note">🔒 ${esc(step.note)}</div>` : ""}
    `);
    el.querySelector("#passBtn").onclick = () => { player.flags.verdict = "pass"; resolve(); };
    el.querySelector("#failBtn").onclick = () => { player.flags.verdict = "fail"; resolve(); };
  });
}

/* ---------- 하나님의 도장 ---------- */
function showStamp(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("stamp-screen", `
      <div class="stamp-paper">
        <h3>${esc(step.heading)}</h3>
        <div class="stamp-name">지원자 &nbsp;${esc(player.name)}</div>
        <div class="stamp-mark">합 격</div>
        <div class="stamp-verse">${nl2br(step.verse)}</div>
      </div>
    `);
    requestAnimationFrame(() => el.querySelector(".stamp-mark").classList.add("on"));
    setTimeout(() => { el.onclick = resolve; }, 1600);
  });
}

/* ---------- 스크린 큐 ---------- */
function showCue(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("cue-screen", `
      <div class="cue-icon">${step.icon || "🎬"}</div>
      <div class="cue-title">${esc(step.title)}</div>
      <div class="cue-sub">${nl2br(sub(step.sub))}</div>
      <button class="btn ghost" id="cueBtn">${esc(step.button)}</button>
    `);
    el.querySelector("#cueBtn").onclick = resolve;
  });
}

/* ---------- 사원증 ---------- */
/* 사원증을 캔버스에 그려 PNG 데이터로 만든다 (photoImg: 증명사진 Image 또는 null) */
function renderIdcardPng(photoImg, role) {
  const W = 300, H = 460, S = 3; // CSS px 기준 좌표 × 3배 해상도
  const cv = document.createElement("canvas");
  cv.width = W * S; cv.height = H * S;
  const ctx = cv.getContext("2d");
  ctx.scale(S, S);
  const FONT = getComputedStyle(document.body).fontFamily || "sans-serif";

  // 카드 몸통 (흰색, 둥근 모서리) — 이후 모든 그리기는 카드 안쪽으로 클리핑
  const r = 18;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(W, 0, W, H, r); ctx.arcTo(W, H, 0, H, r);
  ctx.arcTo(0, H, 0, 0, r); ctx.arcTo(0, 0, W, 0, r); ctx.closePath();
  ctx.save(); ctx.clip();
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);

  // 위/아래 물결 배너 (파랑 그라데이션)
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#2e7cd6"); grad.addColorStop(1, "#66b7ea");
  ctx.fillStyle = grad;
  ctx.beginPath(); // 상단: 왼쪽이 두껍고 오른쪽으로 갈수록 얇아지는 곡선 띠
  ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 22);
  ctx.bezierCurveTo(220, 52, 90, 56, 0, 40); ctx.closePath(); ctx.fill();
  ctx.beginPath(); // 하단: 반대 방향 곡선 띠
  ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, H - 40);
  ctx.bezierCurveTo(210, H - 58, 80, H - 52, 0, H - 24); ctx.closePath(); ctx.fill();

  // 글자 간격을 수동으로 벌려 그리는 헬퍼 (letterSpacing 미지원 브라우저 대응)
  const spaced = (text, cx, y, gap) => {
    const chs = [...text], ws = chs.map((c) => ctx.measureText(c).width);
    let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * (chs.length - 1)) / 2;
    ctx.textAlign = "left";
    chs.forEach((c, i) => { ctx.fillText(c, x, y); x += ws[i] + gap; });
    ctx.textAlign = "center";
  };
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

  // 타이틀
  ctx.fillStyle = "#1c2c4e";
  ctx.font = `800 24px ${FONT}`;
  spaced("사원증", W / 2, 90, 22);

  // 증명사진 (132×168, object-fit: cover)
  const pw = 132, ph = 168, px = (W - pw) / 2, py = 112;
  ctx.fillStyle = "#f3f6fa"; ctx.fillRect(px, py, pw, ph);
  if (photoImg) {
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    const sc = Math.max(pw / photoImg.naturalWidth, ph / photoImg.naturalHeight);
    const dw = photoImg.naturalWidth * sc, dh = photoImg.naturalHeight * sc;
    ctx.drawImage(photoImg, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    ctx.font = `56px ${FONT}`;
    ctx.fillStyle = "#7d8aa0"; ctx.fillText("👤", W / 2, py + 105);
  }
  ctx.strokeStyle = "#c9d3e0"; ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

  // 이름 / 직분
  ctx.fillStyle = "#1c2c4e";
  ctx.font = `800 26px ${FONT}`;
  spaced(player.fullName, W / 2, 332, 8);
  ctx.fillStyle = "#5c6d8a";
  ctx.font = `12px ${FONT}`;
  spaced(role, W / 2, 356, 2);

  // 로고
  ctx.fillStyle = "#2e7cd6";
  ctx.font = `700 15px ${FONT}`;
  ctx.fillText("✝️ 천국상사(주)", W / 2, 392);
  ctx.fillStyle = "#9db4cd";
  ctx.font = `9px ${FONT}`;
  spaced("HEAVEN & CO.", W / 2, 408, 2.7);

  ctx.restore();
  return cv.toDataURL("image/png");
}

/* 저장 안내 오버레이: 생성된 사원증 이미지 + 다운로드/길게눌러저장 안내 */
function showIdcardSaveOverlay(dataURL) {
  const ov = document.createElement("div");
  ov.className = "save-overlay";
  ov.innerHTML = `
    <img src="${dataURL}" alt="사원증">
    <div class="save-hint">저장이 안 되면 이미지를 <b>길게 눌러</b> ‘사진에 저장’을 선택하세요</div>
    <div class="save-btns">
      <button class="btn" id="dlBtn">📥 이미지 저장</button>
      <button class="btn ghost" id="closeBtn">닫기</button>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector("#dlBtn").onclick = () => {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "천국상사_사원증.png";
    a.click();
  };
  ov.querySelector("#closeBtn").onclick = () => ov.remove();
}

function showIdcard(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const el = screen("card-screen", `
      <div class="idcard">
        <div class="id-wave id-wave-top"></div>
        <div class="id-title">사 원 증</div>
        <div class="id-photo" id="photoBox">
          <span class="id-photo-icon">👤</span>
          <span class="id-photo-hint">눌러서 사진 넣기</span>
        </div>
        <div class="id-name">${esc(player.fullName)}</div>
        <div class="id-role">${esc(step.role)}</div>
        <div class="id-logo">✝️ <b>천국상사(주)</b><small>HEAVEN &amp; CO.</small></div>
        <div class="id-wave id-wave-bottom"></div>
      </div>
      <input type="file" id="photoInput" accept="image/*" style="display:none">
      <div class="cap-hint">${nl2br(step.hint)}</div>
      <button class="btn ghost" id="saveBtn">💾 사원증 이미지 저장</button>
      <button class="btn" id="inBtn">${esc(step.button)}</button>
    `);
    const box = el.querySelector("#photoBox");
    const input = el.querySelector("#photoInput");
    let photoImg = null; // 캔버스 렌더링용 증명사진
    box.onclick = () => input.click();
    input.onchange = () => {
      const f = input.files && input.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        box.innerHTML = `<img src="${e.target.result}" alt="증명사진">`;
        box.classList.add("has-photo");
        photoImg = new Image();
        photoImg.src = e.target.result;
      };
      reader.readAsDataURL(f);
    };
    el.querySelector("#saveBtn").onclick = () => {
      if (!photoImg) { box.classList.add("shake"); setTimeout(() => box.classList.remove("shake"), 500); }
      showIdcardSaveOverlay(renderIdcardPng(photoImg, step.role));
    };
    el.querySelector("#inBtn").onclick = resolve;
  });
}

/* ---------- 나눔 가이드 ---------- */
function showShare(step) {
  vn.el = null;
  return new Promise((resolve) => {
    const qs = step.questions.map((q, i) =>
      `<div class="share-q" style="animation-delay:${i * 0.15}s"><span class="qnum">Q${i + 1}.</span>${esc(q)}</div>`).join("");
    const el = screen("share-screen", `
      <div class="share-badge">${esc(step.badge)}</div>
      <div class="share-title">${esc(step.title)}</div>
      <div class="share-sub">${nl2br(step.sub)}</div>
      ${qs}
      <button class="btn" id="shareBtn">${esc(step.button)}</button>
    `);
    el.querySelector("#shareBtn").onclick = resolve;
  });
}

/* ---------- 엔딩 (에필로그 10초 → 닉네임 크레딧 → REMIND RESTART) ---------- */
function showEnding(step) {
  vn.el = null;
  return new Promise(() => {
    screen("ending-screen", `
      <div class="ending-label">EPILOGUE</div>
      <div class="ending-verse">${nl2br(step.verse1)}</div>
      <div class="ending-ref">${esc(step.ref1)}</div>
      <div class="ending-verse" style="animation-delay:.8s">${nl2br(step.verse2)}</div>
      <div class="ending-ref">${esc(step.ref2)}</div>
      <div class="ending-msg">${nl2br(sub(step.msg))}</div>
    `);
    setTimeout(() => showCredits(), 10000); // 10초 후 자동으로 크레딧
  });
}


/* 화면이 서서히 하얘지는 전환 (면접관 시점 전환용).
   whiteout → (bg/sprite 교체) → whitein 순서로 사용 */
function showWhiteout() {
  return new Promise((resolve) => {
    const el = ensureVN();
    let ov = el.querySelector(".vn-whiteout");
    if (!ov) {
      ov = document.createElement("div");
      ov.className = "vn-whiteout";
      el.appendChild(ov);
    }
    requestAnimationFrame(() => ov.classList.add("on"));
    setTimeout(resolve, 1500);
  });
}
function showWhitein() {
  return new Promise((resolve) => {
    const el = ensureVN();
    const ov = el.querySelector(".vn-whiteout");
    refreshVN(); // 하얀 화면 뒤에서 새 배경으로 교체
    if (!ov) return resolve();
    ov.classList.remove("on");
    setTimeout(() => { ov.remove(); resolve(); }, 1500);
  });
}

/* ---------- 최종 합격자 명단 (마지막 화면 — 3열 격자) ---------- */
function showCredits() {
  vn.el = null;
  return new Promise(() => { // 마지막 화면 — 여기서 게임 종료 (머무름)
    const names = Sync.names();
    const list = names.length ? names : [player.fullName];
    screen("roster-screen", `
      <div class="roster-badge">✝️ 천국상사(주)</div>
      <div class="roster-title">최종 합격자 명단</div>
      <div class="roster-grid">
        ${list.map((n, i) => `<div class="roster-name" style="animation-delay:${Math.min(i * 0.06, 2.4)}s">${esc(n)}</div>`).join("")}
      </div>
      <div class="roster-msg">합격을 진심으로 축하드립니다.</div>
    `);
  });
}

/* ---------- 메인 루프 ---------- */
async function runStory(startAt = 0) {
  let i = startAt;
  while (i < STORY.length) {
    const s = STORY[i];
    saveProgress(i); // 이어하기용 — 현재 위치 저장
    // if: { flag, value } 가 붙은 스텝은 해당 선택을 한 사람에게만 보여줌
    if (s.if && player.flags[s.if.flag] !== s.if.value) { i++; continue; }
    switch (s.type) {
      case "bg": vn.bg = s.value; break;
      case "sprite": vn.sprite = s.value; break;
      case "place": vn.place = s.value; break;
      case "date": vn.date = s.value; break; // 씬 우상단 날짜 표기
      case "say": await showSay(s); break;
      case "choice": await showChoice(s); break;
      case "say-if":
        if (player.flags[s.flag] === s.value) {
          for (const line of s.lines) await showSay(line);
        }
        break;
      case "notify": await showNotify(s); break;
      case "jobpost": await showJobpost(s); break;
      case "sms": await showSms(s); break;
      case "overlay": await showOverlay(s); break;
      case "waitAll": await showWaitAll(s); break;
      case "sync": await showSyncPoint(s); break;
      case "transition": await showTransition(s); break;
      case "video": await showVideo(s); break;
      case "whiteout": await showWhiteout(); break;
      case "whitein": await showWhitein(); break;
      case "interview": await showInterview(s); break;
      case "stamp": await showStamp(s); break;
      case "cue": await showCue(s); break;
      case "idcard": await showIdcard(s); break;
      case "share": await showShare(s); break;
      case "ending": await showEnding(s); break;
      case "bgm": s.stop ? demoBgmStop() : demoBgm(s.play); break; // 데모 모드 전용
      case "mark": Sync.submit(s.key, { name: player.fullName }); break; // 신호만 보냄 (BGM 자동화용)
      case "credits": await showCredits(s); break;
      default: console.warn("알 수 없는 step:", s);
    }
    i++;
  }
}

(async function main() {
  await showTapStart();   // 첫 터치 → 이후 BGM 자동재생 허용 + 전체화면
  keepAwake();            // 화면 꺼짐 방지

  // 진행하던 기록이 있으면 이어하기 제안
  const save = loadSave();
  let resumeAt = -1;
  if (save) {
    if (await showResumePrompt(save)) {
      player.fullName = save.fullName;
      player.name = givenNameOf(save.fullName);
      player.gender = save.gender;
      player.flags = save.flags || {};
      resumeAt = save.i;
    } else {
      localStorage.removeItem(SAVE_KEY);
    }
  }

  await waitGameStart();  // 진행자가 [게임 시작]을 열 때까지 대기 (이미 열렸으면 바로 통과)
  preloadBackgrounds();   // 배경 이미지 미리 받기

  if (resumeAt >= 0) {
    // 이어하기: 영상·이름 입력 건너뛰고 저장 지점부터
    Sync.join({ name: player.fullName, gender: player.gender }); // 같은 기기 ID로 재등록
    preloadSprites();
    fastForward(resumeAt);
    await runStory(resumeAt);
  } else {
    await showStartVideo(); // start.mp4 시작과 동시에 시작곡 재생 → 끝나면 터치
    await showCreate();     // 형제/자매 선택 + 닉네임
    preloadSprites();       // 성별 확정 → 스프라이트 미리 받기
    await showIntroVideo();
    await runStory();
  }
})();
