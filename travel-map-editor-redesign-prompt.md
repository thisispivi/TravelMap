# Travel Map Editor — Complete UI/UX Redesign Prompt

You are acting as a principal product designer, UX researcher, interaction designer, frontend architect, and senior product engineer.

Your task is to **rethink the Travel Map Editor completely from scratch**.

The current editor must not constrain the new design.

Assume the existing editor's interface, workflows, information architecture, visual hierarchy, components, interaction patterns, and implementation can all be discarded.

## Core instruction

Design a new Travel Map Editor that is:

- Extremely easy to understand.
- Fast for first-time users.
- Efficient for power users.
- Automated wherever automation can safely reduce work.
- Pleasant to use on desktop.
- Functional on tablets.
- Reasonably usable on mobile where editing makes sense.
- Accessible.
- Forgiving.
- Difficult to misuse.
- Capable of scaling from a simple trip to a complex multi-city itinerary.

You may use any suitable library, framework, map SDK, design system, form library, state-management library, animation library, drag-and-drop library, geocoding provider, routing API, import format, or AI-assisted workflow.

Do not preserve the current design merely to reduce implementation effort.

## Product goal

The editor should let a user create, modify, organize, preview, and publish a travel map with minimal manual work.

The experience should feel closer to a polished modern product than an internal administration panel.

The system should guide users through the task rather than exposing the underlying data model.

## Required product questions

Before proposing the design, inspect the repository and determine:

- What the editor currently creates or edits.
- Which data structures are used.
- Which fields are mandatory.
- How the public Travel Map webapp consumes the editor output.
- What can be derived automatically.
- What external services are currently used.
- Which technical constraints are real and which are accidental consequences of the current implementation.
- Whether backwards compatibility is needed.
- What import and export formats exist.
- Which workflows are currently slow or error-prone.

Do not assume the current UI maps correctly to the real user workflow.

## Design principles

Use these principles throughout the redesign:

### Progressive disclosure

Show only what is necessary for the current step. Keep advanced controls available without overwhelming beginners.

### Automation first

Automatically derive or suggest:

- Coordinates from place names.
- Country, region, city, and timezone.
- Map viewport.
- Route order.
- Travel distance.
- Estimated travel time.
- Date ranges.
- Trip duration.
- Day grouping.
- Cover images.
- Place metadata.
- Duplicate locations.
- Missing information.
- Invalid date sequences.
- Route discontinuities.
- Map marker styles.
- Default zoom.
- Slug and internal identifiers.
- Accessible labels.
- Sensible colors.
- Preview layout.

Automation must be reviewable and reversible.

### Direct manipulation

Let users edit the trip through the map, timeline, list, and forms without forcing them to understand raw JSON.

### One source of truth

The map, itinerary, forms, and preview must stay synchronized.

### Immediate feedback

Every action should produce a visible result, validation response, saved state, or explanation.

### Safe experimentation

Support undo, redo, autosave, version history, preview, draft state, and recovery from mistakes.

### Accessibility by design

Keyboard navigation, focus management, readable contrast, semantic controls, screen-reader support, and reduced motion must be part of the design from the beginning.

## Required editor capabilities

Evaluate whether the redesigned editor should support the following and include them when appropriate.

### Trip creation

- Create a trip from scratch.
- Start from a guided template.
- Import an existing trip.
- Duplicate a previous trip.
- Paste a list of places.
- Paste a written itinerary.
- Import JSON, CSV, GPX, KML, GeoJSON, or other relevant formats.
- Generate a draft structure from natural language.
- Choose between a quick setup and advanced setup.

### Location management

- Search and add a place.
- Click directly on the map.
- Drag markers.
- Reorder places.
- Group places into days or sections.
- Detect duplicates.
- Merge duplicates.
- Add notes.
- Add dates and times.
- Add transport modes.
- Add links, bookings, images, and custom metadata.
- Bulk edit locations.
- Multi-select locations.
- Copy and paste locations.
- Mark optional or skipped places.
- Add custom coordinates.
- Handle places without precise addresses.

### Route management

- Automatically calculate route order.
- Manually override route order.
- Choose travel mode per segment.
- Show distance and estimated duration.
- Detect impossible or suspicious routes.
- Represent flights, trains, ferries, driving, walking, cycling, and custom transitions.
- Create non-geographic transitions.
- Support day trips and returns.
- Support branches or optional routes if the data model allows them.
- Allow route recalculation without losing manual decisions.

