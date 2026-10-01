# Bộ skill QA cho sản phẩm AI-gen

13 skill / 5 group / 71 tiêu chí.

## Cấu trúc

- ID, tên, group; mô tả card VI/EN và khi sử dụng.
- Scope, stage, problem, detects.
- 4 base inputs + tối đa 2 input riêng.
- Checklist: ID, title, description = điều kiện Fail nếu.
- Principle IDs và slop signal IDs.
- Output contract 7 field; prompt template chung.
- Review lưu riêng: checked, status, note, include in prompt.

Không có field Hard rules hoặc Framework sources. Hướng dẫn QA chung nằm trong prompt.

Trạng thái: pass / fail / review / na. Thiếu bằng chứng → review. Checklist được lưu theo ID tiêu chí; dữ liệu cũ không được tự đổi thành kết luận cho tiêu chí mới.

## Triage

### Heuristic Sweep · heuristic-sweep

Tên VI: Quét heuristic

Card VI: Quét nhanh 10 nguyên tắc, chỉ ra chỗ cần soi sâu
Card EN: Quick 10-heuristic scan to find where to dig deeper

Khi dùng VI: Chạy đầu tiên khi chưa biết lỗi nằm ở đâu. Output dùng để chọn skill deep-dive
Khi dùng EN: Run first when the source of problems is unclear. Use the results to choose a deep-dive skill.

Scope: Product, Flow, Screen
Stage: QA
Problem: Usability, Consistency
Detects: missing feedback, no exit, inconsistent naming, unclear errors
Principles: state-matched-feedback, recognition-over-recall
Slop signals: Không có

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  }
]
```

**Checklist VI / EN**

#### heuristic-sweep.1 · System status

VI: Trạng thái hệ thống — Fail nếu: sau action không có thay đổi nhìn thấy, hoặc user không biết mình đang ở bước nào.

EN: System status — FAIL IF: There is no visible change after an action, or users cannot tell which step they are on.

#### heuristic-sweep.2 · Real-world match

VI: Ngôn ngữ thực tế — Fail nếu: dùng thuật ngữ kỹ thuật/nội bộ thay vì từ user quen dùng.

EN: Real-world match — FAIL IF: Labels use technical or internal jargon instead of familiar user language.

#### heuristic-sweep.3 · User control

VI: Quyền kiểm soát — Fail nếu: không có Back / Cancel / Undo ở step có thể làm sai.

EN: User control — FAIL IF: A step where users can make a mistake has no Back, Cancel, or Undo.

#### heuristic-sweep.4 · Consistency

VI: Nhất quán — Fail nếu: cùng chức năng nhưng tên gọi hoặc hành vi khác nhau giữa các màn.

EN: Consistency — FAIL IF: The same function has different names or behaviors across screens.

#### heuristic-sweep.5 · Error prevention

VI: Ngăn lỗi — Fail nếu: action không hoàn tác được mà không có confirm.

EN: Error prevention — FAIL IF: An irreversible action has no confirmation.

#### heuristic-sweep.6 · Recognition

VI: Nhận biết — Fail nếu: user phải nhớ thông tin từ màn trước để đi tiếp.

EN: Recognition — FAIL IF: Users must remember information from a previous screen to continue.

#### heuristic-sweep.7 · Efficiency

VI: Hiệu quả — Fail nếu: task lặp lại thường xuyên mà không có default, shortcut hay autofill.

EN: Efficiency — FAIL IF: A frequently repeated task has no defaults, shortcuts, or autofill.

#### heuristic-sweep.8 · Minimalism

VI: Tối giản — Fail nếu: có nội dung/element bỏ đi mà không ảnh hưởng task.

EN: Minimalism — FAIL IF: Content or elements can be removed without affecting the task.

#### heuristic-sweep.9 · Error messages

VI: Thông báo lỗi — Fail nếu: lỗi không nói nguyên nhân + cách sửa.

EN: Error messages — FAIL IF: An error does not explain its cause and how to fix it.

#### heuristic-sweep.10 · Help

VI: Trợ giúp — Fail nếu: field/khái niệm khó không có helper text inline.

EN: Help — FAIL IF: A difficult field or concept has no inline help.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

## Flow

### Purpose & Context Fit · purpose-fit

Tên VI: Phù hợp mục tiêu & ngữ cảnh

Card VI: Flow có phục vụ đúng người dùng và mục tiêu không
Card EN: Does the flow serve a real user goal in context?

Khi dùng VI: Trước khi review sâu, đặc biệt khi flow được AI gen từ prompt mơ hồ
Khi dùng EN: Use before detailed review, especially for flows generated from vague AI prompts.

Scope: Product, Flow
Stage: Structure, QA
Problem: Trust, AI Slop
Detects: no clear job, purposeless steps, dark patterns, generic flow
Principles: traceability, truthful-content
Slop signals: generic-ui

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "job-story",
    "label": "Job story",
    "type": "text",
    "required": true,
    "placeholder": "When… I want… so I can…"
  },
  {
    "id": "domain",
    "label": "Domain",
    "type": "text",
    "required": false,
    "placeholder": "Product domain"
  }
]
```

