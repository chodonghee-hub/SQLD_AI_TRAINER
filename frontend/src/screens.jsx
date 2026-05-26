/* global React */
// ============================================================
// SQLD AI — Hi-fi screens (Apple-inspired DS)
// ============================================================

// ---------- tiny atoms ----------
const Eyebrow = ({ children }) => <div className="t-eyebrow">{children}</div>;
const H1 = ({ children, style }) => <h1 className="t-h1" style={style}>{children}</h1>;
const H2 = ({ children, style }) => <h2 className="t-h2" style={style}>{children}</h2>;
const H3 = ({ children, style }) => <h3 className="t-h3" style={style}>{children}</h3>;

const Tag = ({ children, kind, style }) => (
  <span className={"tag" + (kind === "light" ? " is-light" : "") + (kind === "ai" ? " is-ai" : "")} style={style}>
    {children}
  </span>
);

const Badge = ({ kind, children }) => (
  <span className={"badge is-" + kind}>{children}</span>
);

const AiMarker = ({ children = "AI" }) => (
  <span className="ai-marker"><span className="glyph">✦</span>{children}</span>
);

const Chev = () => <span className="chev">›</span>;

// ---------- topbar ----------
const TopBar = ({ auth = "guest", active }) => (
  <div className="topbar">
    <div className="brand">
      <div className="glyph">S</div>
      <span>SQLD<span style={{ color: "var(--accent)", marginLeft: 4 }}>AI</span></span>
    </div>
    <nav>
      <a className={active === "questions" ? "is-active" : ""}>문제</a>
      {auth === "user" && <a className={active === "dashboard" ? "is-active" : ""}>대시보드</a>}
      {auth === "user" && <a className={active === "recommend" ? "is-active" : ""}>AI 추천</a>}
    </nav>
    <div className="right">
      {auth === "guest" ? (
        <>
          <button className="btn btn-sm">로그인</button>
          <button className="btn btn-primary btn-sm">회원가입</button>
        </>
      ) : (
        <>
          <span className="t-caption" style={{ color: "var(--text-2)" }}>kim.minji</span>
          <button className="btn btn-outline btn-sm">로그아웃</button>
        </>
      )}
    </div>
  </div>
);

// ============================================================
// 1. LANDING
// ============================================================
const Landing = () => (
  <div className="screen">
    <TopBar auth="guest" />
    <div className="page is-wide" style={{ paddingTop: 48 }}>
      <div className="hero">
        <Eyebrow>✦ AI 분석 기반 SQLD 학습 플랫폼</Eyebrow>
        <h1 className="t-display">AI가 분석하는<br/>SQLD 개인화 학습.</h1>
        <p>DKT · RAG · 하이브리드 추천. 297문제, 12챕터, 5가지 AI 모델로<br/>당신의 약점을 정확히 찾아냅니다.</p>
        <div className="cta-row">
          <button className="btn btn-primary btn-lg">게스트로 시작하기</button>
          <button className="btn btn-outline btn-lg">로그인</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 24, gap: 16 }}>
        {[
          ["✦", "DKT ZPD 추천", "근접발달영역(Zone of Proximal Development) 모델로 지금 풀기 적절한 난이도 문제를 자동 추천합니다."],
          ["⟐", "AI 해설 (RAG)", "유사 문제와 개념을 참조한 단계별 풀이 설명. 왜 틀렸는지, 어떻게 풀어야 하는지 자세히 안내합니다."],
          ["◉", "취약 분석", "챕터별 정답률을 시각화하고, 오답 확률(error probability) 예측으로 위험한 영역을 미리 보여줍니다."],
        ].map(([g, t, d]) => (
          <div key={t} className="feat">
            <div className="icon-circle">{g}</div>
            <h3 className="t-h3">{t}</h3>
            <p>{d}</p>
            <a className="link-pill" style={{ display: "inline-block", marginTop: 14 }}>자세히 보기 <Chev/></a>
          </div>
        ))}
      </div>

      <div className="stats-bar" style={{ marginTop: 24 }}>
        <div><div className="n">297</div><div className="l">문제</div></div>
        <div className="sep"><div className="n">12</div><div className="l">챕터</div></div>
        <div className="sep"><div className="n">5</div><div className="l">AI 모델</div></div>
      </div>
    </div>
  </div>
);