### Timeline and itinerary

- Visual day-by-day timeline.
- Date-based and order-based modes.
- Drag-and-drop reordering.
- Collapsible days.
- Conflict detection.
- Empty-day detection.
- Travel-time warnings.
- Timezone-aware scheduling.
- Flexible dates.
- Unscheduled locations.
- Notes and headings.
- Day summaries.
- Automatic numbering.

### Map editing

- Add, move, select, group, and style markers.
- Edit routes.
- Fit map to content.
- Choose map style.
- Preview clustering.
- Preview labels.
- Display route direction.
- Toggle layers.
- Show validation and conflicts directly on the map.
- Support keyboard-accessible alternatives to map-only actions.

### Content and presentation

- Trip title.
- Subtitle.
- Description.
- Cover image.
- Date range.
- Author.
- Visibility.
- Theme.
- Marker style.
- Route style.
- Section titles.
- Public notes.
- Private notes.
- Image gallery.
- Attribution.
- SEO and sharing fields when relevant.
- Preview for desktop, tablet, and mobile.

### Validation and guidance

- Inline validation.
- Whole-trip validation.
- Blocking versus non-blocking warnings.
- Clear explanations.
- Suggested fixes.
- Automatic fixes that require user confirmation.
- Pre-publish checklist.
- Missing asset detection.
- Invalid coordinates.
- Duplicate keys.
- Broken links.
- Invalid dates.
- Missing accessibility text.
- Unsupported values.
- Data compatibility checks.

### Saving and publishing

- Autosave.
- Explicit saved status.
- Drafts.
- Publish and unpublish.
- Version history.
- Undo and redo.
- Restore previous version.
- Export.
- Import.
- Preview before publishing.
- Diff before replacing imported data.
- Recovery after browser refresh or crash.
- Conflict handling for multiple tabs or users if relevant.

## Required UX deliverables

Produce a comprehensive redesign document named:

`TRAVEL_MAP_EDITOR_REDESIGN.md`

Use the following structure.

# Travel Map Editor Redesign

## 1. Executive concept

Explain:

- The core product concept.
- The main user promise.
- Why the current mental model should change.
- The proposed editing model.
- The expected improvement in ease of use.

## 2. Current-state diagnosis

Based on the repository, identify:

- Existing workflows.
- Existing pain points.
- Unnecessary manual tasks.
- Confusing terminology.
- Weak information hierarchy.
- Technical constraints.
- Data-model constraints.
- Parts that should be preserved only for compatibility.
- Parts that should be discarded.

Be candid. Do not protect the current implementation.

## 3. User types and jobs to be done

Define the main users, such as:

- First-time casual user.
- Frequent traveler.
- Power user.
- Content maintainer.
- User importing an existing itinerary.
- User fixing or updating a published map.

For each user, describe their main goals and pain points.

## 4. New information architecture

Define the main editor areas.

Consider a structure such as:

- Overview
- Itinerary
- Map
- Content
- Appearance
- Preview
- Publish

Do not use this structure automatically. Propose the best structure based on the product.

Explain what belongs in each section and what should not be shown there.

## 5. Primary workflows

Provide detailed step-by-step flows for:

1. Creating a simple trip from scratch.
2. Pasting a written itinerary and generating a draft.
3. Importing structured trip data.
4. Adding and organizing places.
5. Fixing route or date conflicts.
6. Styling the map.
7. Previewing and publishing.
8. Editing an already published trip.
9. Recovering from mistakes.
10. Performing bulk edits.

For every flow include:

- Entry point.
- User actions.
- System automation.
- Validation.
- Success state.
- Error and recovery states.

## 6. Proposed editor layout

Describe the complete desktop layout.

Include:

- Main navigation.
- Header.
- Map area.
- Timeline or list area.
- Inspector or details panel.
- Global actions.
- Save state.
- Preview.
- Validation area.
- Responsive behavior.

Decide whether the main experience should use:

- Split view.
- Map-first view.
- Timeline-first view.
- Canvas.
- Wizard.
- Hybrid model.

Explain the reasoning and tradeoffs.

## 7. Screen-by-screen specification

Describe every important screen or state.

At minimum include:

