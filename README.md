# Image Toolkit

한국어와 English를 지원하는 브라우저 기반 이미지 편집 도구입니다. 이미지 처리는 사용자의 브라우저 안에서만 이루어지며 서버로 업로드되지 않습니다.

Image Toolkit is a bilingual, browser-based image editing tool. Image processing runs locally in the browser and files are not uploaded to a server.

## 언어 / Language

- 한국어 브라우저에서는 한국어를 기본으로 표시합니다.
- 그 외 브라우저에서는 English를 기본으로 표시합니다.
- 상단의 `한국어 | English` 버튼으로 언제든지 전환할 수 있습니다.
- 사용자가 선택한 언어는 브라우저에 저장됩니다.
- Korean browsers default to Korean; other browsers default to English.
- The selected language is saved in the browser.

## 주요 기능 / Features

- PNG, JPG, JPEG 다중 업로드 / Multiple image upload
- 투명 알파 영역 기준 캔버스 맞춤 / Alpha-bounding-box Canvas Fit
- 기본 `740 x 640`, 사방 40px 안전 여백
- 작은 그림 확대, 큰 그림 축소, 비율 유지
- PNG 외곽선 두께 및 색상 설정
- Canvas Fit 후 외곽선 적용 시 결과 캔버스 크기 유지
- 네이버 OGQ 심사 규격 3종 빠른 생성
  - `740 x 640` 일반 이미지: 사방 40px 여백, `original_ogq.png`
  - `240 x 240` 대표 이미지: 사방 12px 여백, `main.png`
  - `96 x 74` 탭 이미지: 사방 4px 여백, `tab.png`
- 개별 PNG 다운로드 및 최신 결과 ZIP 일괄 다운로드
- 모든 처리는 서버 업로드 없이 브라우저에서 실행

## 권장 작업 순서 / Recommended Workflow

1. 이미지를 한 장 이상 업로드합니다.
2. 필요한 출력 크기로 캔버스 맞춤(Canvas Fit)을 적용합니다.
3. 필요하면 외곽선(Outline)을 적용합니다.
4. 개별 PNG 또는 ZIP으로 결과를 다운로드합니다.

1. Upload one or more images.
2. Apply Canvas Fit at the required output size.
3. Apply Outline when needed.
4. Download individual PNG files or the latest results as a ZIP.

## 출력 규칙 / Output Rules

- Canvas Fit: `original_fit.png`
- Canvas Fit + Outline: `original_fit_outline.png`
- Outline only: `original_outline.png`
- OGQ standard preset: `original_ogq.png`
- Tab preset: `tab.png`
- Main preset: `main.png`
- ZIP에는 이미지별 가장 최근 결과 한 개만 포함됩니다.
- Duplicate names are numbered automatically inside the ZIP.

## 로컬 실행 / Run Locally

`index.html`을 브라우저에서 열면 됩니다. 빌드나 패키지 설치가 필요하지 않습니다.

Open `index.html` directly in a browser. No build step or package installation is required.

## GitHub Pages 배포 / Deployment

1. GitHub 저장소에 파일을 커밋하고 Push합니다.
2. 저장소 `Settings → Pages`로 이동합니다.
3. `Deploy from a branch`, `main`, `/(root)`를 선택합니다.

## 프로젝트 구조 / Project Structure

```text
imagetoolkit-yl.github.io/
├── index.html
├── style.css
├── script.js
├── README.md
└── tools/
    └── outline/
        ├── download-utils.js
        ├── outline-engine.js
        └── zip-writer.js
```

## 현재 제공 기능 / Current Features

- Canvas Fit with alpha-bounds detection and safe margins
- PNG outline generation
- Naver OGQ 740×640 standard image
- 240×240 `main.png` and 96×74 `tab.png`
- Individual PNG and batch ZIP downloads
- Korean and English interface


## Site content and policy pages
- About, Guide, FAQ, Privacy, Terms, Contact
- Six original image-production guides
- robots.txt, sitemap.xml, 404 page, favicon
- No AdSense code or ads.txt publisher ID is included yet. Add only after an actual publisher ID is available.

## OGQ 가이드 / OGQ Guide

- `guides/ogq-emoticon.html`: 740×640 일반 이미지, 240×240 `main.png`, 96×74 `tab.png` 제작 흐름
- Image Toolkit은 네이버 또는 OGQ의 공식 도구가 아니며, 최종 제출 전 공식 최신 가이드를 확인해야 합니다.


## Contact / 문의

- Email: [yltoolkit@gmail.com](mailto:yltoolkit@gmail.com)
- Public bug reports: GitHub Issues
