# Character Create In Plain English

The character creation form lets the user create a basic Pandorha character from the browser.

It asks for name, concept, starting identity choices, level, three Eixos, and three Aplicações. The real Character service checks whether the numbers follow the 6/6 rule before the character appears in the list.

When something is wrong, the form now explains what needs to be corrected in Portuguese instead of showing a technical error.

The form now also lets the user choose an ancestry and exactly 3 traits from that ancestry. These choices are checked before the character is created, but the trait effects are not applied yet.

The form now also shows the official class and background lists. The user sees Portuguese names, while the saved technical ids stay in English.

For now, the character only exists during the current browser session. Reloading the app clears it because permanent storage is planned for a later Worker/SQLite task.

The three selected ancestry traits are now saved by the app and shown later in the character list. The form still only collects the choice; it does not apply any automatic trait effect.
