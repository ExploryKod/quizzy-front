# Fixed: spaces missing in question title (quiz editor)

## Symptom

When editing a **question title** in the quiz form, pressing **Space** did not insert a space. Saved data looked like `OùsetrouvelaChine?` instead of `Où se trouve la Chine?`.

The **quiz title** (top of the form) and **answer** fields were unaffected.

## Root cause

The question title `<input>` lived **inside** `mat-expansion-panel-header` / `mat-panel-title`.

Angular Material’s `MatExpansionPanelHeader` listens for `keydown` on the header host and treats **Space** and **Enter** as **toggle panel** (accessibility for `role="button"`). It calls `preventDefault()` without checking if the event came from an `<input>`. The event bubbles from the input to the header, so **Space never reached the input** as a character.

Answer fields were **outside** the header (in the panel content), so they did not hit this behavior.

## Fix

- **Header**: show only a **read-only** summary of the question title (ellipsis + native `title` tooltip for full text), with fallback to `quiz.defaultQuestionTitle` when empty.
- **Panel body**: move the **editable** title into a `mat-form-field` **below** the header (still inside the same `mat-expansion-panel`), keeping the existing `(change)` → `updateTitle` flow.

**Files:** `src/app/pages/quiz-edit/components/quiz-form-question/quiz-form-question.component.html` and `.scss`.

## Date

2026-04-19
