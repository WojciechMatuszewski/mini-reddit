import { Fragment, Suspense } from "react";
import { CreatePost } from "../components/CreatePost";
import { getTRPCClient } from "../lib/trpc";
import { Posts } from "../components/Posts";

export default async function Page() {
  const initialPostsData = await getTRPCClient().getPosts.query({});

  return (
    <main className="max-w-md m-auto prose">
      <CreatePost />
      <Suspense fallback={<p>Loading...</p>}>
        <Posts initialData={initialPostsData} />
      </Suspense>
    </main>
  );
}
