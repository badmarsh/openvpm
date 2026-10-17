# AI text helper: what it can and cannot do

The **Agent** page drafts text from the words you supply. It does **not** read
patient charts, retrieve overdue vaccinations, book appointments or change records.
Questions are sent individually; the displayed chat history is not sent as context.

Use it for nonclinical copy or templates. Every response is an **unsaved draft**;
a staff member must check facts and explicitly save any record in its own editor.
Do not use chat as a diagnosis, prescribing, dosing or emergency decision system.
A warning in a prompt is not a guarantee that every model response is safe.

The operator enables `AI_TEXT_ENABLED=true`, selects `AI_MODEL`, and supplies
the matching provider key in the **server environment**. **AI Settings** shows
configuration problems. Ready means configured, not tested with the provider.
Only active admins and veterinarians can request text generation; hosted access
rules and request limits also apply. Disabled or failed AI does not prevent
normal chart work. Never put provider secrets in a browser form or chat message.

The structured `ai.patientsOverdueVaccinations`, `ai.patientsNeedingFollowUp`
and `ai.dailySummary` dashboard queries are separate deterministic helpers.
They are not called by Agent chat. Verify their results against source records.

Image/audio analysis, automated diagnosis, and browser-managed model settings
are unavailable. See [configuration and compatibility](../ai-configuration.md)
and the [local verification queue](../pilot/README.md).
