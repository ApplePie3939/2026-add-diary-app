# タスクリスト（実装計画）

spec.md をもとにした開発工程全体のタスクリスト。
上から順に実装することを前提とした依存関係順になっている。

---

## フェーズ 0: 環境セットアップ

- [ ] **0-1** Firebase プロジェクトを作成する（Firestore / Auth / Storage を有効化）
- [ ] **0-2** Firebase コンソールから `firebaseConfig` を取得し、`.env.local` に環境変数として記載する
- [ ] **0-3** 必要なパッケージをインストールする
  - `firebase`（JS SDK v11 系）
  - `expo-image-picker`
- [ ] **0-4** `src/lib/firebase.ts` を作成し、Firebase を初期化する（`initializeApp` / `getFirestore` / `getAuth` / `getStorage`）

---

## フェーズ 1: 型定義・定数の整備

- [ ] **1-1** `src/types/entry.ts` を作成し、`Entry` 型を spec.md のデータモデルに合わせて定義する
  - フィールド: `id`, `userId`, `icon`, `title`, `body`, `date`, `imageUrl`, `createdAt`, `updatedAt`
  - `date` / `createdAt` / `updatedAt` は `Date`（Firestore Timestamp からの変換後）
- [ ] **1-2** `src/constants/icons.ts` を作成し、絵文字プリセット配列 `ICONS` を定数として管理する（初期値: 8 種類。拡張しやすい構造にする）
- [ ] **1-3** `src/constants/colors.ts` を作成し、カラーパレット定数（`PAPER` / `INK` / `SUB` / `ACCENT` / `CARD`）を一元管理する
- [ ] **1-4** `src/constants/config.ts` を作成し、`PAGE_SIZE = 20`（無限スクロール 1 回あたりの取得件数）を定数として管理する

---

## フェーズ 2: ディレクトリ構成の再編

- [ ] **2-1** `src/app/` を spec.md の構成に合わせて再編する
  - `src/app/(auth)/login.tsx`（空ファイルで作成）
  - `src/app/(auth)/register.tsx`（空ファイルで作成）
  - `src/app/(auth)/_layout.tsx`
  - `src/app/(app)/_layout.tsx`（認証ガード）
  - `src/app/(app)/index.tsx`（日記一覧）
  - `src/app/(app)/new.tsx`（日記作成）
  - `src/app/(app)/[id]/index.tsx`（日記詳細）
  - `src/app/(app)/[id]/edit.tsx`（日記編集）
- [ ] **2-2** ルートの `src/app/_layout.tsx` を更新し、`(auth)` / `(app)` グループを Stack に登録する
- [ ] **2-3** `src/components/` / `src/hooks/` / `src/store/` ディレクトリを整備する

---

## フェーズ 3: 認証

- [ ] **3-1** `src/store/auth.tsx` を作成する
  - `AuthProvider` / `useAuth` フック
  - Firebase Auth の `onAuthStateChanged` で認証状態を監視
  - `signIn` / `signUp` / `signOut` 関数を提供
- [ ] **3-2** `src/app/(app)/_layout.tsx` に認証ガードを実装する（未ログイン時は `/(auth)/login` へリダイレクト）
- [ ] **3-3** `src/app/(auth)/login.tsx` を実装する
  - メールアドレス＋パスワードでサインイン
  - 新規登録画面へのリンク
  - エラー表示（メールアドレス未存在・パスワード不一致など）
- [ ] **3-4** `src/app/(auth)/register.tsx` を実装する
  - メールアドレス＋パスワードで新規登録
  - ログイン画面へのリンク
  - エラー表示（メール重複など）
- [ ] **3-5** `src/app/(auth)/_layout.tsx` を実装する（ログイン済みユーザーは `/(app)/` へリダイレクト）
- [ ] **3-6** `useAuth` のユニットテストを作成する（Firebase Auth をモック）

---

## フェーズ 4: Firestore 連携（entries store）

- [ ] **4-1** `src/store/entries.tsx` を Firestore ベースに全面書き換えする
  - コレクションパス: `users/{userId}/entries/{entryId}`
  - 提供する値: `entries`, `hasMore`, `isLoading`, `loadMore`, `addEntry`, `updateEntry`, `deleteEntry`
