
<p>
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=loom-lang.vscode-loom">
      <img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/loom-lang.vscode-loom?label=Visual%20Studio%20Marketplace" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=loom-lang.vscode-loom">
      <img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/loom-lang.vscode-loom" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=loom-lang.vscode-loom">
      <img alt="Visual Studio Marketplace Installs" src="https://img.shields.io/visual-studio-marketplace/i/loom-lang.vscode-loom" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=loom-lang.vscode-loom">
      <img alt="Visual Studio Marketplace Rating" src="https://img.shields.io/visual-studio-marketplace/r/loom-lang.vscode-loom">
    </a>
 </p>
</p>
<br>

# Loom Extension

This is a Visual Studio Code extension that provides syntax highlighting, code snippets, and language server features (diagnostics, hover, completion, go-to-definition) for the [Loom programming language](https://github.com/rbx-loom/loom).

## Settings

- `loom.languageServerPath` — path to a `Loom.LanguageServer` executable. Leave empty to use the version bundled with this extension for your platform.
- `loom.trace.server` — trace communication between VS Code and the Loom language server (`off`, `messages`, `verbose`).

## Development

```bash
npm install
npm run build:server   # publishes Loom.LanguageServer for your platform into server/
npm run watch          # bundle the extension with esbuild in watch mode
```

`build:server` looks for a sibling checkout of [rbx-loom/loom](https://github.com/rbx-loom/loom) by default; set the `LOOM_REPO` environment variable to point elsewhere. Press F5 in VS Code to launch an Extension Development Host.

## Release process

Each release is published per-platform as a self-contained VSIX (the `Loom.LanguageServer` binary is bundled, so end users don't need a separate install).

1. Bump `version` in `package.json` and commit.
2. Tag the commit, e.g. `git tag v0.2.0 && git push origin v0.2.0`.
3. Pushing the tag triggers [`.github/workflows/publish.yml`](.github/workflows/publish.yml), which builds, packages, and publishes `win32-x64`, `linux-x64`, `darwin-x64`, and `darwin-arm64` VSIXes to the Marketplace, and attaches them to a GitHub release.

You can also run the workflow manually via `workflow_dispatch` to build and package without publishing (leave the `publish` input unchecked).
