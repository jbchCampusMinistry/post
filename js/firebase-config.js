/* ============================================================
   firebase-config.js — 실시간 동기화 설정 (참가자 + 진행자 공용)

   ● 비워 두면: 데모 모드 (대기 화면에서 탭하면 통과 — 혼자 미리보기용)
   ● 채우면: 실전 모드 (진행자가 admin.html 에서 챕터 진행을 관리)

   실전 모드 설정 방법:
   1. https://console.firebase.google.com 에서 새 프로젝트 생성 (무료 Spark 플랜)
   2. 빌드 → Realtime Database → 데이터베이스 만들기 (테스트 모드로 시작)
   3. 프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹 앱(</>) 추가
   4. 화면에 나오는 firebaseConfig 값을 아래에 그대로 붙여넣기
      (databaseURL 이 없으면 Realtime Database 페이지 상단 주소를 복사)
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "",            // 예: "AIzaSy..." (비워도 databaseURL 만으로 실전 모드 동작)
  authDomain: "",        // 예: "xxx.firebaseapp.com"
  databaseURL: "https://post-6dc58-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "post-6dc58",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

/* admin.html (진행자 화면) 입장 비밀번호 */
const ADMIN_PIN = "1004";
