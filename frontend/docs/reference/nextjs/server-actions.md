◆ Server Actionsの主な使用パターン

1. formの操作：クライアント側のjavascriptのロジックを実装せずにsubmitが可能
2. データ変更操作：DBのデータ更新や外部サービスの更新をフロントから直接実行可能
3. 認証操作：ログインやサインイン、他認証に関する操作
4. ファイル操作：アップロード、ダウンロード、その他ファイル操作
5. 外部API連携：外部サービスに対するfetchやデータ送信操作
---
1.「form」の操作
```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  
  // Validate input
  if (!title || title.length < 3) {
    return { error: "Title must be at least 3 characters" };
  }

  // Save to database (example using a hypothetical DB client)
  await db.todos.create({ data: { title } });
  
  // Revalidate the todos page to show the new todo
  revalidatePath("/todos");
  
  // Redirect back to the todos page
  redirect("/todos");
}

// app/todos/page.tsx
import { addTodo } from "../actions";

export default function TodoPage() {
  return (
    <div>
      <h1>Todo List</h1>
      
      <form action={addTodo}>
        <input type="text" name="title" placeholder="Add a new todo" />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}
```
Handling Form State and Errors  
You can use the useFormState hook from react-dom to handle form state:
```typescript
// app/todos/page.tsx
"use client";

import { addTodo } from "../actions";
import { useFormState } from "react-dom";

export default function TodoPage() {
  const [state, formAction] = useFormState(addTodo, { error: null });
  
  return (
    <div>
      <h1>Todo List</h1>
      
      <form action={formAction}>
        <input type="text" name="title" placeholder="Add a new todo" />
        <button type="submit">Add Todo</button>
        {state.error && <p className="error">{state.error}</p>}
      </form>
    </div>
  );
}
```
Server Action with Progressive Enhancement  
Server Actions work even without JavaScript enabled, but you can enhance them:
```typescript
// app/todos/page.tsx
"use client";

import { addTodo } from "../actions";
import { useFormStatus } from "react-dom";

// Button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoPage() {
  return (
    <div>
      <h1>Todo List</h1>
      
      <form action={addTodo}>
        <input type="text" name="title" placeholder="Add a new todo" />
        <SubmitButton />
      </form>
    </div>
  );
}
```
Calling Server Actions from Event Handlers  
You can also call Server Actions directly from event handlers:
```typescript
// app/todos/page.tsx
"use client";

import { deleteTodo } from "../actions";

export default function TodoItem({ id, title }: { id: string, title: string }) {
  return (
    <div className="todo-item">
      <span>{title}</span>
      <button onClick={async () => {
        await deleteTodo(id);
      }}>
        Delete
      </button>
    </div>
  );
}

// app/actions.ts
"use server";

export async function deleteTodo(id: string) {
  await db.todos.delete({ where: { id } });
  revalidatePath("/todos");
}
```
Best Practices
```
    Use the "use server" directive: Place it at the top of files containing server actions or inline before function declarations
    Validate inputs: Always validate user inputs for security
    Handle errors gracefully: Return error states to provide feedback to users
    Use revalidatePath: To update UI after mutations
    Consider rate limiting: To prevent abuse of your server actions
```
Server Actions in Next.js provide a powerful way to handle server-side operations directly from your components, simplifying your application architecture and improving both performance and user experience.