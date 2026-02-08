// =============================================================================
// TIBETAN QUIZ – KBC-style: automatic correctness, Lock Answer, steal flow
// No manual Correct/Wrong buttons. Correctness: selectedOption === question.correctAnswer
// =============================================================================

// Use different names to avoid redeclaration (data/questions.js already defines QUESTIONS + ROUNDS on window)
const APP_QUESTIONS = (typeof window !== "undefined" && window.QUESTIONS) ? window.QUESTIONS : [];
const APP_ROUNDS = (typeof window !== "undefined" && window.ROUNDS) ? window.ROUNDS : [
  { name: "Word Round", type: "word" },
  { name: "Image Round", type: "image" },
  { name: "Knowledge Round", type: "general" },
];

// -----------------------------------------------------------------------------
// REQUIRED STATE VARIABLES
// -----------------------------------------------------------------------------
const teams = ["Songtsen", "Trisong", "Triral"];
let scores = { Songtsen: 0, Trisong: 0, Triral: 0 };
let currentRound = 0;           // roundIndex
let currentDifficulty = 0;      // difficultyIndex (easy=0, medium=1, hard=2)
let currentTeamIndex = 0;       // current participant
let currentQuestion = null;    // current question object
let currentRoundQuestions = null;
let questionsAnsweredInCurrentDifficulty = 0;

let selectedOption = null;     // index of selected option (primary or steal)
let lockedOption = null;       // after Lock Answer clicked
let stealMode = false;
let stealTeamIndex = null;      // which team is stealing
let wrongOptionIndex = null;   // primary team's wrong choice (disabled in steal)

// UI state: setup | playing | optionSelected | locked | stealTeamSelection | stealOptionSelected | stealLocked | showAnswer | nextQuestion | quizComplete
let uiState = "setup";

let timer = 30;
let interval = null;
let timeUp = false;

const DIFFICULTY_KEYS = ["easy", "medium", "hard"];
const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];
const points = { easy: 3, medium: 4, hard: 5 };
const STEAL_POINTS = 1;  // steal always +1 only

const usedQuestionIds = {};
function getUsedKey() {
  return `${currentRound}_${currentDifficulty}`;
}
function getUsedSet() {
  const key = getUsedKey();
  if (!usedQuestionIds[key]) usedQuestionIds[key] = new Set();
  return usedQuestionIds[key];
}

// -----------------------------------------------------------------------------
// TIMER – Easy 30s, Medium 25s, Hard 15s. At 0 → trigger steal mode
// -----------------------------------------------------------------------------
function getTimerSeconds() {
  const d = DIFFICULTY_KEYS[currentDifficulty];
  return d === "easy" ? 30 : d === "medium" ? 25 : 15;
}

