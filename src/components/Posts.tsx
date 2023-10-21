"use client";

import Link from "next/link";
import { useTransition } from "react";
import { PostData, PostPaginationData, useGetPosts } from "../lib/client";

export const Posts = ({ initialData }: { initialData: PostPaginationData }) => {
  const { data, fetchNextPage, hasNextPage } = useGetPosts(initialData);

  const posts = data.pages.flatMap((page) => page.items);
  return (
    <section>
      <h1 className="font-semibold text-4xl mb-2">Posts</h1>
      <ul className="grid gap-2 list-none m-0 p-0">
        {posts.map((post) => {
          return <Post post={post} key={post.id} />;
        })}
      </ul>
      {hasNextPage ? <NextPageButton onClick={() => fetchNextPage()} /> : null}
    </section>
  );
};

function Post({ post }: { post: NonNullable<PostData> }) {
  return (
    <li>
      <Link className="text-blue-500" href={`/post/${post.id}`}>
        {post.title}
      </Link>
    </li>
  );
}

const NextPageButton = ({ onClick }: { onClick: VoidFunction }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="mt-2 border p-2 disabled:bg-gray-400"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
    >
      Next page
    </button>
  );
};
