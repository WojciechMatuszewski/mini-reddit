import { Suspense } from "react";
import { CreatePostForm } from "../components/CreatePostForm";
import { Posts } from "../components/Posts";
import { getTRPCClient } from "../lib/trpc";

export default async function Page() {
  const initialPostsData = await getTRPCClient().getPosts.query({});

  return (
    <main className="max-w-md m-auto prose">
      <CreatePostForm />
      <Suspense fallback={<p>Loading...</p>}>
        <Posts initialData={initialPostsData} />
      </Suspense>
    </main>
  );
}