function startTimer() {
  clearInterval(interval);
  timer = getTimerSeconds();
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = timer;
  interval = setInterval(() => {
    timer--;
    if (timerEl) timerEl.textContent = timer;
    if (timer <= 0) {
      clearInterval(interval);
      onTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function onTimeUp() {
  timeUp = true;
  stopTimer();
  // Treat as wrong: do NOT show correct answer; show Steal Question + Show Answer
  wrongOptionIndex = null;
  uiState = "awaitingStealOrShowAnswer";
  showStealQuestionAndShowAnswerButtons();
}

// -----------------------------------------------------------------------------
// QUESTIONS – filter by round type, used IDs
// -----------------------------------------------------------------------------
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestionsForCurrentRoundAndDifficulty() {
  const round = APP_ROUNDS[currentRound];
  const diffKey = DIFFICULTY_KEYS[currentDifficulty];
  return APP_QUESTIONS.filter(
    (q) => q.type === round.type && q.difficulty === diffKey
  );
}

function refillRoundQuestions() {
  const pool = getQuestionsForCurrentRoundAndDifficulty();
  const used = getUsedSet();
  let available = pool.filter((q) => !used.has(q.id));
  if (available.length < 3) {
    used.clear();
    available = pool;
  }
  const picked = shuffle(available).slice(0, Math.min(3, pool.length));
  picked.forEach((q) => used.add(q.id));
  currentRoundQuestions = picked;
}

function getCurrentQuestion() {
  if (!currentRoundQuestions || !currentRoundQuestions.length) return null;
  const idx = currentTeamIndex % currentRoundQuestions.length;
  return currentRoundQuestions[idx];
}

// -----------------------------------------------------------------------------
// OPTION STATES: idle | selected | locked | correct | wrong | disabled
// -----------------------------------------------------------------------------
function setOptionState(btn, state) {
  if (!btn) return;
  btn.classList.remove("option-idle", "option-selected", "option-locked", "option-correct", "option-wrong", "option-disabled", "option-animate");
  btn.classList.add("option-" + state);
}

function renderOptions(q, optionsState, disabledWrongIndex) {
  const container = document.getElementById("optionsContainer");
  if (!container || !q || !q.options) return;
  container.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn option-idle";
    btn.dataset.optionIndex = String(i);
    btn.textContent = opt;
    if (disabledWrongIndex === i) {
      btn.disabled = true;
      setOptionState(btn, "disabled");
    } else {
      setOptionState(btn, optionsState[i] || "idle");
      btn.addEventListener("click", () => onOptionClick(i));
    }
    container.appendChild(btn);
  });
}

function onOptionClick(optionIndex) {
  const q = getCurrentQuestion();
  if (!q) return;
  if (stealMode) {
    if (uiState !== "stealTeamSelection" && uiState !== "stealOptionSelected") return;
    if (uiState === "stealTeamSelection") return; // must pick team first
    if (optionIndex === wrongOptionIndex) return; // cannot choose wrong option
    selectedOption = optionIndex;
    uiState = "stealOptionSelected";
    updateOptionSelectionUI(optionIndex, true);
    showLockStealAnswerButton();
    return;
  }
  if (uiState !== "playing") return;
  selectedOption = optionIndex;
  uiState = "optionSelected";
  updateOptionSelectionUI(optionIndex, true);
  showLockAnswerButton();
}

function updateOptionSelectionUI(selectedIdx, isSelected) {
  const container = document.getElementById("optionsContainer");
  if (!container) return;
  const btns = container.querySelectorAll(".option-btn");
  btns.forEach((btn, i) => {
    if (parseInt(btn.dataset.optionIndex, 10) === selectedIdx) {
      setOptionState(btn, isSelected ? "selected" : "idle");
    } else if (!btn.disabled) {
      setOptionState(btn, "idle");
    }
  });
}

function showLockAnswerButton() {
  const el = document.getElementById("lockAnswerBtn");
  if (el) {
    el.style.display = "inline-block";
    el.textContent = "Lock Answer";
  }
}

function hideLockAnswerButton() {
  const el = document.getElementById("lockAnswerBtn");
  if (el) el.style.display = "none";
}

function showLockStealAnswerButton() {
  const el = document.getElementById("lockStealAnswerBtn");
  if (el) {
    el.style.display = "inline-block";
    el.textContent = "Lock Steal Answer";
  }
}

function hideLockStealAnswerButton() {
  const el = document.getElementById("lockStealAnswerBtn");
  if (el) el.style.display = "none";
}

function showStealQuestionAndShowAnswerButtons() {
  const stealBtn = document.getElementById("stealQuestionBtn");
  const showBtn = document.getElementById("showAnswerBtn");
  if (stealBtn) stealBtn.style.display = "inline-block";
  if (showBtn) showBtn.style.display = "inline-block";
}

function hideStealQuestionAndShowAnswerButtons() {
  const stealBtn = document.getElementById("stealQuestionBtn");
  const showBtn = document.getElementById("showAnswerBtn");
  if (stealBtn) stealBtn.style.display = "none";
  if (showBtn) showBtn.style.display = "none";
}

// -----------------------------------------------------------------------------
// LOCK ANSWER – automatic correctness
// -----------------------------------------------------------------------------
function onLockAnswer() {
  if (uiState !== "optionSelected" || selectedOption === null) return;
  const q = getCurrentQuestion();
  if (!q) return;
  stopTimer();
  lockedOption = selectedOption;
  uiState = "locked";
  hideLockAnswerButton();

  const correct = selectedOption === q.correctAnswer;
  if (correct) {
    // Correct: green, celebration, add points, disable all, next after delay
    applyCorrectResult();
    const diffKey = DIFFICULTY_KEYS[currentDifficulty];
    scores[teams[currentTeamIndex]] += points[diffKey];
    updateScore();
    playCorrectAnimation();
    disableAllOptions();
    setTimeout(() => goToNextQuestion(), 2500);
  } else {
    // Wrong: red selected only, DO NOT show correct answer; show Steal Question + Show Answer
    wrongOptionIndex = selectedOption;
    applyWrongResultNoReveal();
    playWrongAnimation();
    uiState = "awaitingStealOrShowAnswer";
    setTimeout(() => showStealQuestionAndShowAnswerButtons(), 800);
  }
}

/** On wrong: highlight only selected option RED; do NOT reveal correct answer. */
function applyWrongResultNoReveal() {
  const container = document.getElementById("optionsContainer");
  if (!container) return;
  const btns = container.querySelectorAll(".option-btn");
  btns.forEach((btn, i) => {
    if (i === selectedOption) setOptionState(btn, "wrong");
    else {
      btn.disabled = true;
      setOptionState(btn, "disabled");
    }
  });
}

/** Reveal correct answer (green) only – used by Show Answer button or after steal wrong. */
function revealCorrectAnswerOnly() {
  const container = document.getElementById("optionsContainer");
  if (!container) return;
  const q = getCurrentQuestion();
  if (!q) return;
  const btns = container.querySelectorAll(".option-btn");
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctAnswer) setOptionState(btn, "correct");
    else setOptionState(btn, "disabled");
  });
}

