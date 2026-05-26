# Changelog

## v1.0.3

### Added

- Expanded the bundled offline knowledge base from a small starter set to a broader beginner-to-advanced AI learning curriculum.
- Added original notes for LLM foundations, prompt engineering, tool calling, RAG, Agent workflows, evaluation, production readiness, and the AI Play project learning path.
- Added a Windows zip app package alongside the Windows installer so users can inspect or run the complete packaged app directory.

### Changed

- Updated the Windows installer to use a guided setup flow instead of one-click install.
- Enabled installation path selection, desktop shortcut creation, Start Menu shortcut creation, and launch-after-install for Windows.
- Simplified release assets to a small set of user-facing packages: Windows exe, Windows zip, macOS dmg, and Linux AppImage.
- Standardized release artifact names with version, OS, and architecture.
- Rewrote GitHub Release notes in clear Chinese download guidance and removed duplicate custom source archives.

### Verified

- Rebuilt the bundled knowledge index: 87 chunks with 256-dimensional local embeddings.
- Passed knowledge index validation, retrieval smoke checks, runtime retrieval checks, TypeScript, Vite, and Electron build steps.
