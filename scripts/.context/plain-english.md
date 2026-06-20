# Plain English

The documentation audit script checks whether the project's documentation is easy to maintain and safe to promote.

It counts documentation files, checks links, points out documents without a main title, lists possible orphan files, and classifies open maintenance requests by the kind of official documentation they may need later.

It does not decide new RPG rules. It only reports what is visible in the repository so a person or future agent can review the right documents with less repeated work.

Alternatives:

- Manual review: faster once, but expensive to repeat and easy to miss old records.
- Full automatic rewriting: faster output, but too risky for Pandorha rules and architecture.
- Current approach: local audit first, then careful human or agent review for official updates.

The UI reachability smoke checks that every visible area still has a browser panel, that editable inventory actions and save wiring remain reachable, that old placeholder promises do not return, and that important UI fixes remain represented in code and documentation. It is fast and repeatable, while the Browser do Codex remains responsible for proving the rendered interaction really works.

For the PWA slice, the smokes now also check that the app has an installable manifest, visible install/update controls when the browser state allows them, and a service worker message that can activate a waiting update. They still do not pretend to test real offline networking; that remains a rendered browser validation job.

The Compendium generator reads selected official rule folders and creates a ready-to-use catalog file for the app. It is a repeatable preparation step: the browser receives a validated index, but the script does not change the original rule documents or invent new summaries.

The UI smokes also check that the Compendium keeps its category filter, system categories and source file/line visible. They catch missing contracts quickly, but the real rendered browsing flow still has to be checked in Browser do Codex.