function applyCorrectResult() {
  const container = document.getElementById("optionsContainer");
  if (!container) return;
  const btns = container.querySelectorAll(".option-btn");
  const q = getCurrentQuestion();
  if (!q) return;
  btns.forEach((btn, i) => {
    if (i === q.correctAnswer) {
      setOptionState(btn, "correct");
      btn.classList.add("option-animate");
    } else setOptionState(btn, "disabled");
  });
}

function disableAllOptions() {
  const container = document.getElementById("optionsContainer");
  if (!container) return;
  container.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true;
    if (!btn.classList.contains("option-correct") && !btn.classList.contains("option-wrong")) {
      setOptionState(btn, "disabled");
    }
  });
}

// -----------------------------------------------------------------------------
// STEAL MODE – only other teams, remaining 3 options (wrong disabled), +1 only
// -----------------------------------------------------------------------------
function enterStealMode() {
  if (stealMode) return;
  stealMode = true;
  wrongOptionIndex = lockedOption !== null ? lockedOption : null;
  uiState = "stealTeamSelection";
  hideStealQuestionAndShowAnswerButtons();
  showStealPanel();
}

function showStealPanel() {
  const panel = document.getElementById("stealPanel");
  const teamList = document.getElementById("stealTeamList");
  if (!panel || !teamList) return;
  panel.style.display = "block";
  teamList.innerHTML = "";
  teams.forEach((t, i) => {
    if (i === currentTeamIndex) return; // only OTHER teams
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "steal-team-btn";
    btn.textContent = t;
    btn.onclick = () => selectStealTeam(i);
    teamList.appendChild(btn);
  });
  document.getElementById("stealPanelTitle").textContent = "Which team wants to steal?";
  hideLockAnswerButton();
  hideLockStealAnswerButton();
  hideStealQuestionAndShowAnswerButtons();
}

function selectStealTeam(teamIndex) {
  stealTeamIndex = teamIndex;
  uiState = "stealOptionSelected";
  selectedOption = null;
  document.getElementById("stealPanel").style.display = "none";
  // Re-render options: wrong option disabled, others clickable
  const q = getCurrentQuestion();
  if (q) {
    const state = {};
    renderOptions(q, state, wrongOptionIndex);
  }
  document.getElementById("team").textContent = "Team: " + teams[stealTeamIndex] + " (steal)";
}

