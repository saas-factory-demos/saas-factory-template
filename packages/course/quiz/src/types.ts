/** 題型：7 種。 */
export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'short-answer'
  | 'matching'
  | 'ordering';

/** 題目選項（single/multiple-choice 用）。 */
export interface QuestionOption {
  /** 選項代號（A / B / C / ...）。 */
  key: string;
  text: string;
}

/** 配對題的左右配對組合。 */
export interface MatchingPair {
  left: string;
  right: string;
}

/** 單一題目定義。 */
export interface Question {
  id: string;
  type: QuestionType;
  /** 題目文字（可含 markdown）。 */
  prompt: string;
  /** 配分（預設 1）。 */
  points?: number;
  /** 答錯後可顯示的解析。 */
  explanation?: string;

  /** single/multiple-choice 用：選項清單。 */
  options?: QuestionOption[];
  /** single/multiple-choice 用：正確選項 key（multi 可多個）。 */
  correctKeys?: string[];

  /** true-false 用：正解 true 還是 false。 */
  correctBoolean?: boolean;

  /** fill-blank 用：可接受的答案陣列（任一相符即可，比對前會 trim + lowercase）。 */
  acceptedAnswers?: string[];

  /** matching 用：所有正確配對。 */
  pairs?: MatchingPair[];

  /** ordering 用：正確順序的項目。 */
  orderedItems?: string[];
}

/** 完整測驗定義。 */
export interface Quiz {
  id: string;
  tenantId: string;
  courseId: string;
  lessonId?: string;
  title: string;
  questions: Question[];
  /** 是否每次抽題時打亂題目順序。 */
  randomize?: boolean;
  /** 隨機抽幾題（若小於 questions.length 才生效）。 */
  sampleCount?: number;
  /** 作答時限（秒）；超過視為自動交卷。 */
  timeLimitSeconds?: number;
  /** 重考次數上限（含首次）；undefined = 無限次。 */
  retakeLimit?: number;
  /** 及格分數（百分比 0 ~ 100）。 */
  passingScore?: number;
  /** 是否在交卷後顯示正解 + 解析。 */
  showCorrectAnswers?: boolean;
}

/** 學員作答狀態。 */
export type AttemptStatus = 'in-progress' | 'submitted' | 'graded' | 'expired';

/** 學員提交的答案（依題型不同）。 */
export interface AttemptAnswer {
  questionId: string;
  /** SC/TF 一個值；MC 多個；fill 一個字串；matching `[left]=right`；ordering item 順序 */
  selectedKeys?: string[];
  textValue?: string;
  booleanValue?: boolean;
  matchingMap?: Record<string, string>;
  orderedItems?: string[];
}

/** 評分結果（每題）。 */
export interface AnswerGrade {
  questionId: string;
  correct: boolean | null;
  pointsEarned: number;
  needsManualGrading: boolean;
}

/** 一次作答記錄。 */
export interface QuizAttempt {
  id: string;
  tenantId: string;
  quizId: string;
  userId: string;
  /** 本次實際出題的順序（snapshot，防止後續題庫改動影響評分）。 */
  questionIds: string[];
  answers: AttemptAnswer[];
  status: AttemptStatus;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  totalPoints?: number;
  grades?: AnswerGrade[];
  /** 是否需要講師批改（含 short-answer 題）。 */
  needsManualGrading?: boolean;
}

/** 題庫 / 測驗 store。 */
export interface QuizStore {
  getQuiz(id: string): Promise<Quiz | undefined>;
  upsertQuiz(q: Quiz): Promise<void>;
  getAttempt(id: string): Promise<QuizAttempt | undefined>;
  upsertAttempt(a: QuizAttempt): Promise<void>;
  listAttemptsByUser(tenantId: string, userId: string, quizId: string): Promise<QuizAttempt[]>;
}
