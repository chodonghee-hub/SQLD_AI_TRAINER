# SQLD Adaptive Learning AI Platform

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red?logo=pytorch)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

SQLD(SQL 개발자 자격증) 문제 데이터를 기반으로 **머신러닝 · 딥러닝 · NLP · 추천 시스템 · RAG/LLM** 기술을 통합한 AI 기반 적응형 학습 플랫폼.

---

## Problem & Solution

| 기존 학습 서비스의 문제 | 본 플랫폼의 해결 방식 |
|---|---|
| 모든 사용자에게 동일 문제 제공 | 개인화 문제 추천 시스템 |
| 취약점 분석 부재 | 사용자 취약 유형 자동 분석 |
| 이미 아는 문제를 반복 풀이 | 오답 예측 모델로 학습 우선순위 결정 |
| 사용자 학습 패턴 추적 부족 | LSTM/Transformer 기반 Sequential 학습 분석 |
| 단순 정답 제공 | RAG 기반 AI 맞춤 해설 생성 |

---

## Key Features

### 1. 문제 자동 분류 시스템
문제 텍스트를 분석해 유형(챕터), 난이도를 자동 분류한다.
- TF-IDF + Logistic Regression (베이스라인)
- KoBERT / Sentence Transformers (고도화)
- 출력: 12개 챕터 분류 + Easy/Medium/Hard 난이도 추정

### 2. 사용자 취약 유형 분석
카테고리별 정답률, 풀이 시간, 반복 오답 패턴, 학습 간격을 분석해 취약 영역을 도출한다.

### 3. 오답 예측 모델
과거 학습 이력을 기반으로 특정 문제를 틀릴 확률을 예측한다.
- 입력 Feature: 문제 유형, 난이도, 사용자 정답률, 풀이 시간, 학습 간격
- 모델: XGBoost / LightGBM → LSTM / Transformer Encoder (순차 학습 이력 처리)
- 출력: 오답 확률 (0~1)

### 4. 개인화 문제 추천 시스템
사용자 학습 상태에 맞는 다음 문제를 추천한다.
- Content-Based Filtering: 문제 임베딩 벡터 + FAISS 유사도 검색
- Collaborative Filtering: 유사 사용자 기반 추천
- 학습 경로: 데이터 모델링 → SQL 기본/활용 → SQL 튜닝

### 5. AI 해설 생성 시스템 (RAG)
오답 문제에 대해 AI가 오답 원인 분석 및 핵심 개념 설명을 자동 제공한다.
```
answer.explanation 전체 → 청크화 → 임베딩 → FAISS 인덱스
       ↓
사용자 오답 문제 → 쿼리 벡터 → 유사 해설 검색 → LLM 맞춤 해설 생성
```

---

## System Architecture

```
사용자
   ↓
Frontend (Streamlit / React)
   ↓
FastAPI Backend
   ↓
AI Engine
 ├── 문제 분류 모델
 ├── 오답 예측 모델
 ├── 추천 시스템
 ├── NLP 분석 시스템
 └── RAG 해설 시스템
   ↓
Database
 ├── 문제 데이터 (PostgreSQL)
 ├── 사용자 학습 데이터 (PostgreSQL)
 └── 벡터 데이터 (FAISS)
```

---

## Tech Stack

| 영역 | 기술 |
|---|---|
| 데이터 분석 | pandas, numpy |
| 머신러닝 | scikit-learn, XGBoost, LightGBM |
| 딥러닝 | PyTorch / TensorFlow |
| NLP | Transformers, KoBERT, sentence-transformers |
| SQL 파싱 | sqlparse / sqlglot |
| 추천 시스템 | cosine similarity, surprise |
| 벡터 검색 | FAISS |
| LLM 오케스트레이션 | LangChain |
| Backend API | FastAPI, SQLAlchemy, JWT |
| Frontend | Streamlit / React |
| Database | PostgreSQL |

---

## Dataset

### 구성

`datasets/json/` 경로에 12개 챕터의 SQLD 문제 JSON 파일이 존재한다.

| subject_id | 파트 | 챕터 파일 |
|---|---|---|
| 1 | I | 1. 데이터 모델링의 이해, 2. 데이터 모델과 SQL |
| 2 | II | 3. SQL 기본, 4. SQL 활용, 5. 관리구문 |
| 3 | III | 6~12. SQL 수행 구조 · 분석 도구 · 인덱스 튜닝 · 조인 튜닝 · 옵티마이저 · 고급 SQL 튜닝 · Lock과 트랜잭션 |

### JSON 스키마

```json
{
  "subject_id": 1,
  "chapter_id": 1,
  "questions": [
    {
      "question_number": 1,
      "question_type": "worst_choice",
      "assets": [
        { "asset_type": "text_block", "payload": { "text": "문제 본문" } },
        { "asset_type": "sql_query",  "payload": { "dialect": "ansi", "code": "SELECT ..." } }
      ],
      "choices": [
        { "choice_number": 1, "choice_kind": "text", "choice_text": "보기", "is_correct": false }
      ],
      "answer": { "explanation": "해설 텍스트" }
    }
  ]
}
```

### 데이터 한계 및 보완 전략

| 한계 | 보완 전략 |
|---|---|
| `difficulty` 필드 없음 | question_type + choice_kind + subject_id 기반 규칙으로 자동 추정 |
| 사용자 학습 이력 없음 | 사용자 유형별(초급/중급/고급) 시뮬레이션 데이터 생성, Knowledge Tracing 패턴 적용 |

---

## Development Phases

| 단계 | 목표 |
|---|---|
| Phase 1 | 데이터 구축 및 전처리 (JSON 파싱, feature 생성, 시뮬레이션 이력 생성) |
| Phase 2 | ML 모델 개발 (문제 분류, 오답 예측, Content-Based 추천) |
| Phase 3 | 딥러닝 확장 (LSTM, Transformer Encoder, KoBERT) |
| Phase 4 | RAG/LLM 기능 추가 (FAISS 벡터 인덱스, LangChain 파이프라인, 해설 API) |
| Phase 5 | 서비스 통합 (FastAPI 서버, UI 연결, 모델 추론 API) |

---

## Project Structure

```
SQLD/
├── datasets/
│   ├── json/                  # SQLD 문제 JSON (12개 챕터)
│   └── *.pdf                  # 챕터별 원본 PDF
├── PRD/
│   └── sqld_adaptive_learning_ai_platform_prd.md
└── README.md
```

> 모델, API, 프론트엔드 코드는 각 Phase 진행에 따라 추가될 예정.

---

## Performance Metrics

| 모델 | 평가 지표 |
|---|---|
| 문제 분류 모델 | Accuracy, F1 Score |
| 오답 예측 모델 | ROC-AUC, Log Loss |
| 추천 시스템 | Hit Rate, NDCG, Recall@K |

---

## Portfolio Highlights

`Adaptive Learning` `Recommendation System` `Deep Learning` `NLP` `Sequential Learning` `Knowledge Tracing` `RAG` `AI Service Architecture`

---

> 전체 기획 및 요구사항은 [PRD 문서](PRD/sqld_adaptive_learning_ai_platform_prd.md)를 참고.