**Checklist VI / EN**

#### purpose-fit.1 · Job is stated

VI: Job rõ ràng — Fail nếu: không viết được job story 1 câu cho flow này.

EN: Job is stated — FAIL IF: A one-sentence job story cannot be written for this flow.

#### purpose-fit.2 · Every step serves the job

VI: Mỗi bước phục vụ job — Fail nếu: có step, field hoặc section mà bỏ đi vẫn không ảnh hưởng kết quả của job.

EN: Every step serves the job — FAIL IF: Removing a step, field, or section would not affect the job outcome.

#### purpose-fit.3 · No dark pattern

VI: Không dark pattern — Fail nếu: upsell, thu thập dữ liệu, urgency giả (countdown, "only 2 left") hoặc pre-checked opt-in chen vào trước khi user đạt mục tiêu.

EN: No dark pattern — FAIL IF: Upsells, data collection, fake urgency (countdowns or “only 2 left”), or pre-checked opt-ins interrupt users before they reach their goal.

#### purpose-fit.4 · Domain-specific

VI: Đúng ngữ cảnh lĩnh vực — Fail nếu: đổi tên sản phẩm sang một app khác mà màn hình vẫn hợp lý (generic test).

EN: Domain-specific — FAIL IF: Replacing the product name with another app still makes the screen equally plausible.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Task Walkthrough · task-flow

Tên VI: Đi từng bước tác vụ

Card VI: Đi từng bước, tìm chỗ user bị kẹt
Card EN: Walk each step, find where users get stuck

Khi dùng VI: Mọi flow quan trọng: onboarding, signup, checkout, create/edit
Khi dùng EN: Use for important flows: onboarding, signup, checkout, and create/edit.

Scope: Flow, Screen
Stage: Structure, Design, QA
Problem: Usability, Conversion, Navigation
Detects: hidden entry, unclear next action, vague CTA, missing feedback, extra steps
Principles: state-matched-feedback, recognition-over-recall
Slop signals: Không có

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "task",
    "label": "Task",
    "type": "text",
    "required": true,
    "placeholder": "What is the user trying to do?"
  },
  {
    "id": "success-state",
    "label": "Success state",
    "type": "text",
    "required": false,
    "placeholder": "What confirms successful completion?"
  }
]
```

**Checklist VI / EN**

#### task-flow.1 · Clear entry

VI: Điểm bắt đầu rõ — Fail nếu: entry point bị ẩn trong menu, hoặc user không biết bắt đầu từ đâu.

EN: Clear entry — FAIL IF: The entry point is hidden in a menu, or users cannot tell where to start.

#### task-flow.2 · Next action visible

VI: Hành động tiếp theo dễ thấy — Fail nếu: ở bất kỳ step nào, action chính không thấy ngay, hoặc có ≥2 action ngang hàng nhau.

EN: Next action visible — FAIL IF: The main action is not immediately visible at a step, or at least two actions have equal priority.

#### task-flow.3 · Label predicts result

VI: Nhãn dự đoán kết quả — Fail nếu: CTA chung chung ("Submit", "Continue", "Click here") hoặc kết quả khác với label.

EN: Label predicts result — FAIL IF: The CTA is generic (“Submit”, “Continue”, “Click here”), or its result differs from the label.

#### task-flow.4 · Feedback after action

VI: Phản hồi sau thao tác — Fail nếu: không có phản hồi nhìn thấy ngay sau khi thao tác.

EN: Feedback after action — FAIL IF: There is no visible feedback immediately after an action.

#### task-flow.5 · Completion is explicit

VI: Hoàn thành rõ ràng — Fail nếu: kết thúc flow mà không có xác nhận + next step.

EN: Completion is explicit — FAIL IF: The flow ends without confirmation and a next step.

#### task-flow.6 · No unnecessary steps

VI: Không bước thừa — Fail nếu: có step gộp được, bỏ được, hoặc hệ thống tự điền được.

EN: No unnecessary steps — FAIL IF: A step could be combined, removed, or filled automatically.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Dead Ends & Missing Paths · flow-completeness

Tên VI: Ngõ cụt & nhánh thiếu

Card VI: Tìm nút chết, nhánh thiếu, flow chỉ có happy path
Card EN: Find dead ends and missing paths

Khi dùng VI: Luôn chạy với output AI-gen, vì AI thường chỉ build happy path
Khi dùng EN: Always run on AI-generated output, which often implements only the happy path.

Scope: Flow, Code
Stage: Build, QA
Problem: Usability, AI Slop
Detects: dead CTA, no back/cancel, missing branches, success dead end, data not carried
Principles: no-dead-ends
Slop signals: dead-cta, happy-path-only

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "screen-list",
    "label": "Screen list",
    "type": "text",
    "required": false,
    "placeholder": "List the screens in this flow"
  },
  {
    "id": "expected-branches",
    "label": "Expected branches",
    "type": "text",
    "required": false,
    "placeholder": "Logged out, no permission, edit, delete…"
  }
]
```

