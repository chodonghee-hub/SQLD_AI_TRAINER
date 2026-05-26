"""
앱 시작 시 ML 모델과 데이터를 한 번만 로드해 app.state에 보관.
각 요청마다 재로드하지 않도록 startup 이벤트에서 호출.
"""
import pathlib
import sys

import pandas as pd
import torch

# src/models 를 import 경로에 추가
_SRC_MODELS = pathlib.Path(__file__).resolve().parent.parent / "src" / "models"
if str(_SRC_MODELS) not in sys.path:
    sys.path.insert(0, str(_SRC_MODELS))

MODEL_DIR = pathlib.Path(__file__).resolve().parent.parent / "models"
OUTPUTS_DIR = pathlib.Path(__file__).resolve().parent.parent / "outputs"

# RAG 설명 캐시 (question_id → 생성 결과): 동일 문제 중복 API 호출 방지
_explain_cache: dict = {}


class AppState:
    """FastAPI app.state 에 바인딩되는 컨테이너."""

    def __init__(self):
        self.questions_df: pd.DataFrame | None = None
        self.logs_df: pd.DataFrame | None = None

        # Phase 2 — 분류기 / 오답 예측기
        self.classifier: dict | None = None
        self.predictor_model = None
        self.predictor_feature_names: list | None = None

        # Phase 3 — 추천기 / 임베더 / DKT
        self.recommender: dict | None = None
        self.dkt_model = None
        self.dkt_question_ids: list | None = None
        self.device: torch.device = torch.device("cpu")

        # Phase 4 — RAG 해설기
        self.explainer = None

    # ------------------------------------------------------------------
    def load(self) -> None:
        self._load_data()
        self._load_recommender()
        self._load_dkt()
        self._load_explainer()
        self._load_predictor()
        print("[AppState] 모든 모델 로딩 완료")

    # ------------------------------------------------------------------
    def _load_data(self) -> None:
        q_path = OUTPUTS_DIR / "questions.csv"
        l_path = OUTPUTS_DIR / "user_logs.csv"
        self.questions_df = pd.read_csv(q_path)
        self.logs_df = pd.read_csv(l_path)
        print(f"[AppState] 데이터 로드 — 문제 {len(self.questions_df)}건, 로그 {len(self.logs_df)}건")

    def _load_recommender(self) -> None:
        try:
            from recommender import load_recommender
            self.recommender = load_recommender(MODEL_DIR)
            print("[AppState] 추천기 로드 완료")
        except Exception as e:
            print(f"[AppState] 추천기 로드 실패: {e}")

    def _load_dkt(self) -> None:
        try:
            from knowledge_tracer import load_knowledge_tracer
            self.dkt_model, self.dkt_question_ids = load_knowledge_tracer(
                MODEL_DIR, self.device
            )
            self.dkt_model.eval()
            print("[AppState] DKT 모델 로드 완료")
        except Exception as e:
            print(f"[AppState] DKT 로드 실패: {e}")

    def _load_explainer(self) -> None:
        try:
            from explainer import RAGExplainer
            self.explainer = RAGExplainer(MODEL_DIR, self.questions_df)
            print("[AppState] RAG 해설기 로드 완료")
        except Exception as e:
            print(f"[AppState] RAG 해설기 로드 실패: {e}")

    def _load_predictor(self) -> None:
        try:
            import joblib
            self.predictor_model = joblib.load(MODEL_DIR / "predictor_primary.joblib")
            self.predictor_feature_names = joblib.load(
                MODEL_DIR / "predictor_feature_names.joblib"
            )
            print("[AppState] 오답 예측기 로드 완료")
        except Exception as e:
            print(f"[AppState] 오답 예측기 로드 실패: {e}")


# 싱글턴 — main.py 에서 app.state.models 로 바인딩
app_state = AppState()
explain_cache = _explain_cache
