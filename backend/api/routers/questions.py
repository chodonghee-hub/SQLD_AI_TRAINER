from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request

from api.schemas.questions import QuestionDetail, QuestionListResponse, QuestionSummary

router = APIRouter(prefix="/questions", tags=["questions"])


def _row_to_summary(row) -> QuestionSummary:
    return QuestionSummary(
        question_id=str(row.get("question_id", "")),
        chapter_name=str(row.get("chapter_name", "") or ""),
        subject_name=str(row.get("subject_name", "") or "") or None,
        question_type=str(row.get("question_type", "") or "") or None,
        difficulty_label=str(row.get("difficulty_label", "") or "") or None,
        question_text=str(row.get("question_text", "") or ""),
    )


def _row_to_detail(row) -> QuestionDetail:
    return QuestionDetail(
        question_id=str(row.get("question_id", "")),
        chapter_name=str(row.get("chapter_name", "") or ""),
        subject_name=str(row.get("subject_name", "") or "") or None,
        question_type=str(row.get("question_type", "") or "") or None,
        difficulty_label=str(row.get("difficulty_label", "") or "") or None,
        question_text=str(row.get("question_text", "") or ""),
        choices=row.get("choices") if row.get("choices") else None,
        correct_answer=row.get("correct_answer") if row.get("correct_answer") else None,
        explanation=str(row.get("explanation", "") or "") or None,
        has_sql=bool(row.get("has_sql")) if row.get("has_sql") is not None else None,
    )


@router.get("", response_model=QuestionListResponse, summary="문제 목록 조회 (공개)")
def list_questions(
    request: Request,
    chapter_name: Optional[str] = Query(None, description="챕터명 필터"),
    difficulty: Optional[str] = Query(None, description="난이도 필터 (Easy/Medium/Hard)"),
    question_type: Optional[str] = Query(None, description="문제 유형 필터"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    df = request.app.state.models.questions_df.copy()

    if chapter_name:
        df = df[df["chapter_name"].str.contains(chapter_name, na=False)]
    if difficulty:
        df = df[df["difficulty_label"] == difficulty]
    if question_type:
        df = df[df["question_type"] == question_type]

    total = len(df)
    page = df.iloc[offset: offset + limit]
    questions = [_row_to_summary(row) for _, row in page.iterrows()]
    return QuestionListResponse(total=total, questions=questions)


@router.get("/{question_id}", response_model=QuestionDetail, summary="문제 상세 조회 (공개)")
def get_question(question_id: str, request: Request):
    df = request.app.state.models.questions_df
    match = df[df["question_id"] == question_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"문제 {question_id}를 찾을 수 없습니다.")
    return _row_to_detail(match.iloc[0])