function onLockStealAnswer() {
  if (uiState !== "stealOptionSelected" || selectedOption === null || stealTeamIndex === null) return;
  const q = getCurrentQuestion();
  if (!q) return;
  hideLockStealAnswerButton();
  uiState = "stealLocked";
  const correct = selectedOption === q.correctAnswer;
  const container = document.getElementById("optionsContainer");
  if (container) {
    const btns = container.querySelectorAll(".option-btn");
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === selectedOption) setOptionState(btn, correct ? "correct" : "wrong");
      else if (i === q.correctAnswer) setOptionState(btn, "correct");
      else setOptionState(btn, "disabled");
    });
  }
  if (correct) {
    scores[teams[stealTeamIndex]] += STEAL_POINTS; // only +1
    updateScore();
    playCorrectAnimation();
  } else {
    playWrongAnimation();
  }
  setTimeout(() => goToNextQuestion(), 2000);
}

function hideStealPanel() {
  const el = document.getElementById("stealPanel");
  if (el) el.style.display = "none";
}

/** Host clicks Steal Question → show team selection (exclude original team). */
function onStealQuestionClick() {
  if (uiState !== "awaitingStealOrShowAnswer") return;
  enterStealMode();
}

/** Host clicks Show Answer → reveal correct (green), no points, next participant. */
function onShowAnswerClick() {
  if (uiState !== "awaitingStealOrShowAnswer") return;
  hideStealQuestionAndShowAnswerButtons();
  revealCorrectAnswerOnly();
  setTimeout(() => goToNextQuestion(), 2000);
}

// -----------------------------------------------------------------------------
// ANIMATIONS
// -----------------------------------------------------------------------------
function playCorrectAnimation() {
  document.body.classList.add("animate-correct");
  const confetti = document.getElementById("confetti");
  if (confetti) confetti.classList.add("active");
  setTimeout(() => {
    document.body.classList.remove("animate-correct");
    if (confetti) confetti.classList.remove("active");
  }, 2000);
}

function playWrongAnimation() {
  document.body.classList.add("animate-wrong");
  setTimeout(() => document.body.classList.remove("animate-wrong"), 800);
}

// -----------------------------------------------------------------------------
// DISPLAY – word / image / general
// -----------------------------------------------------------------------------
function renderQuestion(q) {
  const questionContent = document.getElementById("questionContent");
  const questionImage = document.getElementById("questionImage");
  if (!q) return;
  if (questionContent) {
    questionContent.innerHTML = "";
    questionContent.style.display = "block";
    if (q.type === "word") {
      questionContent.textContent = q.question;
      questionContent.className = "question-content question-type-word";
    } else if (q.type === "image") {
      questionContent.textContent = q.question || "Identify the image";
      questionContent.className = "question-content question-type-image-label";
    } else {
      questionContent.innerHTML = q.question;
      questionContent.className = "question-content question-type-general";
    }
  }
  if (questionImage) {
    if (q.type === "image" && q.image) {
      questionImage.src = q.image;
      questionImage.alt = q.question || "";
      questionImage.style.display = "block";
      questionImage.className = "question-image question-type-image";
    } else {
      questionImage.src = "";
      questionImage.style.display = "none";
    }
  }
  renderOptions(q, {}, null);
}

// -----------------------------------------------------------------------------
// NEXT QUESTION / ROUND
// -----------------------------------------------------------------------------
function goToNextQuestion() {
  hideStealPanel();
  hideLockAnswerButton();
  hideLockStealAnswerButton();
  hideStealQuestionAndShowAnswerButtons();
  stealMode = false;
  stealTeamIndex = null;
  wrongOptionIndex = null;
  selectedOption = null;
  lockedOption = null;
  timeUp = false;

  nextTeam();
  updateScore();
  const roundFinished = advanceDifficulty();
  if (roundFinished) {
    showNextRoundPrompt();
    return;
  }
  loadNextQuestion();
}

function advanceDifficulty() {
  questionsAnsweredInCurrentDifficulty++;
  if (questionsAnsweredInCurrentDifficulty < 3) return false;
  questionsAnsweredInCurrentDifficulty = 0;
  currentDifficulty++;
  if (currentDifficulty >= 3) {
    currentDifficulty = 0;
    return true;
  }
  return false;
}

