import {
  ElementRef,
  Fragment,
  Suspense,
  useId,
  useReducer,
  useRef
} from "react";
import {
  CommentData,
  useDownVotePost,
  useGetCommentReplies,
  useReplyComment,
  useUpVotePost
} from "../lib/client";

import { ArrowDown, ArrowUp, MessageCircle, Plus, User } from "lucide-react";
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
        <div className="avatar placeholder bg-neutral-focus rounded-full h-12 w-12 flex items-center justify-center text-white">
          <User />
        </div>
        <p className={styles["content"]}>{comment.content}</p>
        <div className={styles["controls"]}>
          <Controls
            upVotes={<span className="tabular-nums">{comment.upVotes}</span>}
            postId={postId}
            comment={comment}
          />
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
  comment,
  upVotes
}: {
  postId: string;
  comment: CommentData;
  upVotes: React.ReactNode;
}) => {
  const { mutate: upVotePost } = useUpVotePost();
  const { mutate: downVotePost } = useDownVotePost();

  return (
    <div className="flex gap-1">
      <button
        className="btn rounded-md btn-xs btn-ghost p-0"
        onClick={() => {
          upVotePost({ id: comment.id, postId });
        }}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Up vote</span>
      </button>
      {upVotes}
      <button
        className="btn rounded-md btn-xs btn-ghost p-0"
        onClick={() => {
          downVotePost({ id: comment.id, postId });
        }}
      >
        <ArrowDown className="h-5 w-5" />
        <span className="sr-only">Down vote</span>
      </button>
      <Reply comment={comment} />
    </div>
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
      className="btn btn-xs rounded-md"
      onClick={() => {
        toggleShowReplies();
      }}
    >
      <Plus className="w-4 h-4" />
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
    <ul className="grid grid-flow-row gap-3">
      {replies.map((reply) => {
        return <Comment key={reply.id} comment={reply} postId={postId} />;
      })}
    </ul>
  );
};

const Reply = ({ comment }: { comment: CommentData }) => {
  const dialogRef = useRef<ElementRef<"dialog">>(null);
  const { mutateAsync: replyComment } = useReplyComment();

  const replyTextareaId = useId();

  return (
    <Fragment>
      <button
        onClick={() => {
          dialogRef.current?.showModal();
        }}
        className="btn btn-xs rounded-md btn-ghost"
      >
        <MessageCircle className="h-4 w-4" />
        Reply
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h2 className="font-bold text-lg">Reply to comment</h2>
          <div className="bg-base-100 grid grid-cols-[min-content_1fr] gap-2 min-h-8 items-center mt-4 rounded-md relative">
            <div className="h-[100%] w-2 bg-base-300 rounded-md" />
            <p className="py italic break-all p-2">{comment.content}</p>
          </div>
          <form method="dialog">
            <fieldset>
              <div className="form-control">
                <label htmlFor={replyTextareaId} className="label">
                  Reply
                </label>
                <textarea
                  id={replyTextareaId}
                  className="textarea textarea-bordered rounded-md textarea-md w-full"
                />
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost rounded-md">Close</button>
                <button className="btn rounded-md">Submit</button>
              </div>
            </fieldset>
          </form>
        </div>
      </dialog>
    </Fragment>
  );
};
