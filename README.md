# 나의 블로그

Astro로 빌드하는 정적 블로그입니다. `npm run build` 결과물을 GitHub Pages에 올립니다.

## 로컬

```bash
npm install
npm run dev
npm run build
```

## 글 추가

`src/content/blog/YYYY/MM/슬러그.md`에 마크다운을 추가합니다.

```yaml
title: 글 제목
date: 2026-10-04
description: 목록에 보일 한 줄 소개
category: 기록
categorySlug: notes
tags:
  - name: 시각화
    slug: visualization
draft: false
```

폴더의 연·월과 `date`가 다르면 빌드가 멈춥니다. `draft: true`인 글은 배포 빌드에서 빠집니다. 화면에 보이는 분류 이름은 한글, 주소는 `categorySlug`와 `tag.slug`입니다. 슬러그를 비우면 이름에서 주소를 만듭니다.

## GitHub Pages

저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 바꿉니다. `main` 또는 `master`에 푸시하면 배포됩니다.

`username.github.io` 저장소는 사이트 주소가 도메인 루트입니다. 그 외 저장소는 `https://username.github.io/저장소이름/`으로 배포되고, Actions 환경의 저장소 이름으로 `base`를 맞춥니다. 직접 지정하려면 `SITE`와 `BASE_PATH`를 설정합니다.