- [ ] **4-2** 無限スクロール対応のページネーションを実装する
  - `startAfter` カーソルを使って `PAGE_SIZE` 件ずつ取得
  - `hasMore` フラグで追加取得の有無を判定
- [ ] **4-3** Firestore Security Rules を設定する
  - `users/{userId}/entries/{entryId}` への読み書きを `request.auth.uid == userId` で制限
- [ ] **4-4** `src/store/entries.test.tsx` を Firestore モック版に書き直す
  - `addEntry` / `updateEntry` / `deleteEntry` / ページネーションのロジックをテスト
  - Firebase Emulator Suite または `jest.mock` でモックする

---

## フェーズ 5: 日記一覧画面

- [ ] **5-1** `src/app/(app)/index.tsx` を実装する
  - `FlatList` + `onEndReached` で無限スクロール
  - 各カードにアイコン（絵文字）・タイトル・日付・本文冒頭を表示
  - 右下の FAB から日記作成画面へ遷移
- [ ] **5-2** `src/components/EntryCard.tsx` を作成する（一覧カードの再利用コンポーネント）
- [ ] **5-3** 検索バーを一覧画面上部に実装する
  - 検索中は全件取得モードに切り替え、クライアントサイドでタイトル・本文を部分一致フィルタリング
  - 検索クリア時は通常のページネーションモードに戻る
- [ ] **5-4** ローディング中・空状態・エラー時のフィードバック UI を実装する

---

## フェーズ 6: 日記作成画面

- [ ] **6-1** `src/app/(app)/new.tsx` を実装する（既存の `new.tsx` をベースに Firebase 連携・フィールド追加）
  - フィールド: アイコン（絵文字選択）・タイトル・本文・日付（デフォルト当日）・画像（任意）
  - 保存時に Firestore へ書き込み → 一覧画面へ戻る
  - キャンセル時は確認なしで破棄
- [ ] **6-2** `src/components/IconPicker.tsx` を作成する（`ICONS` プリセットから選択する UI コンポーネント）
- [ ] **6-3** `src/components/DatePicker.tsx` を作成する（日付入力コンポーネント）
- [ ] **6-4** `src/hooks/useImagePicker.ts` を作成する
  - `expo-image-picker` で端末のカメラロールから画像を選択
  - Firebase Storage（`images/{userId}/{entryId}`）へアップロードし URL を返す

---

## フェーズ 7: 日記詳細画面

- [ ] **7-1** `src/app/(app)/[id]/index.tsx` を実装する
  - アイコン・タイトル・日付・本文・画像を表示
  - 編集画面へのリンク
  - 削除ボタン（確認ダイアログあり）→ 削除後に一覧画面へ戻る

---

## フェーズ 8: 日記編集画面

- [ ] **8-1** `src/app/(app)/[id]/edit.tsx` を実装する
  - 作成画面と同じフォームを既存データで初期表示
  - 保存時に Firestore を更新 → 詳細画面へ戻る
  - キャンセル時は変更を破棄

---

## フェーズ 9: 仕上げ・品質担保

- [ ] **9-1** カラーパレット定数（`src/constants/colors.ts`）を全画面・コンポーネントで使用するよう統一する（インラインのカラー文字列を排除）
- [ ] **9-2** `StyleSheet.create` への統一を確認する（インラインスタイルが残っていれば修正）
- [ ] **9-3** TypeScript の strict モードでエラーがないことを確認する（`tsc --noEmit`）
- [ ] **9-4** `jest` でテストが全件グリーンになることを確認する
- [ ] **9-5** Firestore Security Rules の動作確認（別ユーザーのデータへのアクセス拒否）
- [ ] **9-6** iOS / Android 実機（または Expo Go）で動作確認する

---

## 将来対応（現フェーズ対象外）

- 絵文字プリセットを 8 種類 → 10 種類に拡張
- パスワードリセット画面
- 日付範囲フィルター
- オフラインキャッシュ（Firestore パーシステンス）
- 外部検索サービス（Algolia 等）との連携
- プッシュ通知
- CI/CD パイプライン
- Web 対応
