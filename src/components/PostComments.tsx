"use client";

import { startTransition } from "react";
import { useGetPostComments } from "../lib/client";
import { Comment } from "./Comment";

export const PostComments = ({ postId }: { postId: string }) => {
  const { data, fetchNextPage, hasNextPage } = useGetPostComments({ postId });

  const comments = data.pages.flatMap((page) => page.items);
  console.log(comments);
  return (
    <section>
      <h2 className="font-semibold text-lg mb-2">Comments</h2>
      <ul className="grid grid-flow-row gap-2">
        {comments.map((comment) => {
          return (
            <li key={comment.id}>
              <Comment comment={comment} postId={postId} />
            </li>
          );
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