**Checklist VI / EN**

#### flow-completeness.1 · Every CTA has a destination

VI: Mỗi CTA có đích đến — Fail nếu: button/link không làm gì, trỏ `#`, hoặc dẫn tới màn không tồn tại.

EN: Every CTA has a destination — FAIL IF: A button or link does nothing, points to #, or leads to a nonexistent screen.

#### flow-completeness.2 · Exit path on every step

VI: Mỗi bước có đường thoát — Fail nếu: step không có Back/Cancel/Close và không có lý do rõ ràng.

EN: Exit path on every step — FAIL IF: A step has no Back, Cancel, or Close without a clear reason.

#### flow-completeness.3 · Alternate branches exist

VI: Có nhánh thay thế — Fail nếu: thiếu nhánh như chưa đăng nhập, không có quyền, quên mật khẩu, edit/delete sau khi create.

EN: Alternate branches exist — FAIL IF: Branches such as logged out, no permission, forgot password, or edit/delete after creation are missing.

#### flow-completeness.4 · Success is not a dead end

VI: Success không là ngõ cụt — Fail nếu: màn success không có hướng đi tiếp.

EN: Success is not a dead end — FAIL IF: The success screen offers no next destination.

#### flow-completeness.5 · Data carries across steps

VI: Dữ liệu đi qua các bước — Fail nếu: dữ liệu nhập ở step trước không xuất hiện hoặc sai lệch ở step sau (review, summary, receipt).

EN: Data carries across steps — FAIL IF: Data entered earlier is missing or inconsistent in later review, summary, or receipt screens.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### States & Recovery · state-recovery

Tên VI: Trạng thái & phục hồi

Card VI: Đủ trạng thái và phục hồi được khi lỗi
Card EN: Complete states and error recovery

Khi dùng VI: Màn data-driven, form, payment, action xóa
Khi dùng EN: Use for data-driven screens, forms, payments, and destructive actions.

