import { useNavigate } from 'react-router-dom';
import DifficultyBadge from '../ui/DifficultyBadge';

interface Props {
  rank: number;
  question_id: number;
  question_text: string;
  chapter_name: string;
  difficulty: string;
  p_correct: number;
  is_zpd: boolean;
}

export default function RecommendCard({ rank, question_id, question_text, chapter_name, difficulty, p_correct, is_zpd }: Props) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ borderColor: is_zpd ? 'var(--accent)' : 'var(--border-soft)' }}>
      <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
        <div className="rank-num">#{rank}</div>
        <div style={{ flex: 1 }}>
          <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
            <span className="tag is-light">{chapter_name}</span>
            <DifficultyBadge difficulty={difficulty} />
            {is_zpd && (
              <span className="tag is-ai">
                <span style={{ marginRight: 4 }}>✦</span>ZPD
              </span>
            )}
          </div>
          <p className="t-body" style={{ fontSize: 15, marginTop: 10, marginBottom: 12 }}>
            {question_text}
          </p>
          <div className="row gap-12" style={{ alignItems: 'center' }}>
            <span className="t-caption-b" style={{ minWidth: 110 }}>
              P(correct):{' '}
              <span style={{ color: 'var(--accent)', fontFeatureSettings: '"tnum"' }}>
                {p_correct.toFixed(2)}
              </span>
            </span>
            <div className="bar-track" style={{ flex: 1, maxWidth: 240 }}>
              <div className="bar-fill is-accent" style={{ width: `${p_correct * 100}%` }} />
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/questions/${question_id}`)}>
          풀기 ›
        </button>
      </div>
    </div>
  );
}