- Empty state.
- New-trip flow.
- Main editor.
- Location search.
- Location details.
- Route segment details.
- Day details.
- Bulk edit.
- Import.
- Import review and conflict resolution.
- Validation summary.
- Appearance settings.
- Preview.
- Publish dialog.
- Version history.
- Recovery state.
- Mobile or tablet editing state.

For each screen include:

- Purpose.
- Main components.
- Primary action.
- Secondary actions.
- Empty state.
- Loading state.
- Error state.
- Accessibility considerations.

## 8. Interaction model

Specify:

- Selection behavior.
- Multi-selection.
- Drag-and-drop.
- Keyboard shortcuts.
- Context menus.
- Inline editing.
- Inspector editing.
- Undo and redo.
- Autosave.
- Confirmation rules.
- Destructive actions.
- Notifications.
- Optimistic updates.
- Loading indicators.
- Map interactions.
- Timeline interactions.
- Synchronization between views.

Avoid hidden gestures as the only way to perform important actions.

## 9. Automation model

Create a table with:

- Task.
- What the system can automate.
- User confirmation required.
- Failure mode.
- Manual fallback.

Include automation for:

- Geocoding.
- Place enrichment.
- Route calculation.
- Date grouping.
- Marker naming.
- Default styling.
- Duplicate detection.
- Import cleanup.
- Validation fixes.
- Cover-image suggestions.
- Slug generation.
- Viewport fitting.
- Accessibility labels.

Define which automation should happen silently, which should be suggested, and which must require explicit confirmation.

## 10. AI-assisted features

Propose useful AI features, but do not make AI mandatory.

Possible uses:

- Convert written itineraries into structured drafts.
- Normalize inconsistent place names.
- Suggest missing stops.
- Summarize days.
- Rewrite descriptions.
- Detect itinerary inconsistencies.
- Generate alt text.
- Explain validation problems.
- Suggest route improvements.

For each AI feature include:

- User value.
- Input.
- Output.
- Review step.
- Privacy concerns.
- Non-AI fallback.

## 11. Component and design-system plan

Propose the component system.

Include:

- Buttons.
- Inputs.
- Comboboxes.
- Date controls.
- Place search.
- Map controls.
- Panels.
- Cards.
- Timeline items.
- Route segments.
- Dialogs.
- Drawers.
- Toasts.
- Validation messages.
- Empty states.
- Skeletons.
- Command palette.
- Data tables where useful.
- Drag handles.
- Status badges.
- Publish controls.

You may recommend libraries. For each library explain:

- Why it fits.
- What problem it solves.
- Risks.
- Alternatives.
- Whether it should be adopted or merely evaluated.

Potential categories include:

- Component primitives.
- Styling.
- Forms.
- Schema validation.
- Drag and drop.
- State management.
- Server state.
- Maps.
- Geocoding.
- Routing.
- Date handling.
- Rich text.
- File import.
- Virtualization.
- Command palette.
- Accessibility testing.
- End-to-end testing.

## 12. Visual direction

Define a modern visual direction without relying on decorative trends.

Specify:

- Visual hierarchy.
- Spacing.
- Typography.
- Color roles.
- Surface levels.
- Borders.
- Shadows.
- Icon usage.
- Density.
- Map integration.
- Timeline appearance.
- Selected, hover, focus, warning, error, and success states.
- Dark mode.
- Reduced-motion behavior.

Do not produce only adjectives. Explain how the visual system supports usability.

## 13. Responsive strategy

Describe behavior for:

- Large desktop.
- Laptop.
- Tablet landscape.
- Tablet portrait.
- Mobile.

Specify:

- Which panes remain visible.
- Which panes become drawers.
- How map and itinerary switching works.
- How forms are edited.
- How drag-and-drop alternatives work.
- Which operations may be intentionally limited on mobile.

## 14. Accessibility specification

Include:

- Keyboard navigation model.
- Focus order.
- Focus restoration.
- Screen-reader labels.
- Live regions.
- Map alternatives.
- Drag-and-drop alternatives.
- Error summaries.
- Form labeling.
- Contrast.
- Touch targets.
- Reduced motion.
- Zoom and text scaling.
- High-contrast support.

## 15. Data and technical architecture

Based on the repository, propose:

- Canonical editor state.
- Draft model.
- Validation model.
- Undo/redo strategy.
- Autosave strategy.
- Local recovery.
- Server synchronization.
- Import pipeline.
- Normalization pipeline.
- Geocoding pipeline.
- Routing pipeline.
- Preview architecture.
- Compatibility layer for existing Travel Map webapp data.
- Migration strategy from the current editor.