Scope: Component, Screen, Flow, Code
Stage: Build, QA
Problem: Usability, Trust
Detects: missing loading/empty/error, generic error, lost input, double submit
Principles: state-matched-feedback, no-dead-ends
Slop signals: happy-path-only, premature-success

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "async-events",
    "label": "Async events",
    "type": "text",
    "required": false,
    "placeholder": "Loading, network requests, background jobs…"
  },
  {
    "id": "failure-scenarios",
    "label": "Failure scenarios",
    "type": "text",
    "required": false,
    "placeholder": "Validation, payment, network errors…"
  }
]
```

**Checklist VI / EN**

#### state-recovery.1 · States exist

VI: Đủ trạng thái — Fail nếu: màn data-driven thiếu một trong các trạng thái loading, empty, error, success, partial.

EN: States exist — FAIL IF: A data-driven screen lacks loading, empty, error, success, or partial states.

#### state-recovery.2 · Empty state guides

VI: Empty state hướng dẫn — Fail nếu: chỉ hiện "No data" mà không có lý do + action.

EN: Empty state guides — FAIL IF: The empty state only says “No data” without a reason and an action.

#### state-recovery.3 · Errors are specific

VI: Lỗi cụ thể — Fail nếu: "Something went wrong" mà không có nguyên nhân + cách sửa.

EN: Errors are specific — FAIL IF: An error only says “Something went wrong” without a cause and a recovery action.

#### state-recovery.4 · Input preserved

VI: Giữ dữ liệu nhập — Fail nếu: lỗi validate hoặc lỗi network làm mất dữ liệu đã nhập.

EN: Input preserved — FAIL IF: Validation or network errors discard entered data.

#### state-recovery.5 · Prevent before fix

VI: Ngăn lỗi trước khi sửa — Fail nếu: action destructive không có confirm/undo, hoặc form dài chỉ validate sau khi submit.

EN: Prevent before fix — FAIL IF: A destructive action lacks confirmation/undo, or a long form validates only after submission.

#### state-recovery.6 · Controls match state

VI: Control khớp trạng thái — Fail nếu: vẫn bấm được nút submit khi đang loading, hoặc nút bị disabled mà không nói lý do.

EN: Controls match state — FAIL IF: Submit remains available while loading, or a disabled control has no explanation.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

## Content

### IA & Labels · ia-labels

Tên VI: Kiến trúc thông tin & nhãn

Card VI: Nhãn dễ hiểu, thông tin dễ tìm
Card EN: Clear labels, findable information

Khi dùng VI: Navigation, settings, màn nhiều mục
Khi dùng EN: Use for navigation, settings, and screens with many items.

Scope: Product, Flow, Content
Stage: Structure, QA
Problem: Navigation, Consistency
Detects: jargon, terminology drift, illogical grouping, hidden key info
Principles: recognition-over-recall
Slop signals: terminology-drift

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "user-terms",
    "label": "User terms",
    "type": "text",
    "required": false,
    "placeholder": "Terms real users use"
  }
]
```

**Checklist VI / EN**

#### ia-labels.1 · User language

VI: Ngôn ngữ người dùng — Fail nếu: label dùng thuật ngữ nội bộ/kỹ thuật ("Entity", "Sync object").

EN: User language — FAIL IF: Labels use internal or technical terms such as “Entity” or “Sync object”.

#### ia-labels.2 · One term, one meaning

VI: Một thuật ngữ, một nghĩa — Fail nếu: một khái niệm có ≥2 tên trong flow (Order / Purchase / Booking).

EN: One term, one meaning — FAIL IF: The same concept has at least two names within the flow, such as Order, Purchase, and Booking.

#### ia-labels.3 · Logical grouping

VI: Nhóm hợp lý — Fail nếu: mục không liên quan nằm chung nhóm, hoặc mục liên quan nằm rải rác.

EN: Logical grouping — FAIL IF: Unrelated items share a group, or related items are scattered.

#### ia-labels.4 · Decision info findable

VI: Thông tin quyết định dễ tìm — Fail nếu: giá, deadline, trạng thái bị ẩn sau click hoặc phải scroll sâu.

EN: Decision info findable — FAIL IF: Price, deadline, or status is hidden behind a click or deep scrolling.

#### ia-labels.5 · Location is clear

VI: Vị trí rõ ràng — Fail nếu: thiếu title, active nav hoặc step indicator.

EN: Location is clear — FAIL IF: The screen lacks a title, active navigation, or step indicator.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Content Truth · content-truth

Tên VI: Tính xác thực nội dung

Card VI: Tìm dữ liệu giả, số liệu bịa, copy chung chung
Card EN: Find fake data, invented claims, generic copy

Khi dùng VI: Luôn chạy với AI-gen, rủi ro cao nhất về trust
Khi dùng EN: Always run on AI-generated output to catch high-risk trust issues.

