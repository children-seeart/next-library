# 내일의 어린이실 — 프로젝트 아카이브

재단법인 씨앗 〈내일의 어린이실〉 프로젝트의 과정과 결과를 기록한 웹 아카이브입니다.

## 구조

```
index.html              페이지 전체 (섹션별로 주석이 달려 있습니다)
assets/css/style.css    색·글자·여백. 색을 바꾸려면 맨 위 :root 만 고치면 됩니다
assets/js/main.js       목차 자동 생성, 영상 재생
assets/img/             이미지 — cheonan/ 천안, iksan/ 익산
```

## 미리보기

브라우저에서 `index.html`을 바로 열면 됩니다. 로컬 서버를 쓰려면:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## 작업 모드

`index.html`의 `<body data-mode="draft">`

| 값 | 결과 |
|---|---|
| `draft` | 이미지 자리표시자와 주황색 작업 메모가 보입니다 (작업 중) |
| `final` | 둘 다 숨겨집니다 (공개용) |

**공개 전에 `final`로 바꾸세요.**

## 자주 하는 작업

**맨 위 대표 이미지** — `assets/img/hero/` 에 `hero-1.jpg` 부터 차례로 넣기만 하면
돌아가며 보입니다. HTML 은 고칠 필요 없습니다. 자세한 규격은 그 폴더의 README 를 보세요.

**그 밖의 사진** — `assets/img/cheonan/` 등에 파일을 넣고, `index.html`에서 해당
`<div class="ph">…</div>` 를 `<img src="assets/img/cheonan/파일명.jpg" alt="설명">` 으로 바꿉니다.

**영상 넣기** — YouTube에 **‘일부공개(Unlisted)’**로 올린 뒤, `<div class="video" data-id="">`의
`data-id`에 영상 ID를 넣습니다. ID는 `youtu.be/XXXXXXXXXXX` 의 뒷부분입니다.

**목차** — 손댈 필요 없습니다. 섹션의 `<h2>`를 읽어 자동으로 만들어집니다.

## 익산 개관 후 업데이트

1. `index.html`의 `<section id="iksan">` 블록을 통째로 새 내용으로 교체
2. `<span class="badge">Pre-open</span>` → `<span class="badge" data-state="open">개관</span>`
3. `assets/img/iksan/` 에 사진 추가

익산 조성 과정의 상세 기록은 `내일의어린이실2_익산-history/` 폴더에 주차별로 정리되어 있습니다.

## 배포 (GitHub Pages)

처음 한 번만:

```sh
git init
git add .
git commit -m "내일의 어린이실 아카이브 첫 공개"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

그다음 GitHub 저장소에서 **Settings → Pages → Source: `main` / `/ (root)`** 선택.
1~2분 뒤 `https://<계정>.github.io/<저장소>/` 에서 열립니다.

이후 수정할 때마다:

```sh
git add .
git commit -m "수정 내용"
git push
```

## 저작권

본 페이지의 자료에 대한 저작권은 재단법인 씨앗 및 각 전문가팀에게 있으며
무단으로 사용하실 수 없습니다.

ⓒ 2026 Seeart Foundation
