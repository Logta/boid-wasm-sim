## 重要ルール

- 日本語で応答して
- t-wada の TDD を遵守して
- ライブラリは最新のものを使うこと
- 型定義の際は type を使うこと
- function を使うこと
- class の利用は原則禁止
- pnpm を使って
- README.md を常に最新に保つこと
  - 記述は謙虚にシンプルに
- .mise.toml にコマンドを適宜追加すること

## プロジェクト概要

Go WebAssembly + React によるBoid群れシミュレーション。pnpm workspace のモノレポ構成。
詳細は README.md を参照。

## 技術スタック

- Go（WASMコア） / Node.js / pnpm（いずれも mise 管理、正確なバージョンは `.mise.toml` を参照）
- React 19 / TypeScript 7 / Vite 8
- Tailwind CSS v4 / Radix UI
- テスト: Go標準testing、Vitest + Testing Library + jsdom
- Lint/Format: Biome

## ディレクトリ構成

- `wasm/` — Go WebAssemblyのコアロジック（テスト最優先）
- `web/hooks/` — カスタムフック（型テスト含む）
- `web/components/` — UIコンポーネント
- `web/main/` — メインアプリ（Vite + React）

## よく使うコマンド

mise タスク経由での実行を基本とする（詳細は .mise.toml）。

- `mise run dev` — 開発サーバー起動（初回・clean checkout後は先に `mise run build` を実行して各パッケージの `dist` を生成しておくこと）
- `mise run build` — 全パッケージビルド（hooks → components → wasm → web の順）
- `mise run test-all` — テスト実行（components / web / wasm。**web/hooks は含まれない**ので変更時は個別に `pnpm --filter @boid-wasm-sim/hooks test` を実行する）
- `mise run check` — Biomeによるlint
- `mise run typecheck` — 型チェック

## テスト方針

- t-wada式TDDでRed→Green→Refactorを徹底する
- `wasm/` のGoロジックのテストを最優先（シミュレーションの正しさを担保）
- `web/hooks`, `web/components`, `web/main` は Vitest + Testing Library

## 開発時の注意

- WASMモジュールを更新したら `pnpm --filter @boid-wasm-sim/wasm build` で再ビルドしてから確認する
- 依存更新時は `.mise.toml` の `minimum_release_age`（7日）の制約に注意する