Scope: Content, Screen, Flow
Stage: Design, QA
Problem: Trust, AI Slop
Detects: placeholder leak, unsourced metrics, generic copy, hidden costs, false success
Principles: truthful-content, state-matched-feedback
Slop signals: placeholder-leak, fake-dashboard, generic-copy, premature-success

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "real-data-source",
    "label": "Real data source",
    "type": "text",
    "required": false,
    "placeholder": "Source of metrics, claims, and testimonials"
  },
  {
    "id": "sensitive-data",
    "label": "Sensitive data",
    "type": "text",
    "required": false,
    "placeholder": "Personal or financial information involved"
  }
]
```

**Checklist VI / EN**

#### content-truth.1 · No placeholder leak

VI: Không sót placeholder — Fail nếu: còn lorem ipsum, "John Doe", "Acme", `$99.99`, TODO, ảnh stock.

EN: No placeholder leak — FAIL IF: Lorem ipsum, “John Doe”, “Acme”, $99.99, TODO, or stock images remain.

#### content-truth.2 · Numbers are real or marked

VI: Số liệu thật hoặc ghi rõ mẫu — Fail nếu: metric, %, rating, testimonial hoặc "10,000+ users" không có nguồn và không được đánh dấu là sample.

EN: Numbers are real or marked — FAIL IF: Metrics, percentages, ratings, testimonials, or “10,000+ users” have no source and are not marked as sample data.

#### content-truth.3 · Copy is specific

VI: Copy cụ thể — Fail nếu: câu chung chung ("Unlock your potential", "Seamless experience") dùng được cho bất kỳ app nào.

EN: Copy is specific — FAIL IF: Generic copy such as “Unlock your potential” or “Seamless experience” could fit any app.

#### content-truth.4 · Costs shown before commit

VI: Chi phí rõ trước khi xác nhận — Fail nếu: phí, giới hạn, auto-renew hoặc cách dùng dữ liệu chỉ hiện ra sau khi user bấm.

EN: Costs shown before commit — FAIL IF: Fees, limits, auto-renewal, or data use appear only after commitment.

#### content-truth.5 · Claims match behavior

VI: Tuyên bố khớp hành vi — Fail nếu: hiện "Secure", "Saved", "Done" khi hệ thống chưa thực sự làm (VD: toast hiện trước khi API trả về).

EN: Claims match behavior — FAIL IF: The UI claims “Secure”, “Saved”, or “Done” before the system actually completes the action, such as a toast before the API response.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Cognitive Load · cognitive-load

Tên VI: Tải nhận thức

Card VI: Giảm thứ user phải nhớ và phải chọn
Card EN: Reduce memory and decision burden

Khi dùng VI: Form dài, dashboard, flow nhiều bước, màn có nhiều lựa chọn
Khi dùng EN: Use for long forms, dashboards, multi-step flows, and screens with many choices.

Scope: Flow, Screen, Content
Stage: Structure, Design, QA
Problem: Complexity, Usability
Detects: unchunked forms, too many choices, recall burden, redundant entry
Principles: recognition-over-recall
Slop signals: Không có

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  }
]
```

**Checklist VI / EN**

#### cognitive-load.1 · Chunked

VI: Chia nhóm — Fail nếu: form/list dài không chia nhóm hoặc step; nhóm có hơn ~7 item mà không phân cấp.

EN: Chunked — FAIL IF: A long form or list has no groups or steps, or a group has more than roughly seven items without hierarchy.

#### cognitive-load.2 · Choices limited

VI: Giới hạn lựa chọn — Fail nếu: điểm quyết định có nhiều lựa chọn ngang hàng mà không có default/recommended.

EN: Choices limited — FAIL IF: A decision presents many equal choices without a default or recommendation.

#### cognitive-load.3 · No recall needed

VI: Không cần ghi nhớ — Fail nếu: user phải nhớ mã, giá hoặc lựa chọn từ màn trước.

EN: No recall needed — FAIL IF: Users must remember codes, prices, or selections from an earlier screen.

#### cognitive-load.4 · System absorbs complexity

VI: Hệ thống xử lý độ phức tạp — Fail nếu: bắt user nhập thứ hệ thống tự suy ra được, hoặc nhập lại dữ liệu đã cung cấp (WCAG 3.3.7 Redundant Entry).

EN: System absorbs complexity — FAIL IF: Users must enter information the system can infer or re-enter previously supplied data (WCAG 3.3.7 Redundant Entry).

#### cognitive-load.5 · Help at the moment

VI: Trợ giúp đúng lúc — Fail nếu: hướng dẫn bị dồn ở đầu thay vì inline đúng chỗ cần.

