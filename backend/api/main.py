"""
Phase 5 — SQLD Adaptive Learning Platform FastAPI Backend

실행:
    uvicorn api.main:app --reload --port 8000

Swagger UI:
    http://localhost:8000/docs

환경 변수:
    JWT_SECRET_KEY   JWT 서명 키 (기본값: dev용 임시 키)
    GROQ_API_KEY     Groq LLM API 키 (없으면 RAG fallback)
"""
import asyncio
import os
import pathlib
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv(pathlib.Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.database import create_tables
from api.routers import auth, explain, logs, predict, progress, questions, recommend
from api.state import app_state


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    app.state.models = app_state
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, app_state.load)
    yield


app = FastAPI(
    title="SQLD 적응형 학습 플랫폼 API",
    description=(
        "Phase 5 — FastAPI 서비스\n\n"
        "## 인증 방식\n"
        "- **게스트**: `POST /auth/guest` → Bearer 토큰 발급 → 문제 조회·해설 조회 가능\n"
        "- **회원**: `POST /auth/register` 또는 `POST /auth/login` → Bearer 토큰 발급 → 전체 기능 사용\n\n"
        "## 주요 기능\n"
        "- 문제 조회 (공개)\n"
        "- RAG AI 해설 생성 (공개)\n"
        "- 풀이 결과 저장 (인증 필요)\n"
        "- DKT ZPD 개인화 추천 (인증 필요)\n"
        "- 학습 진도 대시보드 (인증 필요)\n"
        "- 오답 확률 예측 (인증 필요)\n"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — 로컬 개발 서버 + Vercel 프로덕션/프리뷰 + 환경변수로 추가 오리진 허용
_extra_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://sqld-ai-trainer.vercel.app",
        *_extra_origins,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(explain.router)
app.include_router(logs.router)
app.include_router(recommend.router)
app.include_router(progress.router)
app.include_router(predict.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "SQLD Adaptive Learning API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    from fastapi import Response
    state = app.state.models if hasattr(app.state, "models") else None
    data_ready = state is not None and state.questions_df is not None
    body = {
        "status": "ok" if data_ready else "initializing",
        "data_ready": data_ready,
        "models": {
            "recommender": state.recommender is not None if state else False,
            "dkt": state.dkt_model is not None if state else False,
            "explainer": state.explainer is not None if state else False,
            "predictor": state.predictor_model is not None if state else False,
        },
    }
    if not data_ready:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content=body)
    return body