function nextTeam() {
  currentTeamIndex++;
  if (currentTeamIndex >= teams.length) currentTeamIndex = 0;
}

function loadNextQuestion() {
  uiState = "playing";
  const pool = getQuestionsForCurrentRoundAndDifficulty();
  const questionContentEl = document.getElementById("questionContent");
  if (!pool || pool.length === 0) {
    if (questionContentEl) questionContentEl.innerHTML = "No questions for this round/difficulty. Check data/questions.js and run from project root.";
    return;
  }
  if (currentTeamIndex === 0 || currentRoundQuestions === null) {
    refillRoundQuestions();
  }
  currentQuestion = getCurrentQuestion();
  if (!currentQuestion) return;
  renderQuestion(currentQuestion);
  const teamEl = document.getElementById("team");
  if (teamEl) teamEl.textContent = "Team: " + teams[currentTeamIndex];
  updateRoundDifficultyDisplay();
  const answerAreaEl = document.getElementById("answerArea");
  if (answerAreaEl) answerAreaEl.innerHTML = "";
  startTimer();
}

function startNextRound() {
  currentRound++;
  if (currentRound >= APP_ROUNDS.length) {
    declareWinner();
    return;
  }
  currentDifficulty = 0;
  questionsAnsweredInCurrentDifficulty = 0;
  updateRoundDifficultyDisplay();
  hideNextRoundPrompt();
  document.getElementById("mainGame").style.display = "block";
  loadNextQuestion();
}

function showNextRoundPrompt() {
  document.getElementById("nextRoundPrompt").style.display = "block";
  document.getElementById("mainGame").style.display = "none";
}

function hideNextRoundPrompt() {
  document.getElementById("nextRoundPrompt").style.display = "none";
  document.getElementById("mainGame").style.display = "block";
}

// -----------------------------------------------------------------------------
// DISPLAY HELPERS
// -----------------------------------------------------------------------------
function updateRoundDifficultyDisplay() {
  const roundEl = document.getElementById("roundDisplay");
  const diffEl = document.getElementById("difficultyDisplay");
  if (roundEl && APP_ROUNDS[currentRound]) roundEl.textContent = APP_ROUNDS[currentRound].name;
  if (diffEl) diffEl.textContent = DIFFICULTY_LABELS[currentDifficulty];
}

function updateScore() {
  const el = document.getElementById("scoreboard");
  if (!el) return;
  el.innerHTML = teams.map((t) => t + ": " + scores[t]).join("<br>");
}

function fullscreen() {
  document.documentElement.requestFullscreen();
}

function declareWinner() {
  let winner = "";
  let max = 0;
  teams.forEach((t) => {
    if (scores[t] > max) {
      max = scores[t];
      winner = t;
    }
  });
  document.body.innerHTML = "<h1>🏆 Winner: " + winner + "</h1>";
}

function showWinner() {
  declareWinner();
}

// -----------------------------------------------------------------------------
// START – host clicks Start to begin question
// -----------------------------------------------------------------------------
function nextQuestion() {
  uiState = "playing";
  selectedOption = null;
  lockedOption = null;
  stealMode = false;
  stealTeamIndex = null;
  wrongOptionIndex = null;
  timeUp = false;
  hideStealPanel();
  hideLockAnswerButton();
  hideLockStealAnswerButton();
  hideStealQuestionAndShowAnswerButtons();
  loadNextQuestion();
}

// -----------------------------------------------------------------------------
// INIT – expose functions for onclick (needed when script is module/bundled)
// -----------------------------------------------------------------------------
if (typeof window !== "undefined") {
  window.nextQuestion = nextQuestion;
  window.onLockAnswer = onLockAnswer;
  window.onLockStealAnswer = onLockStealAnswer;
  window.onStealQuestionClick = onStealQuestionClick;
  window.onShowAnswerClick = onShowAnswerClick;
  window.startNextRound = startNextRound;
  window.fullscreen = fullscreen;
  window.showWinner = showWinner;
}

updateRoundDifficultyDisplay();
updateScore();

// Attach Start button so it always works (inline onclick may fail when script is bundled)
document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", nextQuestion);
  }
});
