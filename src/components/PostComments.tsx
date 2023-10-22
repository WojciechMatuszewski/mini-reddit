"use client";

import { useTransition } from "react";
import { useGetPostComments } from "../lib/client";
import { Comment } from "./Comment";

export const PostComments = ({ postId }: { postId: string }) => {
  const { data, fetchNextPage, hasNextPage } = useGetPostComments({ postId });

  const comments = data.pages.flatMap((page) => page.items);
  return (
    <section>
      <h2 className="font-semibold text-3xl mb-2">Comments</h2>
      <ul className="grid grid-flow-row gap-3">
        {comments.map((comment) => {
          return <Comment key={comment.id} comment={comment} postId={postId} />;
        })}
      </ul>
      {hasNextPage ? <NextPageButton onClick={() => fetchNextPage()} /> : null}
    </section>
  );
};

const NextPageButton = ({ onClick }: { onClick: VoidFunction }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="btn btn-sm rounded-sm mt-4"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          onClick();
        });
      }}
    >
      Load more comments
    </button>
  );
};