Provide data-flow diagrams using Mermaid where useful.

## 16. Proposed frontend architecture

Provide a concrete feature-based folder structure.

Include boundaries for:

- Editor shell.
- Trip overview.
- Itinerary.
- Places.
- Routes.
- Map.
- Import.
- Validation.
- Appearance.
- Preview.
- Publishing.
- History.
- Shared components.
- API clients.
- Schemas.
- State.
- Tests.

Explain component, hook, service, and state responsibilities.

## 17. State management recommendation

Choose an approach based on actual needs.

Compare options where relevant, such as:

- Local React state.
- Reducers.
- Context.
- Zustand.
- Redux Toolkit.
- XState.
- TanStack Query.
- URL state.
- Form state.

Describe:

- Canonical state.
- Server state.
- Form state.
- Selection state.
- History state.
- Derived state.
- Persistence.
- Avoiding synchronization bugs.

Do not introduce a complex library without a concrete reason.

## 18. Validation architecture

Define:

- Field validation.
- Cross-field validation.
- Whole-trip validation.
- Import validation.
- Publish validation.
- Warning versus blocking error.
- Automatic fixes.
- Validation ownership.
- Schema strategy.
- Error presentation.

Provide examples tailored to travel-map data.

## 19. Import experience

Design a robust import flow:

1. Select or paste input.
2. Detect format.
3. Parse.
4. Normalize.
5. Geocode.
6. Match duplicates.
7. Show conflicts.
8. Preview changes.
9. Apply.
10. Undo or restore.

Include partial-failure handling.

## 20. Prototype plan

Define what should be prototyped first.

Include:

- Key assumptions.
- Riskiest workflows.
- Prototype fidelity.
- User-testing tasks.
- Success criteria.
- What should be tested before implementation.

## 21. Implementation roadmap

Create phases:

### Phase 0 — Discovery and compatibility
Understand data, integrations, and migration constraints.

### Phase 1 — Editor foundation
Shell, state, autosave, undo, canonical model, and basic editing.

### Phase 2 — Core workflows
Places, itinerary, map synchronization, routes, and validation.

### Phase 3 — Import and automation
Natural-language input, structured imports, geocoding, enrichment, and bulk actions.

### Phase 4 — Appearance, preview, and publishing
Visual settings, responsive preview, publishing, and version history.

### Phase 5 — Refinement
Accessibility, performance, power-user tools, analytics, and user-testing improvements.

For each phase include:

- Deliverables.
- Dependencies.
- Risks.
- Suggested order.
- Acceptance criteria.

## 22. Recommended first release

Define the smallest redesign release that would already be substantially better than the existing editor.

Separate:

- Must have.
- Should have.
- Later.
- Explicitly out of scope.

## 23. Acceptance criteria

Create measurable acceptance criteria for:

- Ease of first trip creation.
- Time to add locations.
- Import success.
- Error recovery.
- Autosave reliability.
- Accessibility.
- Mobile and tablet usability.
- Publish confidence.
- Performance.
- Compatibility with the public Travel Map webapp.

## 24. Final recommendation

Conclude with:

- Recommended editor model.
- Recommended technical approach.
- Recommended libraries.
- Highest-risk decisions.
- First implementation milestone.
- What should be discarded from the current editor.
- What, if anything, should be preserved.

## Optional implementation work

After completing the redesign document, do not immediately rewrite the editor unless explicitly instructed.

Instead, provide:

1. A proposed implementation sequence.
2. The first vertical slice to build.
3. The exact files and modules likely to be created, replaced, or removed.
4. A migration strategy that keeps the existing public Travel Map webapp working.

## Important rules

- Start from user workflows, not the current component tree.
- Treat the existing editor as disposable.
- Preserve only real data and integration constraints.
- Prefer automation, but always provide visibility and control.
- Avoid a giant settings form.
- Avoid exposing raw JSON as the primary editing experience.
- Avoid forcing the user to switch repeatedly between unrelated screens.
- Avoid excessive dialogs.
- Avoid drag-and-drop as the only interaction.
- Avoid saving only on explicit submit.
- Avoid hiding important validation until publish time.
- Avoid generic design advice.
- Ground recommendations in the repository.
- Explain tradeoffs.
- Be concrete enough that a design and engineering team could implement the proposal.