// ============================================================
// 2. LOGIN
// ============================================================
const Login = () => (
  <div className="screen">
    <TopBar auth="guest" />
    <div className="page" style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
      <div className="card" style={{ width: 440, padding: 36 }}>
        <H2 style={{ textAlign: "center" }}>로그인</H2>
        <p className="t-body-2" style={{ textAlign: "center", marginTop: 6 }}>SQLD AI에 오신 것을 환영합니다.</p>

        <div className="stack" style={{ marginTop: 28, "--gap": "16px" }}>
          <div className="field">
            <label className="field-label">이메일</label>
            <input className="input" placeholder="you@email.com" defaultValue="" />
          </div>
          <div className="field">
            <label className="field-label">비밀번호</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>로그인</button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span className="t-caption">계정이 없으신가요? </span>
          <a className="link-pill">회원가입</a>
        </div>
        <div className="divider" style={{ margin: "20px 0" }} />
        <button className="btn btn-outline" style={{ width: "100%" }}>게스트로 시작하기</button>
      </div>
    </div>
  </div>
);

// ============================================================
// 3. REGISTER
// ============================================================
const Register = () => (
  <div className="screen">
    <TopBar auth="guest" />
    <div className="page" style={{ display: "flex", justifyContent: "center", paddingTop: 56 }}>
      <div className="card" style={{ width: 440, padding: 36 }}>
        <H2 style={{ textAlign: "center" }}>회원가입</H2>
        <p className="t-body-2" style={{ textAlign: "center", marginTop: 6 }}>가입 후 자동 로그인됩니다.</p>

        <div className="stack" style={{ marginTop: 28, "--gap": "14px" }}>
          <div className="field">
            <label className="field-label">사용자명</label>
            <input className="input" placeholder="2자 이상" />
          </div>
          <div className="field">
            <label className="field-label">이메일</label>
            <input className="input" placeholder="you@email.com" />
          </div>
          <div className="field">
            <label className="field-label">비밀번호</label>
            <input className="input" type="password" placeholder="8자 이상" />
            <span className="field-hint">영문, 숫자, 특수문자 조합 권장</span>
          </div>
          <div className="field">
            <label className="field-label">비밀번호 확인</label>
            <input className="input" type="password" />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>가입하기</button>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span className="t-caption">이미 계정이 있으신가요? </span>
          <a className="link-pill">로그인</a>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// 4. QUESTION LIST
// ============================================================
const QListCard = ({ title, sql, ch, lv, type }) => (
  <div className="card card-pad-sm" style={{ cursor: "pointer" }}>
    <div className="row gap-6" style={{ flexWrap: "wrap" }}>
      <Tag kind="light">{ch}</Tag>
      <Badge kind={lv === "Easy" ? "easy" : lv === "Hard" ? "hard" : "medium"}>{lv}</Badge>
      <Tag>{type}</Tag>
      {sql && <Tag>SQL</Tag>}
    </div>
    <p className="t-body" style={{ marginTop: 12, marginBottom: 0, fontSize: 15,
      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</p>
    <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
      <span className="t-caption">#142 · 시도 23회 · 정답률 56%</span>
      <a className="link-pill">풀기 <Chev/></a>
    </div>
  </div>
);

const FilterSection = ({ title, children }) => (
  <div>
    <div className="t-caption-b" style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11, color: "var(--text-3)" }}>{title}</div>
    {children}
  </div>
);

const QuestionList = () => {
  const cards = [
    { ch: "SQL 기본", lv: "Medium", type: "best_choice", sql: true,
      title: "다음 중 SELECT 문에서 WHERE 절과 HAVING 절의 차이를 가장 정확히 설명한 것은?" },
    { ch: "JOIN 심화", lv: "Hard", type: "different_result", sql: true,
      title: "다음 두 SQL의 실행 결과가 다른 이유를 설명하시오. LEFT JOIN과 INNER JOIN의 NULL 처리..." },
    { ch: "인덱스 튜닝", lv: "Medium", type: "worst_choice", sql: false,
      title: "복합 인덱스 (a, b, c)가 생성되어 있을 때 다음 중 인덱스를 활용하지 못하는 쿼리는?" },
    { ch: "서브쿼리", lv: "Easy", type: "fill_blank", sql: true,
      title: "다음 빈칸에 들어갈 가장 적절한 키워드를 고르시오: SELECT ... FROM emp WHERE dept_id ___ (SELECT id FROM dept)" },
    { ch: "트랜잭션", lv: "Hard", type: "best_choice", sql: false,
      title: "ACID 속성 중 'Isolation Level'이 READ COMMITTED일 때 발생할 수 있는 현상은?" },
    { ch: "정규화", lv: "Easy", type: "best_choice", sql: false,
      title: "1NF, 2NF, 3NF를 만족하는 테이블의 가장 명확한 특징은 무엇인가?" },
  ];

  return (
    <div className="screen">
      <TopBar auth="user" active="questions" />
      <div className="page is-wide">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <H1>문제 목록</H1>
            <p className="t-body-2" style={{ margin: "6px 0 0" }}>총 297문제 · 필터 결과 <strong style={{ color: "var(--text)" }}>48문제</strong></p>
          </div>
          <div className="row gap-8">
            <button className="btn btn-outline btn-sm">정렬: 최신순 ▾</button>
            <button className="btn btn-primary btn-sm">필터</button>
          </div>
        </div>

        {/* active filters */}
        <div className="row gap-6" style={{ marginBottom: 20, flexWrap: "wrap" }}>
          <span className="t-caption">필터:</span>
          <span className="chip">SQL 기본 <span className="x">×</span></span>
          <span className="chip">Medium <span className="x">×</span></span>
          <span className="chip">best_choice <span className="x">×</span></span>
          <a className="link-pill" style={{ marginLeft: 4 }}>모두 지우기</a>
        </div>

        <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
          {/* filter panel */}
          <aside style={{ width: 240, flexShrink: 0 }}>
            <div className="card card-pad-sm">
              <div className="stack" style={{ "--gap": "20px" }}>
                <FilterSection title="챕터">
                  <div className="opt-row is-on"><div className="box">✓</div>SQL 기본</div>
                  <div className="opt-row"><div className="box"></div>JOIN 심화</div>
                  <div className="opt-row"><div className="box"></div>인덱스 튜닝</div>
                  <div className="opt-row"><div className="box"></div>서브쿼리</div>
                  <div className="opt-row"><div className="box"></div>트랜잭션</div>
                  <a className="link-pill" style={{ marginTop: 4, display: "inline-block", fontSize: 12 }}>+ 7개 더보기</a>
                </FilterSection>
                <FilterSection title="난이도">
                  <div className="opt-row"><div className="dot"></div>전체</div>
                  <div className="opt-row"><div className="dot"></div>Easy</div>
                  <div className="opt-row is-on"><div className="dot"></div>Medium</div>
                  <div className="opt-row"><div className="dot"></div>Hard</div>
                </FilterSection>
                <FilterSection title="문제 유형">
                  <div className="opt-row"><div className="dot"></div>전체</div>
                  <div className="opt-row is-on"><div className="dot"></div>best_choice</div>
                  <div className="opt-row"><div className="dot"></div>worst_choice</div>
                  <div className="opt-row"><div className="dot"></div>fill_blank</div>
                  <div className="opt-row"><div className="dot"></div>different_result</div>
                </FilterSection>
                <button className="btn btn-outline btn-sm" style={{ width: "100%" }}>초기화</button>
              </div>
            </div>
          </aside>

          {/* card grid */}
          <main style={{ flex: 1 }}>
            <div className="grid-2">
              {cards.map((c, i) => <QListCard key={i} {...c} />)}
            </div>

            <div className="pager" style={{ marginTop: 24 }}>
              <span className="p is-dis">‹</span>
              <span className="p">1</span>
              <span className="p is-active">2</span>
              <span className="p">3</span>
              <span className="p">4</span>
              <span className="p is-dis">…</span>
              <span className="p">15</span>
              <span className="p">›</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 5a. QUESTION DETAIL — pre-submit
// ============================================================
const QuestionDetailPre = () => (
  <div className="screen">
    <TopBar auth="user" active="questions" />
    <div className="page is-narrow">
      <a className="link-pill" style={{ marginBottom: 16, display: "inline-block" }}>‹ 목록으로</a>

      <div className="card card-pad-lg">
        <div className="row gap-6" style={{ flexWrap: "wrap" }}>
          <Tag kind="light">SQL 기본</Tag>
          <Badge kind="medium">Medium</Badge>
          <Tag>best_choice</Tag>
          <span style={{ marginLeft: "auto" }} className="t-caption">문제 #142</span>
        </div>

        <p className="t-body" style={{ marginTop: 18, fontSize: 16 }}>
          다음 SQL 쿼리에서 <strong>WHERE 절</strong>과 <strong>HAVING 절</strong>의 동작 차이로 인해 결과가 달라지는
          상황을 설명한 것 중 <strong>가장 올바른 것은</strong>?
        </p>

        <div className="sql-block" style={{ marginTop: 14 }}>
          <div><span className="com">-- 부서별 평균 급여가 5000 이상인 부서 조회</span></div>
          <div><span className="kw">SELECT</span> dept_id, <span className="fn">AVG</span>(salary) <span className="kw">AS</span> avg_sal</div>
          <div><span className="kw">FROM</span> employees</div>
          <div><span className="kw">WHERE</span> hire_date {`>=`} <span className="str">'2020-01-01'</span></div>
          <div><span className="kw">GROUP BY</span> dept_id</div>
          <div><span className="kw">HAVING</span> <span className="fn">AVG</span>(salary) {`>=`} <span className="str">5000</span>;</div>
        </div>

        {/* risk indicator */}
        <div className="risk-card" style={{ marginTop: 16 }}>
          <div className="label">
            <AiMarker>AI 예측</AiMarker>
            <span className="t-body-2" style={{ color: "var(--text)" }}>오답 확률</span>
          </div>
          <div className="bar" style={{ flex: 1 }}>
            <div className="bar-track"><div className="bar-fill is-danger" style={{ width: "73%" }} /></div>
          </div>
          <span className="pct" style={{ color: "var(--danger)" }}>위험 73%</span>
        </div>

        <H3 style={{ marginTop: 24, marginBottom: 12 }}>보기</H3>
        <div className="stack" style={{ "--gap": "8px" }}>
          <div className="choice"><div className="marker">1</div><div className="body">WHERE는 그룹화 이후, HAVING은 그룹화 이전에 적용된다.</div></div>
          <div className="choice is-selected"><div className="marker">2</div><div className="body">WHERE는 개별 행에, HAVING은 그룹 집계 결과에 조건을 적용한다.</div></div>
          <div className="choice"><div className="marker">3</div><div className="body">WHERE와 HAVING은 모두 GROUP BY와 함께만 사용할 수 있다.</div></div>
          <div className="choice"><div className="marker">4</div><div className="body">두 절은 기능적으로 동일하며, 어느 것을 사용해도 결과는 같다.</div></div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 24 }}>
          <button className="btn btn-outline">건너뛰기</button>
          <button className="btn btn-primary btn-lg">제출하기</button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// 5b. QUESTION DETAIL — post-submit
// ============================================================
const QuestionDetailPost = () => (
  <div className="screen">
    <TopBar auth="user" active="questions" />
    <div className="page is-narrow">
      <a className="link-pill" style={{ marginBottom: 16, display: "inline-block" }}>‹ 목록으로</a>

      <div className="card card-pad-lg">
        <div className="row gap-6" style={{ flexWrap: "wrap" }}>
          <Tag kind="light">SQL 기본</Tag>
          <Badge kind="medium">Medium</Badge>
          <Tag>best_choice</Tag>
          <span className="tag" style={{ marginLeft: "auto", background: "var(--danger-soft)", color: "var(--danger)" }}>오답</span>
        </div>

        <p className="t-body" style={{ marginTop: 16, fontSize: 16 }}>
          다음 SQL 쿼리에서 WHERE 절과 HAVING 절의 동작 차이로 인해 결과가 달라지는 상황을 설명한 것 중
          가장 올바른 것은?
        </p>

        <H3 style={{ marginTop: 20, marginBottom: 12 }}>결과</H3>
        <div className="stack" style={{ "--gap": "8px" }}>
          <div className="choice is-wrong">
            <div className="marker">✗</div>
            <div className="body">
              <div>WHERE는 그룹화 이후, HAVING은 그룹화 이전에 적용된다.</div>
              <div className="t-caption" style={{ marginTop: 4, color: "var(--danger)" }}>당신의 선택 — 순서가 반대입니다.</div>
            </div>
          </div>
          <div className="choice"><div className="marker">2</div><div className="body">WHERE는 개별 행에, HAVING은 그룹 집계 결과에 조건을 적용한다.</div></div>
          <div className="choice is-correct">
            <div className="marker">✓</div>
            <div className="body">
              <div>WHERE와 HAVING은 모두 GROUP BY와 함께만 사용할 수 있다.</div>
              <div className="t-caption" style={{ marginTop: 4, color: "var(--success)" }}>정답</div>
            </div>
          </div>
          <div className="choice"><div className="marker">4</div><div className="body">두 절은 기능적으로 동일하며, 어느 것을 사용해도 결과는 같다.</div></div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <div className="row gap-8">
            <button className="btn btn-outline">목록으로</button>
            <button className="btn btn-secondary">다음 문제 ›</button>
          </div>
          <button className="btn btn-primary btn-lg">
            <AiMarker>AI 해설 보기</AiMarker>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// 5c. QUESTION DETAIL — AI explanation expanded
// ============================================================
const QuestionDetailAI = () => (
  <div className="screen">
    <TopBar auth="user" active="questions" />
    <div className="page is-narrow">
      <a className="link-pill" style={{ marginBottom: 16, display: "inline-block" }}>‹ 목록으로</a>

      <div className="card card-pad-sm" style={{ padding: 16 }}>
        <div className="row gap-6">
          <Tag kind="light">SQL 기본</Tag>
          <Badge kind="medium">Medium</Badge>
          <span className="t-caption" style={{ marginLeft: "auto" }}>문제 #142 · 결과 보기 펼침</span>
        </div>
      </div>

      <div className="ai-panel" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <AiMarker>RAG 기반 해설</AiMarker>
          <span className="t-caption">생성됨 · 2.3초</span>
        </div>

        <H3 style={{ marginTop: 12, marginBottom: 12 }}>WHERE와 HAVING — 적용 시점의 차이</H3>

        <p className="t-body" style={{ fontSize: 16, color: "var(--text-2)" }}>
          SQL 실행 순서를 정확히 이해하는 것이 핵심입니다. 옵티마이저는 일반적으로
          <strong style={{ color: "var(--text)" }}> FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</strong> 순으로
          처리합니다. 따라서:
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 20, color: "var(--text-2)", fontSize: 15, lineHeight: 1.6 }}>
          <li><strong style={{ color: "var(--text)" }}>WHERE</strong>: 그룹화 <strong>이전</strong> 단계로, 개별 row를 필터링합니다.</li>
          <li><strong style={{ color: "var(--text)" }}>HAVING</strong>: 그룹화 <strong>이후</strong> 단계로, 집계 함수의 결과를 필터링합니다.</li>
        </ul>

        <p className="t-body" style={{ fontSize: 16, color: "var(--text-2)", marginTop: 12 }}>
          예제 쿼리에서는 <code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4, fontSize: 13.5 }}>WHERE hire_date {`>=`} '2020-01-01'</code>이
          먼저 적용되어 2020년 이후 입사자만 추리고, 그 결과를 <code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4, fontSize: 13.5 }}>GROUP BY dept_id</code>로
          묶은 뒤, <code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4, fontSize: 13.5 }}>HAVING AVG(salary) {`>=`} 5000</code>로 집계 조건을 검사합니다.
        </p>

        <div className="divider" />

        <H3 style={{ marginBottom: 12 }}>유사 문제</H3>
        <div className="grid-3">
          {[
            ["#089", "GROUP BY 절에 포함되지 않은 컬럼을 SELECT에서 사용하면..."],
            ["#156", "윈도우 함수(OVER 절)와 GROUP BY의 동작 차이는?"],
            ["#178", "다음 쿼리에서 옵티마이저의 실행 순서는?"],
          ].map(([n, t]) => (
            <div key={n} className="card card-pad-sm" style={{ cursor: "pointer" }}>
              <div className="row gap-6"><Tag kind="light">SQL 기본</Tag><Badge kind="easy">Easy</Badge></div>
              <p className="t-body-2" style={{ marginTop: 10, marginBottom: 8, color: "var(--text)" }}>{t}</p>
              <a className="link-pill" style={{ fontSize: 12 }}>{n} · 풀어보기 <Chev/></a>
            </div>
          ))}
        </div>
      </div>

      <div className="row" style={{ justifyContent: "center", gap: 12, marginTop: 24 }}>
        <button className="btn btn-outline">목록으로</button>
        <button className="btn btn-primary">다음 문제 ›</button>
      </div>
    </div>
  </div>
);