EN: Help at the moment — FAIL IF: Instructions are concentrated at the beginning instead of inline where needed.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

## Visual

### Visual Hierarchy · visual-hierarchy

Tên VI: Phân cấp thị giác

Card VI: Nhìn là biết cái gì quan trọng
Card EN: Key content and actions are obvious

Khi dùng VI: User bỏ sót CTA chính, màn hình rối mắt
Khi dùng EN: Use when users miss the main CTA or the screen feels visually noisy.

Scope: Screen, Component
Stage: Design, QA
Problem: Usability, Conversion
Detects: competing CTAs, unclear purpose, wrong proximity, inconsistent styling
Principles: hierarchy-before-decoration
Slop signals: equal-prominence

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "primary-action",
    "label": "Primary action",
    "type": "text",
    "required": true,
    "placeholder": "The main action on this screen"
  }
]
```

**Checklist VI / EN**

#### visual-hierarchy.1 · One primary action

VI: Một hành động chính — Fail nếu: ≥2 CTA có cùng visual weight, hoặc CTA chính không phải element nổi bật nhất.

EN: One primary action — FAIL IF: At least two CTAs share the same visual weight, or the main CTA is not the most prominent element.

#### visual-hierarchy.2 · 5-second test

VI: Kiểm tra 5 giây — Fail nếu: nhìn 5 giây không nói được màn này dùng để làm gì.

EN: 5-second test — FAIL IF: After five seconds, users cannot say what the screen is for.

#### visual-hierarchy.3 · Proximity = relation

VI: Khoảng cách thể hiện quan hệ — Fail nếu: khoảng cách giữa các mục không liên quan ≤ khoảng cách giữa các mục liên quan (VD: label nằm xa input).

EN: Proximity = relation — FAIL IF: Spacing between unrelated items is no greater than spacing between related items, such as a label far from its input.

#### visual-hierarchy.4 · Same function, same style

VI: Cùng chức năng, cùng style — Fail nếu: cùng chức năng nhưng khác style, hoặc khác chức năng nhưng trông giống nhau (link và text thường).

EN: Same function, same style — FAIL IF: The same function uses different styles, or different functions look identical, such as links and ordinary text.

#### visual-hierarchy.5 · Emphasis is rationed

VI: Tiết chế nhấn mạnh — Fail nếu: có quá 2 điểm nhấn (màu nổi, bold, badge) cạnh tranh trong cùng một viewport.

EN: Emphasis is rationed — FAIL IF: More than two visual accents (bright colors, bold text, badges) compete in one viewport.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### AI Visual Slop · ai-visual-slop

Tên VI: Trang trí AI thừa

Card VI: Tìm trang trí và card thừa không có lý do
Card EN: Find decoration and containers with no purpose

Khi dùng VI: Output AI-gen hoặc UI dựng nhiều từ template
Khi dùng EN: Use for AI-generated output or template-heavy interfaces.

Scope: Screen, Component
Stage: Design, QA
Problem: AI Slop, Complexity
Detects: decorative gradients, nested cards, meaningless badges, template layout
Principles: weakest-sufficient-separator, hierarchy-before-decoration
Slop signals: cardification, excessive-pills, excessive-badges, gradient-glow-overuse, meaningless-decoration, emoji-decoration, generic-ui

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  }
]
```

**Checklist VI / EN**

#### ai-visual-slop.1 · Decoration has a job

VI: Trang trí có mục đích — Fail nếu: gradient, glow, blur, illustration hoặc emoji không báo status, hierarchy hay action.

EN: Decoration has a job — FAIL IF: A gradient, glow, blur, illustration, or emoji communicates no status, hierarchy, or action.

#### ai-visual-slop.2 · Containers have a reason

VI: Khung bao có lý do — Fail nếu: card lồng card, hoặc mỗi item là một card dù không có action riêng.

EN: Containers have a reason — FAIL IF: Cards are nested, or every item is a card without its own action.

#### ai-visual-slop.3 · Lightest separator

VI: Phân tách vừa đủ — Fail nếu: dùng cả border + shadow + background trong khi chỉ spacing là đủ.

EN: Lightest separator — FAIL IF: Border, shadow, and background are combined when spacing alone is sufficient.

#### ai-visual-slop.4 · Badges mean something

VI: Badge có ý nghĩa — Fail nếu: badge/pill không phải status, category hay filter.

