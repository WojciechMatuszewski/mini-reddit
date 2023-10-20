import { Fragment } from "react";
import { CommentData, useReplyComment } from "../lib/client";

export const Comment = ({
  comment,
  postId
}: {
  comment: CommentData;
  postId: string;
}) => {
  const { mutateAsync: replyComment } = useReplyComment();

  return (
    <Fragment>
      <div className="flex flex-col gap-1">
        <p>{comment.content}</p>
        <div>
          <button
            className="border p-1 text-xs"
            onClick={() => {
              return replyComment({
                author: `${Math.random()}`,
                commentId: comment.id,
                content: `${Math.random()}`,
                postId
              });
            }}
          >
            Reply
          </button>
        </div>
        {comment.replies ? <Replies /> : null}
      </div>
    </Fragment>
  );
};

const Replies = ({ replies }: { replies: "" }) => {
  return <div>Replies</div>;
};
