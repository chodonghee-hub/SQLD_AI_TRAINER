# SQLD AI 적응형 학습 플랫폼

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red?logo=pytorch)
![Railway](https://img.shields.io/badge/Railway-Deployed-black?logo=railway)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)

SQLD(SQL 개발자 자격증) 기출 문제를 기반으로 **ML · DKT · RAG/LLM** 기술을 통합한 AI 기반 적응형 학습 플랫폼.

**Live**
- Backend API: https://sqldaitrainer-production.up.railway.app
- API 문서: https://sqldaitrainer-production.up.railway.app/docs
- Frontend: `https://sqld-ai-trainer.vercel.app` _(배포 예정)_

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [AI 모델 상세](#ai-모델-상세)
4. [백엔드](#백엔드)
5. [프론트엔드](#프론트엔드)
6. [코드 관리 전략](#코드-관리-전략)
7. [로컬 실행](#로컬-실행)
8. [배포](#배포)
9. [API 명세](#api-명세)
10. [데이터셋](#데이터셋)

---

## 프로젝트 개요

### 문제 정의

기존 자격증 학습 서비스는 모든 사용자에게 동일한 문제를 제공하고 단순 정답만 알려준다. 이미 아는 문제를 반복 풀이하거나, 취약한 개념을 파악하지 못한 채 시험에 임하는 비효율이 발생한다.

### 해결 방식

| 기존 문제 | 본 플랫폼의 접근 |
|-----------|----------------|
| 모든 사용자에게 동일 문제 제공 | DKT + 하이브리드 추천으로 개인화 |
| 취약 영역 분석 부재 | 챕터별 정답률 + 오답 패턴 자동 분석 |
| 이미 아는 문제 반복 | ZPD(Zone of Proximal Development) 기반 난이도 매칭 |
| 단순 정답 제공 | Groq LLM + RAG로 오답 원인 맞춤 해설 생성 |
| 학습 순서 무관 | Knowledge Tracing으로 다음 학습 문제 예측 |

### 주요 기능

| 기능 | 설명 |
|------|------|
| 문제 풀이 | 297개 SQLD 기출 문제, 챕터·난이도 필터 |
| 오답 확률 예측 | XGBoost 기반 문제별 오답 확률 실시간 표시 |
| 개인화 추천 | DKT + 하이브리드 필터링으로 다음 학습 문제 추천 |
| AI 해설 | Groq LLM + FAISS RAG 파이프라인으로 맞춤 해설 생성 |
| 학습 대시보드 | 챕터별 정답률 차트, 취약 영역 분석 |
| 게스트 모드 | 회원가입 없이 문제 풀기 및 AI 해설 이용 가능 |

---

## 시스템 아키텍처

```
[Vercel]                           [Railway — Docker Container]
React 19 + TypeScript              FastAPI + uvicorn
(Vite 정적 빌드)         ←──────►   ├─ AppState (Singleton)
                          HTTPS    │   ├─ TF-IDF Classifier
                          REST     │   ├─ XGBoost Predictor
                                   │   ├─ SVD + TF-IDF Recommender
                                   │   ├─ DKT/LSTM (PyTorch)
                                   │   ├─ FAISS Index (384-dim)
                                   │   └─ RAGExplainer (Groq)
                                   ├─ SQLite (users, logs)
                                   └─ Groq API ──► LLaMA 3.1 8B
```

### 모델 로딩 전략

서버 시작 시 ML 모델(약 2GB)을 로드하면 Railway 헬스체크 타임아웃이 발생한다. 이를 해결하기 위해 FastAPI `lifespan` 내에서 `app.state.models`를 먼저 바인딩한 뒤, 모델 로딩은 백그라운드 스레드에서 실행한다.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    app.state.models = app_state          # /health 즉시 응답 가능
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, app_state.load)  # 백그라운드 로딩
    yield
```

---

## AI 모델 상세

### Phase 1 — 데이터 파이프라인

**JSON 파싱 (`json_parser.py`)**

12개 챕터 JSON 파일을 파싱해 정형화된 DataFrame으로 변환한다. `(subject_id, chapter_id)` 쌍으로 챕터명을 매핑하며, 선택지·SQL 코드·해설 텍스트를 추출한다.

**규칙 기반 난이도 추정 (`features.py`)**

원본 데이터에 `difficulty` 필드가 없어 문제 유형과 챕터로 자동 추정한다.

| 조건 | 난이도 |
|------|--------|
| `question_type = different_result` | Hard |
| `question_type = fill_blank` + SQL 튜닝 챕터 | Hard |
| SQL 관련 선택지 포함 | Medium |
| 그 외 | Easy |

**시뮬레이션 학습 이력 (`simulator.py`)**

실제 사용자 이력이 없으므로 100명의 가상 사용자 풀이 이력을 생성한다.

| 사용자 유형 | 기본 정답률 | 특징 |
|------------|------------|------|
| beginner (40%) | 40% | 낮은 초기 정답률 |
| intermediate (40%) | 65% | 중간 수준 |
| advanced (20%) | 85% | 높은 정답률 |

반복 학습 효과: 같은 문제를 풀 때마다 정답률 +2% (Knowledge Gain 모델링).

---

### Phase 2 — 머신러닝 모델

#### 문제 분류기 (`classifier.py`)

문제 텍스트를 분석해 `subject_id`(파트)와 `difficulty_label`(난이도)을 분류한다.

**텍스트 표현**
- TF-IDF Vectorizer: `analyzer="char_wb"`, `ngram_range=(2, 4)`, `max_features=3000`
- 한국어 형태소 분석기 없이 음절 블록(character n-gram) 단위로 처리

**Feature 구성**
```
TF-IDF 행렬 (sparse)
+ question_type OneHot (4차원)
+ has_sql_asset (0/1)
+ choice_kind_complexity (0~3)
```

**모델**: Logistic Regression (C=1.0) / LinearSVC — StratifiedKFold 5-fold 교차 검증

---

#### 트랜스포머 기반 의미 검색 (`rag_explainer.py`)

문제에 대한 해설을 생성할 때 RAG(Retrieval-Augmented Generation) 파이프라인의 Retrieval 단계에서 트랜스포머 임베딩 모델을 사용한다.

**사용 모델**
- `jhgan/ko-sroberta-multitask` — 한국어 특화 Sentence-BERT 계열 모델
- Hugging Face `sentence-transformers` 라이브러리를 통해 로드

**트랜스포머 임베딩 원리**

| 단계 | 설명 |
|------|------|
| Tokenization | WordPiece 기반 서브워드 분절 (한국어 형태소 경계에 가깝게 처리) |
| Encoder | 12-layer Transformer Encoder (BERT 구조), Self-Attention으로 문맥 벡터 생성 |
| Pooling | Mean Pooling — 모든 토큰 임베딩의 평균으로 문장 단위 벡터(768차원) 산출 |
| Fine-tuning | Multi-task 학습: NLI(자연어 추론) + STS(의미 유사도) 손실 동시 최적화 |

**TF-IDF 대비 트랜스포머의 차이점**

TF-IDF는 단어 빈도 기반의 sparse 벡터로, 단어가 다르면 유사도가 0에 가까워진다.  
트랜스포머 임베딩은 Self-Attention을 통해 문맥을 고려한 dense 벡터를 생성하므로, 표현이 달라도 의미가 유사한 문장 간의 유사도를 측정할 수 있다.

```
TF-IDF:   "기본키 제약조건" ≠ "PK 설정" → 코사인 유사도 ≈ 0
Transformer: "기본키 제약조건" ≈ "PK 설정" → 코사인 유사도 ≈ 0.85
```

**FAISS 인덱스 구조**

```
문제 텍스트 → Sentence Transformer → 768차원 dense 벡터
                                              ↓
                                   FAISS IndexFlatL2 (L2 거리 기반 ANN 탐색)
                                              ↓
                              top-k 유사 문서 → LLM 프롬프트에 삽입
```

- `IndexFlatL2`: 정확한 최근접 이웃 탐색 (근사 아닌 완전 탐색), 데이터셋 규모가 작아 속도 충분
- 임베딩은 최초 `/explain` 요청 시 Lazy Loading으로 생성되어 `faiss_index.bin`에 저장

**저장 아티팩트**: `tfidf_vectorizer.joblib`, `classifier_subject.joblib`, `classifier_difficulty.joblib`

---

#### 오답 확률 예측기 (`predictor.py`)

(user, question) 쌍에 대해 오답 확률(0~1)을 예측하는 이진 분류 모델.

**Feature 엔지니어링**

| Feature 그룹 | 항목 |
|-------------|------|
| 유저 레벨 | 전체 정답률, 난이도별 정답률, 챕터별 정답률, 질문 유형별 정답률, 평균 풀이 시간 |
| 문제 레벨 | question_type, has_sql_asset, choice_kind_complexity, subject_id, chapter_id, difficulty_encoded |

**모델 비교 및 자동 선택**

| 모델 | 파라미터 |
|------|---------|
| RandomForest | n_estimators=200, max_depth=10 |
| XGBoost | n_estimators=200, max_depth=6, learning_rate=0.05 |

AUC-ROC가 높은 모델을 `predictor_primary.joblib`으로 자동 선택.

**API 응답 (`POST /predict`)**
```json
{
  "error_probability": 0.72,
  "risk_level": "high",
  "message": "이 문제는 틀릴 가능성이 높습니다.",
  "source": "model"
}
```
`risk_level` 기준: `< 0.4` → low, `0.4~0.65` → medium, `> 0.65` → high

---

#### 하이브리드 추천 시스템 (`recommender.py`)

Content-Based + Collaborative Filtering 혼합 추천.

**Stage 1 — Content-Based Filtering**
- 최근 오답 문제 텍스트 TF-IDF 벡터와 전체 문제 코사인 유사도 계산
- 유사한 개념의 문제를 우선 추천

**Stage 2 — Collaborative Filtering**
- User-Item 정답 행렬 → TruncatedSVD (n_components=20) → 유사 사용자 기반 추천

**최종 점수**
```
score = 0.7 × content_score + 0.3 × cf_score
```

**ZPD(Zone of Proximal Development) 필터**

DKT가 예측한 `P(correct)`가 `[zpd_low, zpd_high]` 범위(기본 0.3~0.6)에 있는 문제에 가중치를 부여해 적정 난이도 문제를 우선 추천한다.

```
"너무 쉽지도 너무 어렵지도 않은" 문제 → 학습 효과 최대화
```

**추천 제외 조건**: 이미 맞힌 문제, 약점 챕터 외 문제 (취약 챕터 상위 3개 우선)

---

### Phase 3 — 딥러닝

#### DKT — Deep Knowledge Tracing (`knowledge_tracer.py`)

사용자 풀이 이력 시퀀스를 LSTM으로 모델링해 다음 문제별 정답 확률 벡터를 예측한다.

**아키텍처**

```
입력 시퀀스: [(question_idx × 2) + response + 1]  ← 1-indexed, 0=padding
      ↓
Embedding(num_questions × 2 + 1, embed_dim=128)
      ↓
LSTM(input=128, hidden=128, dropout=0.2)
      ↓
Linear(128 → 297)
      ↓
Sigmoid → P(correct) for each question (297개)
```

**학습 설정**

| 항목 | 값 |
|------|-----|
| Epochs | 30 (Early Stopping patience=5) |
| Batch Size | 32 |
| Learning Rate | 1e-3 |
| 손실 함수 | BCELoss |
| 분할 | 80/20 (user-level stratified) |
| 평가 | AUC-ROC |

**저장 아티팩트**: `dkt_model.pth` (state_dict), `dkt_question_ids.joblib`

---

#### Dense 임베딩 + FAISS (`embedder.py`)

**임베딩 모델**: `paraphrase-multilingual-MiniLM-L12-v2` (384-dim)
- CPU-friendly, 한국어 지원, sentence-transformers 제공

**임베딩 대상**: `question_text + " " + explanation` 합쳐서 encode

**FAISS 인덱스**: `IndexFlatIP` — L2 정규화 후 내적 = 코사인 유사도

**한글 경로 호환**: FAISS 인덱스를 bytes로 직렬화한 뒤 joblib으로 저장

```python
# 저장
buf = faiss.serialize_index(index)
joblib.dump(buf, "faiss_index.joblib")

# 로드
buf = joblib.load("faiss_index.joblib")
index = faiss.deserialize_index(buf)
```

**저장 아티팩트**: `sentence_embeddings.npy` (N×384), `faiss_index.joblib`, `embed_question_ids.joblib`

---

### Phase 4 — RAG / LLM 해설 (`explainer.py`)

#### RAG(Retrieval-Augmented Generation)란

LLM(대형 언어 모델)은 학습 데이터에 없는 도메인 지식에 대해 잘못된 정보를 생성하는 **Hallucination** 문제가 있다. RAG는 이를 해결하기 위해 LLM이 답변을 생성하기 전에 **외부 지식 베이스에서 관련 문서를 검색(Retrieve)해 프롬프트에 함께 제공(Augment)** 하는 방식이다.

```
기존 LLM:  질문 → LLM → 답변 (학습 데이터에만 의존, Hallucination 위험)

RAG:       질문 → [검색] 관련 문서 k개 → 질문 + 문서 → LLM → 근거 있는 답변
```

본 프로젝트에서는 LLM이 SQLD 기출 문제의 해설 데이터를 모른다는 전제 하에, **FAISS로 유사 문제를 검색해 컨텍스트로 제공**함으로써 SQLD 도메인에 특화된 정확한 해설을 생성한다.

#### 구현 파이프라인

**1단계 — 오프라인 인덱싱 (서버 시작 시 1회)**

```
297개 문제 전체
      ↓
question_text + explanation → sentence-transformers 인코딩 (384-dim)
      ↓
L2 정규화 (코사인 유사도를 내적으로 변환)
      ↓
FAISS IndexFlatIP 구축 → faiss_index.joblib 저장
```

**2단계 — 온라인 추론 (사용자 요청마다)**

```
오답 question_id
      ↓
해당 문제 임베딩 벡터 추출
      ↓
FAISS 검색: cosine similarity 상위 k=3개 유사 문제 반환
      ↓
프롬프트 구성
  ├─ [문제 정보] 챕터, 난이도, 문제 텍스트, 기존 해설
  ├─ [참고 컨텍스트] 유사 문제 3개 + 각 해설  ← RAG의 핵심
  └─ [작성 지침] 핵심 개념, 오답 포인트, 유사 문제 연결, 기억 포인트
      ↓
Groq API (llama-3.1-8b-instant)
      ↓
한국어 맞춤 해설 반환
```

#### RAG가 단순 LLM 호출과 다른 점

| 항목 | 단순 LLM | RAG (본 프로젝트) |
|------|----------|-----------------|
| 컨텍스트 | 없음 (LLM 파라미터에 의존) | SQLD 기출 해설 3개 제공 |
| Hallucination | 발생 가능 | 실제 해설 기반으로 억제 |
| 도메인 특화 | 낮음 | 높음 (SQLD 개념 정확도 향상) |
| 비용 | 프롬프트 짧음 | 컨텍스트만큼 토큰 증가 |

**Fallback 전략**
- `GROQ_API_KEY` 미설정 또는 API 오류 → `original_explanation` 반환, `source: "fallback"`

**캐싱**: `explain_cache[question_id]` — 동일 문제 중복 API 호출 방지

---

## 백엔드

### 구조

```
backend/
├── api/
│   ├── main.py              # FastAPI 앱, lifespan, CORS 설정
│   ├── database.py          # SQLAlchemy 엔진, 세션 관리
│   ├── state.py             # AppState 싱글턴 (모든 모델 보유)
│   ├── routers/
│   │   ├── auth.py          # 회원가입·로그인·게스트 JWT 발급
│   │   ├── questions.py     # 문제 목록·상세 조회
│   │   ├── logs.py          # 풀이 결과 저장 및 정답 판정
│   │   ├── predict.py       # XGBoost 오답 확률 예측
│   │   ├── explain.py       # RAG AI 해설 생성
│   │   ├── recommend.py     # DKT + 하이브리드 추천
│   │   └── progress.py      # 챕터별 학습 진도 조회
│   └── schemas/             # Pydantic 요청/응답 스키마
├── src/
│   ├── models/
│   │   ├── classifier.py    # TF-IDF + Logistic Regression 분류기
│   │   ├── predictor.py     # XGBoost / RandomForest 오답 예측기
│   │   ├── recommender.py   # SVD + TF-IDF 하이브리드 추천기
│   │   ├── knowledge_tracer.py  # PyTorch LSTM DKT
│   │   └── embedder.py      # sentence-transformers + FAISS
│   ├── data/
│   │   ├── json_parser.py   # 챕터 JSON 파싱
│   │   ├── features.py      # Feature 엔지니어링, 난이도 추정
│   │   ├── simulator.py     # 시뮬레이션 학습 이력 생성
│   │   └── pipeline.py      # 전체 데이터 파이프라인 오케스트레이션
│   └── explainer.py         # RAG 파이프라인 (FAISS + Groq)
├── outputs/                 # 학습된 모델 아티팩트 (git 추적)
│   ├── questions.csv
│   ├── user_logs.csv
│   ├── dkt_model.pth
│   ├── faiss_index.joblib
│   ├── sentence_embeddings.npy
│   └── *.joblib             # 분류기, 예측기, 추천기 모델
└── requirements_api.txt
```

### AppState — 모델 싱글턴

모든 ML 모델을 `AppState` 단일 객체로 관리해 라우터에서 참조한다.

```python
class AppState:
    classifier: dict              # tfidf_vectorizer, clf_subject, clf_difficulty
    predictor_model: object       # XGBoost or RandomForest (AUC 기준 자동 선택)
    predictor_feature_names: list
    recommender: dict             # tfidf_matrix, user_factors, item_factors
    dkt_model: DKTModel           # PyTorch LSTM
    dkt_question_ids: list
    device: torch.device          # CPU / CUDA / MPS 자동 감지
    explainer: RAGExplainer       # FAISS + Groq
    questions_df: pd.DataFrame
    logs_df: pd.DataFrame
```

### 인증

- JWT Bearer 토큰 (python-jose)
- 게스트: `POST /auth/guest` → 24시간 유효 토큰, 풀이 이력 미저장
- 회원: `POST /auth/register` / `POST /auth/login` → 풀이 이력 저장 + 개인화 기능 이용

---

## 프론트엔드

### 구조

```
frontend/
├── src/
│   ├── services/
│   │   └── api.ts               # axios 인스턴스, API 함수 모음
│   ├── contexts/
│   │   └── AuthContext.tsx       # 인증 상태 전역 관리 (token, user, isGuest)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── QuestionListPage.tsx  # 챕터·난이도 필터, 페이지네이션
│   │   ├── QuestionDetailPage.tsx # 풀이·채점·AI 해설·오답 확률
│   │   ├── DashboardPage.tsx     # 챕터별 차트, 취약 영역
│   │   └── RecommendPage.tsx     # DKT 추천 문제 목록
│   └── components/
│       ├── auth/AuthGuard.tsx    # 미인증 시 /login 리다이렉트
│       ├── layout/              # TopBar, PageLayout
│       ├── question/            # QuestionCard, ChoiceList, SqlBlock,
│       │                        # AiExplanation, RiskIndicator, FilterPanel
│       ├── dashboard/           # SummaryCard, AccuracyChart, WeakChapterList
│       ├── recommend/           # RecommendCard
│       └── ui/                  # DifficultyBadge, AiBadge, Spinner, Alert
├── vercel.json                  # SPA 라우팅 (/* → index.html)
└── package.json
```

### 라우팅

| 경로 | 페이지 | 인증 |
|------|--------|------|
| `/` | 랜딩 페이지 | 불필요 |
| `/login` | 로그인 | 불필요 |
| `/register` | 회원가입 | 불필요 |
| `/questions` | 문제 목록 | 불필요 |
| `/questions/:id` | 문제 풀이 | 불필요 |
| `/dashboard` | 학습 대시보드 | 필요 (AuthGuard) |
| `/recommend` | 추천 문제 | 필요 (AuthGuard) |

### API 클라이언트 (`services/api.ts`)

axios 인스턴스에 요청 인터셉터를 설정해 `Authorization: Bearer <token>`을 자동 첨부한다.

```typescript
// 주요 API 함수
authApi.login(email, password)
authApi.register(username, email, password)
authApi.guest()

questionsApi.list({ chapter_name?, difficulty?, limit?, offset? })
questionsApi.detail(id)

logsApi.submit(question_id, selected_answer)
predictApi.errorProb(user_id, question_id)
explainApi.explain(question_id)
progressApi.get(user_id)
recommendApi.get(user_id, top_n, use_zpd)
```

---

## 코드 관리 전략

### 브랜치 전략

```
main   ─────────────────────────────────────► 프로덕션 브랜치
          ↑ PR 병합                            Railway / Vercel 자동 배포
dev    ──────────────────────────────────────► 개발 통합 브랜치
        ↑ PR 병합
feat/  ─ feat/#5 (로컬 연동 테스트)
       ─ feat/#6 (Docker + Railway 배포 설정)
fix/   ─ 버그 수정 커밋 (Railway 배포 이슈 대응)
```

- `feat/#N` / `fix/#N` 브랜치에서 작업 → `dev`로 PR 병합
- `dev`가 안정화되면 `main`으로 병합 → Railway·Vercel 자동 재배포

### 모노레포 구성

하나의 GitHub 레포지토리에 백엔드·프론트엔드를 함께 관리한다.

```
SQLD_AI_TRAINER/    ← 레포 루트
├── backend/        ← Python FastAPI (Railway 배포)
├── frontend/       ← React + TypeScript (Vercel 배포)
├── datasets/       ← 원본 JSON 데이터
├── outputs/        ← 학습된 모델 아티팩트 (git 추적)
├── Dockerfile      ← Railway용 (backend만 포함)
└── railway.toml
```

**배포 분리**: Railway는 루트 `Dockerfile`을 빌드 (백엔드만), Vercel은 `frontend/` 디렉토리만 빌드.

### 모델 아티팩트 관리

학습된 모델(`outputs/*.joblib`, `dkt_model.pth`)을 git으로 추적한다.

**이유**: ML 모델 재현성 확보, Railway 배포 시 별도 학습 불필요, GitHub Actions 없이 단순한 배포 파이프라인 유지.

**`.gitignore` 전략**

```
.env               ← 비밀 키 (추적 제외)
backend/*.db       ← SQLite DB (추적 제외)
.venv/             ← Python 가상환경 (추적 제외)
outputs/           ← 원칙적 제외, .gitignore에서 명시적 허용 처리
```

### 환경 변수 관리

| 변수 | 위치 | 설명 |
|------|------|------|
| `JWT_SECRET_KEY` | Railway Variables | JWT 서명 키 (32자 이상) |
| `GROQ_API_KEY` | Railway Variables | Groq LLM API 키 |
| `CORS_ORIGINS` | Railway Variables | Vercel 도메인 (콤마 구분) |
| `VITE_API_URL` | Vercel Variables | Railway 백엔드 URL |

로컬 개발 시 `backend/.env` 파일에 설정 (`.env.example` 참고).

---

## 로컬 실행

### 환경 변수 설정

```bash
cp .env.example backend/.env
# backend/.env 파일에서 JWT_SECRET_KEY, GROQ_API_KEY 설정
```

### Backend

```bash
cd backend
pip install -r requirements_api.txt
uvicorn api.main:app --reload --port 8000
```

API 문서: http://localhost:8000/docs

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

앱: http://localhost:5173

### Docker

```bash
docker build -t sqld-api .
docker run -p 8000:8000 --env-file backend/.env sqld-api
```

---

## 배포

### Backend — Railway

Railway가 루트 `Dockerfile`을 빌드해 컨테이너를 배포한다.

```toml
# railway.toml
[build]
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 600   # ML 모델 로딩 시간 확보
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

**Railway 환경 변수 설정 (필수)**

| 변수 | 값 |
|------|-----|
| `JWT_SECRET_KEY` | 랜덤 32자 이상 문자열 |
| `GROQ_API_KEY` | Groq 콘솔에서 발급 |
| `CORS_ORIGINS` | `https://<vercel-domain>.vercel.app` |

### Frontend — Vercel

| 항목 | 값 |
|------|-----|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| `VITE_API_URL` | `https://sqldaitrainer-production.up.railway.app` |

`frontend/vercel.json`이 SPA 라우팅을 처리한다.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## API 명세

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/health` | 서버·모델 상태 확인 | 불필요 |
| POST | `/auth/register` | 회원가입 | 불필요 |
| POST | `/auth/login` | 로그인 | 불필요 |
| POST | `/auth/guest` | 게스트 토큰 발급 | 불필요 |
| GET | `/questions` | 문제 목록 (limit/offset/chapter/difficulty) | 불필요 |
| GET | `/questions/{id}` | 문제 상세 | 불필요 |
| POST | `/logs` | 풀이 결과 저장 + 정답 판정 | 필요 |
| POST | `/predict` | XGBoost 오답 확률 예측 | 필요 |
| POST | `/explain` | FAISS + Groq RAG 해설 생성 | 불필요 |
| POST | `/recommend/{user_id}` | DKT + 하이브리드 문제 추천 | 필요 |
| GET | `/progress/{user_id}` | 챕터별 학습 진도 | 필요 |

---

## 데이터셋

`datasets/json/` 경로에 12개 챕터의 SQLD 기출 문제 JSON 파일.

| subject_id | 파트 | 챕터 |
|---|---|---|
| 1 | Part I | 데이터 모델링의 이해, 데이터 모델과 SQL |
| 2 | Part II | SQL 기본, SQL 활용, 관리구문 |
| 3 | Part III | SQL 수행 구조, 인덱스 튜닝, 조인 튜닝, 옵티마이저, 고급 SQL 튜닝, Lock과 트랜잭션 |

총 **297문제** — `question_type` 4종 (worst_choice, best_choice, fill_blank, different_result).

**JSON 스키마**
```json
{
  "subject_id": 2,
  "chapter_id": 1,
  "questions": [
    {
      "question_number": 1,
      "book_section": "II",
      "book_question_number": 1,
      "question_type": "worst_choice",
      "assets": [
        {
          "asset_type": "text_block",
          "payload": { "text": "문제 본문" }
        },
        {
          "asset_type": "sql_query",
          "payload": { "sql": "SELECT ..." }
        }
      ],
      "choices": [
        { "choice_number": 1, "choice_kind": "keyword",  "choice_text": "INSERT",       "is_correct": false },
        { "choice_number": 2, "choice_kind": "text",     "choice_text": "보기 텍스트",   "is_correct": false },
        { "choice_number": 3, "choice_kind": "sql_query","choice_text": "SELECT * ...", "is_correct": true  }
      ],
      "answer": { "explanation": "해설 텍스트" }
    }
  ]
}
```

> `sql_query` payload 형식은 파일마다 두 가지 중 하나로 표기된다.
> - `{ "sql": "SELECT ..." }` — 대부분의 챕터
> - `{ "dialect": "sql_server" | "plsql" | "ansi", "code": "SELECT ..." }` — dialect 명시가 필요한 챕터 (예: Lock과 트랜잭션)
>
> `choice_kind` 가능한 값: `"keyword"` · `"text"` · `"sql_query"` · `"sql_fragment"`

---

## 기술 스택 요약

| 영역 | 기술 |
|------|------|
| API 서버 | FastAPI 0.111, uvicorn, SQLAlchemy 2.0, JWT |
| ML 분류 | scikit-learn (TF-IDF + Logistic Regression) |
| 오답 예측 | XGBoost 2.0, RandomForest |
| 추천 | TruncatedSVD (CF) + TF-IDF 코사인 유사도 (CBF) |
| Knowledge Tracing | PyTorch 2.0 LSTM (DKT) |
| 벡터 검색 | FAISS (IndexFlatIP), sentence-transformers (384-dim) |
| LLM/RAG | Groq API (llama-3.1-8b-instant) |
| DB | SQLite (SQLAlchemy ORM) |
| Frontend | React 19, TypeScript, Vite, axios, Recharts, TanStack Query |
| 배포 | Docker (Railway), Vercel |