EN: Badges mean something — FAIL IF: A badge or pill represents no status, category, or filter.

#### ai-visual-slop.5 · Not template default

VI: Không dùng template mặc định — Fail nếu: dùng layout mặc định của AI (hero gradient + 3 feature card + icon tròn) mà không có lý do từ domain.

EN: Not template default — FAIL IF: The UI uses a default AI layout (gradient hero, three feature cards, circular icons) without a domain-specific reason.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

## Build

### Design System · design-system

Tên VI: Design System

Card VI: Dùng đúng token và component
Card EN: Correct tokens and components

Khi dùng VI: Trước handoff, review code AI-gen
Khi dùng EN: Use before handoff and when reviewing AI-generated code.

Scope: Component, Screen, Code
Stage: Build, QA
Problem: Consistency
Detects: hardcoded values, duplicate components, inconsistent behavior
Principles: traceability
Slop signals: arbitrary-tokens, component-proliferation

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "system-source",
    "label": "Design system source",
    "type": "text",
    "required": true,
    "placeholder": "Library, tokens, or code path"
  },
  {
    "id": "known-exceptions",
    "label": "Known exceptions",
    "type": "text",
    "required": false,
    "placeholder": "Approved deviations and their reasons"
  }
]
```

**Checklist VI / EN**

#### design-system.1 · Reuse components

VI: Tái dùng component — Fail nếu: có component mới gần giống component sẵn có.

EN: Reuse components — FAIL IF: A new component is nearly identical to an existing one.

#### design-system.2 · Tokens only

VI: Chỉ dùng token — Fail nếu: color/spacing/radius/shadow bị hardcode, không map với token.

EN: Tokens only — FAIL IF: Color, spacing, radius, or shadow values are hardcoded rather than mapped to tokens.

#### design-system.3 · Consistent behavior

VI: Hành vi nhất quán — Fail nếu: cùng component nhưng hành vi khác nhau giữa các màn.

EN: Consistent behavior — FAIL IF: The same component behaves differently across screens.

#### design-system.4 · Exceptions documented

VI: Ghi rõ ngoại lệ — Fail nếu: có ngoại lệ mà không ghi lại lý do.

EN: Exceptions documented — FAIL IF: An exception has no documented reason.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Responsive · responsive

Tên VI: Responsive

Card VI: Dùng tốt trên mọi kích thước màn hình
Card EN: Works across screen sizes

Khi dùng VI: Trước QA cross-device
Khi dùng EN: Use before cross-device QA.

Scope: Screen, Component, Code
Stage: Build, QA
Problem: Usability, Accessibility
Detects: horizontal overflow, hidden content, CTA below fold, small targets
Principles: no-dead-ends
Slop signals: Không có

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  },
  {
    "id": "viewports",
    "label": "Viewports",
    "type": "text",
    "required": false,
    "placeholder": "320 / 768 / 1280"
  }
]
```

**Checklist VI / EN**

#### responsive.1 · No horizontal overflow

VI: Không tràn ngang — Fail nếu: có scroll ngang ở 320px (trừ table, map, code block).

EN: No horizontal overflow — FAIL IF: There is horizontal scrolling at 320px, except for tables, maps, and code blocks.

#### responsive.2 · Content parity

VI: Nội dung tương đương — Fail nếu: nội dung/chức năng bị ẩn trên mobile mà không có cách truy cập thay thế.

EN: Content parity — FAIL IF: Mobile hides content or functionality without an alternative access path.

#### responsive.3 · Priority preserved

VI: Giữ ưu tiên — Fail nếu: CTA chính bị đẩy xuống cuối trang trên mobile.

EN: Priority preserved — FAIL IF: The main CTA is pushed to the bottom of the page on mobile.

#### responsive.4 · Touch targets

VI: Kích thước chạm — Fail nếu: target nhỏ hơn 24×24 CSS px (mức tối thiểu của WCAG 2.2); khuyến nghị 44×44.

EN: Touch targets — FAIL IF: A target is smaller than 24×24 CSS px (WCAG 2.2 minimum); 44×44 is recommended.

#### responsive.5 · Zoom 200%

VI: Zoom 200% — Fail nếu: layout vỡ hoặc text bị cắt khi zoom 200%.

