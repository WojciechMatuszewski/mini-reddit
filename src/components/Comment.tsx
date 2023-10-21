import { Suspense, useReducer, useState } from "react";
import {
  CommentData,
  useGetCommentReplies,
  useReplyComment
} from "../lib/client";

import styles from "./Comment.module.css";

export const Comment = ({
  comment,
  postId
}: {
  comment: CommentData;
  postId: string;
}) => {
  const hasReplies = comment.numberOfComments > 0;
  return (
    <li className={styles["comment"]}>
      <div className={styles["wrapper"]}>
        <div className={styles["avatar"]} />
        <p className={styles["content"]}>{comment.content}</p>
        <div className={styles["controls"]}>
          <Controls postId={postId} commentId={comment.id} />
        </div>
      </div>
      {hasReplies ? (
        <div className={styles["replies"]}>
          <Replies comment={comment} postId={postId} />
        </div>
      ) : null}
    </li>
  );
};

const Controls = ({
  postId,
  commentId
}: {
  postId: string;
  commentId: string;
}) => {
  const { mutateAsync: replyComment } = useReplyComment();

  return (
    <button
      className="btn btn-xs rounded-md"
      onClick={() => {
        return replyComment({
          author: `${Math.random()}`,
          content: `${Math.random()}`,
          inReplyToId: commentId,
          postId: postId
        });
      }}
    >
      Reply
    </button>
  );
};

const Replies = ({
  comment,
  postId
}: {
  comment: CommentData;
  postId: string;
}) => {
  const [showReplies, toggleShowReplies] = useReducer((state) => !state, false);

  if (showReplies) {
    return (
      <Suspense fallback={<span>Loading...</span>}>
        <RepliesList commentId={comment.id} postId={postId} />
      </Suspense>
    );
  }

  return (
    <button
      className="btn btn-xs rounded-md btn-ghost"
      onClick={() => {
        toggleShowReplies();
      }}
    >
      {comment.numberOfComments} more replies
    </button>
  );
};

const RepliesList = ({
  commentId,
  postId
}: {
  commentId: string;
  postId: string;
}) => {
  const { data: comments } = useGetCommentReplies({
    inReplyToId: commentId,
    postId
  });

  const replies = comments.pages.flatMap((page) => page.items);
  return (
    <ul>
      {replies.map((reply) => {
        return <Comment key={reply.id} comment={reply} postId={postId} />;
      })}
    </ul>
  );
};