// ============================================================
// 6. DASHBOARD
// ============================================================
const Dashboard = () => {
  const chapters = [
    { n: "SQL 기본", v: 0.43, attempts: 28 },
    { n: "JOIN 심화", v: 0.72, attempts: 22 },
    { n: "서브쿼리", v: 0.48, attempts: 15 },
    { n: "인덱스 튜닝", v: 0.38, attempts: 18 },
    { n: "트랜잭션", v: 0.65, attempts: 12 },
    { n: "정규화", v: 0.83, attempts: 9 },
    { n: "윈도우 함수", v: 0.58, attempts: 14 },
    { n: "옵티마이저", v: 0.51, attempts: 11 },
    { n: "DDL/DML", v: 0.71, attempts: 8 },
    { n: "제약조건", v: 0.66, attempts: 6 },
    { n: "PL/SQL", v: 0.55, attempts: 4 },
    { n: "함수/집계", v: 0.61, attempts: 8 },
  ];

  return (
    <div className="screen">
      <TopBar auth="user" active="dashboard" />
      <div className="page is-wide">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <H1>내 학습 현황</H1>
            <p className="t-body-2" style={{ margin: "6px 0 0" }}>최근 30일 · 마지막 풀이 12분 전</p>
          </div>
          <button className="btn btn-outline btn-sm">기간: 30일 ▾</button>
        </div>

        <div className="grid-4">
          <div className="stat-card">
            <div className="l">총 시도</div>
            <div className="v">145<span style={{ fontSize: 18, color: "var(--text-3)", marginLeft: 4 }}>회</span></div>
            <div className="d">+12회 vs 지난주</div>
          </div>
          <div className="stat-card">
            <div className="l">전체 정답률</div>
            <div className="v is-success">68.0<span style={{ fontSize: 18 }}>%</span></div>
            <div className="d">목표 70% 까지 -2.0%</div>
          </div>
          <div className="stat-card">
            <div className="l">취약 챕터</div>
            <div className="v is-danger">3<span style={{ fontSize: 18, color: "var(--text-3)", marginLeft: 4 }}>개</span></div>
            <div className="d">정답률 50% 미만</div>
          </div>
          <div className="stat-card" style={{ border: "1px solid #d0e3fa", background: "linear-gradient(180deg, var(--ai-tint), var(--surface))" }}>
            <div className="l"><AiMarker>ZPD 학습</AiMarker></div>
            <div className="v is-accent">23<span style={{ fontSize: 18, color: "var(--text-3)", marginLeft: 4 }}>개</span></div>
            <div className="d">현재 풀기 적절한 문제</div>
          </div>
        </div>

        {/* chart */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <H3>챕터별 정답률</H3>
              <p className="t-caption" style={{ marginTop: 4 }}>기준선 50% · 70% 이상 안정 · 50~70% 주의 · 50% 미만 위험</p>
            </div>
            <div className="row gap-12">
              <span className="t-caption"><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--success)", borderRadius: 2, marginRight: 6 }} />안정</span>
              <span className="t-caption"><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--warning)", borderRadius: 2, marginRight: 6 }} />주의</span>
              <span className="t-caption"><span style={{ display: "inline-block", width: 8, height: 8, background: "var(--danger)", borderRadius: 2, marginRight: 6 }} />위험</span>
            </div>
          </div>
          <div className="bars-chart" style={{ marginTop: 16 }}>
            {chapters.map(c => {
              const kind = c.v >= 0.7 ? "is-success" : c.v >= 0.5 ? "is-warning" : "is-danger";
              return (
                <div key={c.n} className="bar-col">
                  <div className={"bar-vert " + kind} style={{ height: `${c.v * 100}%` }} />
                  <div className="bar-label">{c.n.split(" ")[0]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* bottom row */}
        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="card">
            <H3>취약 챕터</H3>
            <p className="t-caption" style={{ marginTop: 4 }}>정답률 낮은 순 · 우선 학습 추천</p>
            <div style={{ marginTop: 16 }}>
              {chapters.filter(c => c.v < 0.5).sort((a, b) => a.v - b.v).map(c => (
                <div key={c.n} className="bar-row">
                  <div>
                    <div className="t-body" style={{ fontSize: 14, fontWeight: 500 }}>{c.n}</div>
                    <div className="t-caption">시도 {c.attempts}회</div>
                  </div>
                  <div className="bar-track" style={{ width: 160 }}><div className="bar-fill is-danger" style={{ width: `${c.v * 100}%` }} /></div>
                  <div className="t-body" style={{ fontSize: 14, fontWeight: 600, textAlign: "right", color: "var(--danger)", fontFeatureSettings: '"tnum"' }}>{Math.round(c.v * 100)}%</div>
                </div>
              ))}
            </div>
            <a className="link-pill" style={{ marginTop: 12, display: "inline-block" }}>해당 챕터 문제 풀기 <Chev/></a>
          </div>

          <div className="card" style={{ background: "linear-gradient(180deg, var(--ai-tint), var(--surface))", border: "1px solid #d0e3fa" }}>
            <AiMarker>ZPD 학습 가이드</AiMarker>
            <H3 style={{ marginTop: 8 }}>당신에게 딱 맞는 23문제</H3>
            <p className="t-body-2" style={{ marginTop: 8 }}>
              DKT 모델이 예측한 정답 확률 0.3 ~ 0.6 구간의 문제입니다. 너무 쉽지도 어렵지도 않은,
              지금 풀어야 가장 학습 효율이 높은 문제들입니다.
            </p>
            <div style={{ marginTop: 16 }}>
              <div className="t-caption">예측 정답 확률 범위</div>
              <div className="bar-track" style={{ marginTop: 6, position: "relative" }}>
                <div className="bar-fill" style={{ width: "60%", background: "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--accent) 60%, transparent 90%)" }} />
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 4 }}>
                <span className="t-caption">0.0</span>
                <span className="t-caption-b" style={{ color: "var(--accent)" }}>0.3 — 0.6 (ZPD)</span>
                <span className="t-caption">1.0</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 18, width: "100%" }}>추천 문제 보러가기 ›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 7. RECOMMEND
// ============================================================
const RecCard = ({ rank, p, zpd, title, ch, lv }) => (
  <div className="card" style={{ borderColor: zpd ? "var(--accent)" : "var(--border-soft)", borderWidth: zpd ? 1 : 1 }}>
    <div className="row" style={{ alignItems: "flex-start", gap: 20 }}>
      <div className="rank-num">#{rank}</div>
      <div style={{ flex: 1 }}>
        <div className="row gap-6" style={{ flexWrap: "wrap" }}>
          <Tag kind="light">{ch}</Tag>
          <Badge kind={lv === "Easy" ? "easy" : lv === "Hard" ? "hard" : "medium"}>{lv}</Badge>
          {zpd && <Tag kind="ai"><span style={{ marginRight: 4 }}>✦</span>ZPD</Tag>}
        </div>
        <p className="t-body" style={{ fontSize: 15, marginTop: 10, marginBottom: 12 }}>{title}</p>
        <div className="row gap-12" style={{ alignItems: "center" }}>
          <span className="t-caption-b" style={{ minWidth: 110 }}>P(correct): <span style={{ color: "var(--accent)", fontFeatureSettings: '"tnum"' }}>{p.toFixed(2)}</span></span>
          <div className="bar-track" style={{ flex: 1, maxWidth: 240 }}><div className="bar-fill is-accent" style={{ width: `${p * 100}%` }} /></div>
        </div>
      </div>
      <button className="btn btn-primary btn-sm">풀기 ›</button>
    </div>
  </div>
);

const Recommend = () => (
  <div className="screen">
    <TopBar auth="user" active="recommend" />
    <div className="page is-wide">
      <div style={{ marginBottom: 20 }}>
        <AiMarker>DKT 하이브리드 추천</AiMarker>
        <H1 style={{ marginTop: 6 }}>AI 맞춤 추천</H1>
        <p className="t-body-2" style={{ marginTop: 6, maxWidth: 720 }}>
          Deep Knowledge Tracing 모델이 당신의 풀이 이력을 분석해, 지금 가장 학습 효율이 높은 문제 10개를 골랐습니다.
          ZPD 필터를 켜면 근접발달영역(P(correct) 0.3~0.6) 문제만 보여줍니다.
        </p>
      </div>

      {/* options */}
      <div className="card" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div className="row gap-24">
            <div className="row gap-8">
              <span className="t-body-2" style={{ color: "var(--text)" }}>ZPD 필터</span>
              <div className="toggle"></div>
            </div>
            <div className="row gap-8">
              <span className="t-body-2" style={{ color: "var(--text)" }}>상위 N개</span>
              <button className="btn btn-outline btn-sm">10 ▾</button>
            </div>
            <span className="t-caption">마지막 갱신 · 2분 전</span>
          </div>
          <button className="btn btn-primary">새 추천 받기</button>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <H3>취약 챕터 분석</H3>
          <p className="t-caption" style={{ marginTop: 4 }}>weak_chapters · 최근 50회 풀이 기반</p>
          <div className="row gap-8" style={{ marginTop: 14, flexWrap: "wrap" }}>
            <Tag><span className="dot" style={{ background: "var(--danger)" }}></span>인덱스 튜닝 · 38%</Tag>
            <Tag><span className="dot" style={{ background: "var(--danger)" }}></span>SQL 기본 · 43%</Tag>
            <Tag><span className="dot" style={{ background: "var(--danger)" }}></span>서브쿼리 · 48%</Tag>
          </div>
        </div>
        <div className="card" style={{ background: "linear-gradient(180deg, var(--ai-tint), var(--surface))", border: "1px solid #d0e3fa" }}>
          <AiMarker>ZPD 정보</AiMarker>
          <div className="row gap-24" style={{ marginTop: 12, alignItems: "flex-end" }}>
            <div>
              <div className="t-caption">ZPD 범위 내 문제</div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFeatureSettings: '"tnum"' }}>8<span className="t-caption" style={{ marginLeft: 4 }}>/ 10</span></div>
            </div>
            <div className="sep-vert" style={{ height: 36 }} />
            <div>
              <div className="t-caption">P(correct) 범위</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)", fontFeatureSettings: '"tnum"' }}>0.30 — 0.60</div>
            </div>
          </div>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 20, "--gap": "12px" }}>
        <RecCard rank={1} p={0.48} zpd={true} ch="인덱스 튜닝" lv="Medium"
          title="복합 인덱스 (a, b, c)가 생성된 테이블에서 WHERE b = 10 AND c = 20 쿼리의 인덱스 활용 여부는?" />
        <RecCard rank={2} p={0.41} zpd={true} ch="SQL 기본" lv="Hard"
          title="다음 SQL에서 NULL 값이 포함된 컬럼에 대한 NOT IN 조건의 동작은?" />
        <RecCard rank={3} p={0.55} zpd={true} ch="서브쿼리" lv="Medium"
          title="상관 서브쿼리(Correlated Subquery)와 인라인 뷰의 실행 계획 차이는?" />
        <RecCard rank={4} p={0.62} zpd={false} ch="JOIN 심화" lv="Medium"
          title="ANSI JOIN과 오라클 전용 JOIN(+)의 NULL 처리 동작 비교에서 옳은 것은?" />
        <RecCard rank={5} p={0.34} zpd={true} ch="트랜잭션" lv="Hard"
          title="READ COMMITTED 격리 수준에서 발생할 수 있는 Phantom Read 시나리오는?" />
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <a className="link-pill">전체 추천 결과 보기 <Chev/></a>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  Landing, Login, Register,
  QuestionList,
  QuestionDetailPre, QuestionDetailPost, QuestionDetailAI,
  Dashboard, Recommend,
});