EN: Zoom 200% — FAIL IF: The layout breaks or text is clipped at 200% zoom.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

### Accessibility · accessibility

Tên VI: Khả năng tiếp cận

Card VI: Đạt WCAG 2.2 AA trên flow chính
Card EN: WCAG 2.2 AA on core flows

Khi dùng VI: Mọi flow public-facing, bắt buộc trước release
Khi dùng EN: Use for every public-facing flow; required before release.

Scope: Product, Screen, Component, Code
Stage: Design, Build, QA
Problem: Accessibility, Trust
Detects: low contrast, color-only meaning, missing labels, keyboard traps, drag-only
Principles: state-matched-feedback
Slop signals: Không có

**Input fields**

```json
[
  {
    "id": "target",
    "label": "Flow / screens",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Checkout: Cart → Shipping → Payment → Success"
  },
  {
    "id": "user-goal",
    "label": "User & goal",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Returning buyer wants to reorder in < 1 min"
  },
  {
    "id": "artifact",
    "label": "Artifact",
    "type": "text",
    "placeholder": "Link, screenshots, or code path"
  },
  {
    "id": "known-concern",
    "label": "Known concern",
    "type": "textarea",
    "placeholder": "What to look at first?"
  }
]
```

**Checklist VI / EN**

#### accessibility.1 · Contrast

VI: Tương phản — Fail nếu: text < 4.5:1, text lớn < 3:1, UI/icon < 3:1.

EN: Contrast — FAIL IF: Text contrast is below 4.5:1, large text below 3:1, or UI/icon contrast below 3:1.

#### accessibility.2 · Not color alone

VI: Không chỉ dùng màu — Fail nếu: status/error chỉ được thể hiện bằng màu.

EN: Not color alone — FAIL IF: Status or errors are communicated by color alone.

#### accessibility.3 · Accessible names

VI: Tên truy cập — Fail nếu: icon button không có label, input chỉ có placeholder, image thiếu alt.

EN: Accessible names — FAIL IF: Icon buttons lack labels, inputs only have placeholders, or images lack alt text.

#### accessibility.4 · Keyboard

VI: Bàn phím — Fail nếu: không Tab tới được element, không thấy focus, focus bị sticky header che (2.4.11), hoặc bị keyboard trap.

EN: Keyboard — FAIL IF: An element cannot be reached with Tab, focus is invisible or obscured by a sticky header (2.4.11), or there is a keyboard trap.

#### accessibility.5 · Motor & situational

VI: Vận động & hoàn cảnh — Fail nếu: chỉ thao tác được bằng drag hoặc gesture phức tạp mà không có cách thay thế (2.5.7), hoặc login bắt giải đố/nhớ mã (3.3.8).

EN: Motor & situational — FAIL IF: Interaction requires dragging or complex gestures without an alternative (2.5.7), or login requires puzzles or memorized codes (3.3.8).

#### accessibility.6 · Media & motion

VI: Media & chuyển động — Fail nếu: video không có caption, hoặc animation không tôn trọng `prefers-reduced-motion`.

EN: Media & motion — FAIL IF: Videos lack captions, or animation ignores prefers-reduced-motion.

**Output contract**

- Criterion
- Status (pass / fail / review / na)
- Problem
- Evidence (screen + element + exact text/value)
- Severity (BLOCKER / HIGH / MEDIUM / LOW)
- Fix (one concrete change)
- Confidence (High / Medium / Low)

**Prompt template**

```text
You are a senior product designer doing QA on an AI-generated {{scope}}.

TARGET: {{target}}
USER & GOAL: {{user-goal}}
ARTIFACT: {{artifact}}
CONTEXT: {{skill-inputs}}
REVIEWER NOTES: {{included-notes}}

Evaluate ONLY these criteria. A criterion fails ONLY when its FAIL IF condition is met:
{{checklist}}

RULES
1. Every "fail" must cite evidence: screen + element + exact text or value.
2. Not enough evidence → status "review". Never guess pass or fail.
3. Do not report issues outside this list.
4. One finding per root cause. Merge duplicates.
5. Fix = one concrete change. No "improve X" or "consider Y".

OUTPUT
1. Table: criterion | status | severity
2. Findings (fail + review only), sorted BLOCKER → LOW:
   Problem / Evidence / Severity / Fix / Principle / Confidence
3. Top 3 fixes to do first.
```

