# Phase 1 — 데이터 전처리 파이프라인

## 개요

| 항목 | 내용 |
|---|---|
| 작업 단계 | Phase 1 of 5 |
| 목적 | ML 모델 학습에 필요한 정제 데이터셋 및 시뮬레이션 이력 생성 |
| 상태 | 완료 |

---

## 배경 및 목적

`datasets/json/` 에 12개의 챕터별 SQLD 문제 JSON 파일이 존재하지만, ML 모델이 바로 사용할 수 있는 형태가 아니었다. 또한 개인화 추천·오답 예측 모델에 필수적인 **사용자 학습 이력**이 실제로는 존재하지 않는 상황이었다.

이 Phase에서는 두 가지 핵심 데이터셋을 생성한다:

1. **정제된 문제 데이터** (`outputs/questions.csv`) — 모든 후속 모델의 공통 입력
2. **시뮬레이션 학습 이력** (`outputs/user_logs.csv`) — 오답 예측·추천 모델 학습 데이터

---

## 생성된 파일 구조

```
src/data/
  json_parser.py    # JSON 파싱 → 통합 DataFrame
  features.py       # feature 생성 + 규칙 기반 difficulty 추정
  simulator.py      # 시뮬레이션 사용자 학습 이력 생성
  pipeline.py       # 세 모듈을 순서대로 실행하는 진입점

outputs/
  questions.csv     # 통합 문제 데이터 (297행)
  user_logs.csv     # 시뮬레이션 학습 이력 (58,212행)
```

---

## 모듈별 구현 내용

### 1. `json_parser.py` — JSON 통합 파싱

- 12개 JSON 파일을 순회하며 문제 파싱
- `question_id` 생성 규칙: `{subject_id}_{chapter_id}_{question_number}` (예: `2_1_5`)
- `assets` 배열에서 `text_block` 텍스트는 concat, `sql_query` 코드는 별도 컬럼으로 분리
- 정답 보기 번호(`correct_choice`) 및 `answer.explanation` 추출
- 출력: 문제당 1행 DataFrame

**주요 출력 컬럼**

| 컬럼 | 설명 |
|---|---|
| `question_id` | 고유 식별자 |
| `question_text` | 문제 본문 (text_block concat) |
| `sql_code` | SQL 코드 (없으면 빈 문자열) |
| `has_sql_asset` | SQL 포함 여부 (bool) |
| `choice_kinds` | 보기 유형 목록 (콤마 구분) |
| `correct_choice` | 정답 번호 |
| `explanation` | 해설 텍스트 |

---

### 2. `features.py` — Feature 생성 + 난이도 추정

**Encoding**

| 컬럼 | 값 |
|---|---|
| `question_type_encoded` | worst_choice=0, best_choice=1, fill_blank=2, different_result=3 |
| `choice_kind_complexity` | keyword=0, text=1, sql_fragment=2, sql_query=3 (보기 중 최대값) |

**규칙 기반 difficulty 추정 (PRD 7.4 기준)**

```
different_result                         → Hard (2)
fill_blank                               → Medium (1)
has_sql_asset=True AND subject_id=3      → Hard (2)
subject_id=3 (SQL 튜닝)                  → base +1 (최대 Hard)
best_choice / worst_choice               → Easy (0) 기본
```

**난이도 분포 결과**

| difficulty_label | 문제 수 | 비율 |
|---|---|---|
| Easy | 156 | 52.5% |
| Medium | 98 | 33.0% |
| Hard | 43 | 14.5% |

---

### 3. `simulator.py` — 시뮬레이션 학습 이력 생성

**사용자 설정**

| 레벨 | 비율 | 기본 정답률 |
|---|---|---|
| beginner | 40% | 0.40 |
| intermediate | 40% | 0.65 |
| advanced | 20% | 0.85 |

**시뮬레이션 규칙**

- difficulty에 따라 정답률 보정: Easy +0, Medium -0.05, Hard -0.15
- Knowledge Tracing: 동일 문제 재시도 시 정답률 +0.02 (최대 0.95)
- 풀이 시간: 정규분포 기반 (Easy μ=30s, Medium μ=60s, Hard μ=90s)
- 사용자당 전체 문제를 1~3라운드 풀이 (라운드 간격 2주)

**시뮬레이션 결과**

| 레벨 | 실제 정답률 |
|---|---|
| advanced | 0.820 |
| intermediate | 0.625 |
| beginner | 0.370 |

**출력 스키마**

```
user_id, question_id, user_level, is_correct, solve_time_sec, submitted_at, attempt_count
```

---

### 4. `pipeline.py` — 실행 진입점

```bash
python src/data/pipeline.py
```

세 모듈을 순서대로 실행하고 `outputs/` 에 CSV 저장. 실행 후 자동 검증:
- `question_id` 중복 여부
- 각 difficulty 레이블 비율 > 5%

---

## 최종 출력 요약

| 파일 | 행 수 | 주요 내용 |
|---|---|---|
| `outputs/questions.csv` | 297 | 19개 컬럼, question_id 중복 없음 |
| `outputs/user_logs.csv` | 58,212 | 100명 × 최대 3라운드 풀이 이력 |

---

## 다음 단계 (Phase 2)

`outputs/questions.csv` 와 `outputs/user_logs.csv` 를 입력으로 하여 ML 모델 개발을 진행한다.

| 모델 | 입력 | 출력 |
|---|---|---|
| 문제 자동 분류 | `question_text`, `question_type`, `has_sql_asset` | `subject_id` / `difficulty_label` |
| 오답 예측 | `user_logs` + 문제 feature | 오답 확률 (0~1) |
| 추천 시스템 | 사용자 취약 chapter + 문제 임베딩 | 추천 문제 리스트 |
