/* ============================================================
   sync.js — "대기/게이트" 동기화 계층

   ● 데모 모드 (기본): js/firebase-config.js 가 비어 있으면 자동 선택.
     대기 화면에서 화면을 탭하면 바로 다음으로 진행 (혼자 미리보기용).

   ● 실전 모드 (Firebase): firebase-config.js 를 채우면 자동 선택.
     - 참가자가 각 대기 지점(게이트)에 도착하면 실시간으로 등록되고,
     - 진행자가 admin.html 에서 [다음으로 진행] 을 누르면
       그 게이트에서 기다리던 전원이 동시에 다음 챕터로 넘어갑니다.

   게이트 목록 (story.js 의 waitAll key 와 일치해야 함):
     game_start     → 게임 시작 (탭 화면에서 대기, 진행자가 열면 전원 시작)
     resume_ready   → 지원서 작성 시작 대기
     resume_done    → 지원서 작성 완료
     study_done     → 면접 스터디 교제 완료
     interview_done → 면접 심사 제출
     sermon_done    → 조각말씀 종료 (진행자가 판단해서 열기)
     plan_written   → 실천 계획 작성 완료
     plan_done      → 실천 계획 교제 완료
     final_card     → 엔딩 명단 후 사원증 표시 (진행자가 열기)
   ============================================================ */

/* --- 데모 모드 --- */
const DemoSync = {
  isDemo: true,

  join(profile) {
    localStorage.setItem("hs_profile", JSON.stringify(profile));
  },

  names() {
    try {
      const p = JSON.parse(localStorage.getItem("hs_profile"));
      return p && p.name ? [p.name] : [];
    } catch { return []; }
  },

  submit(key, data) {
    localStorage.setItem("hs_done_" + key, JSON.stringify(data || true));
  },

  // 데모: 접속 등록 없음
  connect() {},

  // 데모: 게이트 감시 없음 (해제 함수만 반환)
  onGateOpen() { return () => {}; },

  // 데모: 가짜 카운트를 보여주고, 사용자가 화면을 탭하면 통과
  waitForAll(key, onCount) {
    return new Promise((resolve) => {
      let done = 1;
      const total = 28;
      onCount(done, total);
      const timer = setInterval(() => {
        done = Math.min(done + Math.ceil(Math.random() * 3), total - 1);
        onCount(done, total);
      }, 900);
      DemoSync._tapToResolve = () => {
        clearInterval(timer);
        onCount(total, total);
        setTimeout(resolve, 500);
      };
    });
  },

  // 데모: 장면 동기화 — 가짜 카운트가 차오르면 자동 진행
  waitForBarrier(key, onCount) {
    return new Promise((resolve) => {
      let done = 23;
      const total = 28;
      onCount(done, total);
      const timer = setInterval(() => {
        done = Math.min(done + Math.ceil(Math.random() * 3), total);
        onCount(done, total);
        if (done >= total) {
          clearInterval(timer);
          setTimeout(resolve, 450);
        }
      }, 350);
    });
  },
};

/* --- 실전 모드 (Firebase Realtime Database) --- */
const FirebaseSync = {
  isDemo: false,
  _db: null,
  _uid: null,
  _names: [],
  _total: 0,

  _init() {
    firebase.initializeApp(FIREBASE_CONFIG);
    this._db = firebase.database();
    // 기기(브라우저)별 고정 ID — 새로고침해도 중복 집계되지 않음
    let uid = localStorage.getItem("hs_uid");
    if (!uid) {
      uid = "u" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem("hs_uid", uid);
    }
    this._uid = uid;
    // 전체 참가자 명단 구독 (엔딩 크레딧 + 대기 화면 분모)
    this._db.ref("users").on("value", (snap) => {
      const v = snap.val() || {};
      this._names = Object.values(v).map((u) => u && u.name).filter(Boolean);
      this._total = Object.keys(v).length;
    });
  },

  // 접속 등록 (탭 화면 직후, 이름 입력 전) — 전체 참가자 수에 바로 집계됨
  connect() {
    this._db.ref("users/" + this._uid).update({
      connectedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  },

  join(profile) {
    localStorage.setItem("hs_profile", JSON.stringify(profile));
    this._db.ref("users/" + this._uid).update({
      name: profile.name,
      gender: profile.gender,
      joinedAt: firebase.database.ServerValue.TIMESTAMP,
    });
  },

  names() { return this._names.slice(); },

  // 게이트 도착 등록 (합격/불합격 선택 등 비공개 정보는 서버에 올리지 않음)
  submit(key, data) {
    this._db.ref("arrivals/" + key + "/" + this._uid).set({
      name: (data && data.name) || "",
      t: firebase.database.ServerValue.TIMESTAMP,
    });
  },

  // 게이트가 열리는 순간 콜백 실행 (오버레이 화면 강제 진행용). 해제 함수 반환
  onGateOpen(key, cb) {
    const ref = this._db.ref("gates/" + key + "/open");
    const h = ref.on("value", (s) => { if (s.val() === true) cb(); });
    return () => ref.off("value", h);
  },

  // 진행자가 admin.html 에서 게이트를 열 때까지 대기
  waitForAll(key, onCount) {
    return new Promise((resolve) => {
      const arrRef = this._db.ref("arrivals/" + key);
      const gateRef = this._db.ref("gates/" + key + "/open");
      const onArr = arrRef.on("value", (s) => {
        onCount(s.numChildren(), this._total || 0);
      });
      const onGate = gateRef.on("value", (s) => {
        if (s.val() === true) {
          arrRef.off("value", onArr);
          gateRef.off("value", onGate);
          resolve();
        }
      });
    });
  },

  // 장면 동기화: 전원이 도착하면 자동으로 전원 동시 진행.
  // (진행자가 admin.html 에서 [강제 진행] 을 눌러도 열림 — 이탈자 발생 대비)
  waitForBarrier(key, onCount) {
    return new Promise((resolve) => {
      const arrRef = this._db.ref("arrivals/" + key);
      const gateRef = this._db.ref("gates/" + key + "/open");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        arrRef.off("value", onArr);
        gateRef.off("value", onGate);
        resolve();
      };
      const onArr = arrRef.on("value", (s) => {
        const arrived = s.numChildren();
        onCount(arrived, this._total || 0);
        if (this._total > 0 && arrived >= this._total) finish();
      });
      const onGate = gateRef.on("value", (s) => {
        if (s.val() === true) finish();
      });
    });
  },
};

const Sync =
  (typeof firebase !== "undefined" &&
   typeof FIREBASE_CONFIG !== "undefined" &&
   (FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.databaseURL))
    ? (FirebaseSync._init(), FirebaseSync)
    : DemoSync;
