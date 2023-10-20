"use client";

import Link from "next/link";
import { startTransition } from "react";
import { PostData, PostPaginationData, useGetPosts } from "../lib/client";

export const Posts = ({ initialData }: { initialData: PostPaginationData }) => {
  const { data, fetchNextPage, hasNextPage } = useGetPosts(initialData);

  const posts = data.pages.flatMap((page) => page.items);
  return (
    <section>
      <h1 className="font-semibold text-lg mb-2">Posts</h1>
      <ul className="grid grid-flow-row gap-2">
        {posts.map((post) => {
          return <Post post={post} key={post.id} />;
        })}
      </ul>
      <button
        className="mt-2 border p-2 disabled:bg-gray-400"
        disabled={!hasNextPage}
        onClick={() => {
          startTransition(() => {
            fetchNextPage();
          });
        }}
      >
        Next page
      </button>
    </section>
  );
};

function Post({ post }: { post: NonNullable<PostData> }) {
  return (
    <li>
      <Link className="text-blue-500 underline" href={`/post/${post.id}`}>
        {post.title}
      </Link>
    </li>
  );
}
