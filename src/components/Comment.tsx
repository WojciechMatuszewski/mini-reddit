import {
  ElementRef,
  FormEventHandler,
  Fragment,
  Suspense,
  startTransition,
  useId,
  useRef
} from "react";
import {
  CommentData,
  useDownVoteComment,
  useGetCommentReplies,
  useReplyComment,
  useUpVoteComment
} from "../lib/client";

import { ArrowDown, ArrowUp, MessageCircle, User } from "lucide-react";
import {
  useGetShowingReplies,
  useSetShowReplies
} from "../lib/PostCommentsProvider";
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
      <div className="grid grid-cols-[[avatar]_min-content_[content]_1fr] gap-3">
        <div className="avatar placeholder col-[avatar] bg-neutral-focus rounded-full h-12 w-12 flex items-center justify-center text-white">
          <User />
        </div>

        <div>
          <span className="font-semibold text-lg self-start break-all">
            {comment.author}
          </span>

          <p className={"break-all"}>{comment.content}</p>

          <div className="mt-2 -mx-1">
            <Controls
              upVotes={<span className="tabular-nums">{comment.upVotes}</span>}
              postId={postId}
              comment={comment}
            />
          </div>
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

const Replies = ({
  comment,
  postId
}: {
  comment: CommentData;
  postId: string;
}) => {
  const setShowReplies = useSetShowReplies();
  const isShowingReplies = useGetShowingReplies({ commentId: comment.id });

  if (isShowingReplies) {
    return (
      <Suspense
        fallback={<span className={"btn btn-xs rounded-md"}>Loading...</span>}
      >
        <RepliesList commentId={comment.id} postId={postId} />
      </Suspense>
    );
  }

  return (
    <button
      className="btn btn-xs rounded-md"
      onClick={() => {
        setShowReplies({ commentId: comment.id, showingReplies: true });
      }}
    >
      Load more replies
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
  const {
    data: comments,
    fetchNextPage,
    hasNextPage
  } = useGetCommentReplies({
    inReplyToId: commentId,
    postId
  });

  const replies = comments.pages.flatMap((page) => page.items);
  return (
    <Fragment>
      <ul className="grid grid-flow-row gap-3">
        {replies.map((reply) => {
          return <Comment key={reply.id} comment={reply} postId={postId} />;
        })}
      </ul>
      {hasNextPage ? (
        <button
          className="btn btn-xs rounded-md mt-3"
          onClick={() => {
            startTransition(() => {
              fetchNextPage();
            });
          }}
        >
          Load more replies
        </button>
      ) : null}
    </Fragment>
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
  return (
    <div className="flex gap-1">
      <UpVoteComment commentId={comment.id} postId={postId} />
      {upVotes}
      <DownVoteComment commentId={comment.id} postId={postId} />
      <ReplyToComment comment={comment} postId={postId} />
    </div>
  );
};

interface FormElements extends HTMLFormControlsCollection {
  author: HTMLInputElement;
  content: HTMLTextAreaElement;
}

interface ReplyToCommentFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const ReplyToComment = ({
  comment,
  postId
}: {
  comment: CommentData;
  postId: string;
}) => {
  const dialogRef = useRef<ElementRef<"dialog">>(null);
  const setShowingReplies = useSetShowReplies();

  const { mutate: replyComment } = useReplyComment({
    onSuccess: () => {
      dialogRef.current?.close();
      setShowingReplies({ commentId: comment.id, showingReplies: true });
    }
  });

  const replyAuthorId = useId();
  const replyContentId = useId();

  const handleOnSubmit: FormEventHandler<ReplyToCommentFormElement> = (
    event
  ) => {
    event.preventDefault();
    const authorValue = event.currentTarget.elements.author.value;
    const contentValue = event.currentTarget.elements.content.value;

    replyComment({
      author: authorValue,
      content: contentValue,
      inReplyToId: comment.id,
      postId: postId
    });

    event.currentTarget.reset();
  };

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
          <form onSubmit={handleOnSubmit}>
            <fieldset>
              <div className="form-control">
                <label className="label" htmlFor={replyAuthorId}>
                  Author
                </label>
                <input
                  autoFocus={true}
                  name="author"
                  id={replyAuthorId}
                  type="text"
                  className="input input-bordered rounded-md input-md"
                />
              </div>
              <div className="form-control">
                <label htmlFor={replyContentId} className="label">
                  Reply
                </label>
                <textarea
                  name="content"
                  id={replyContentId}
                  className="textarea textarea-bordered rounded-md textarea-md w-full"
                />
              </div>
              <div className="modal-action flex-row-reverse justify-start">
                <button className="btn rounded-md btn-neutral">Submit</button>
                <button className="btn btn-ghost rounded-md">Close</button>
              </div>
            </fieldset>
          </form>
        </div>
      </dialog>
    </Fragment>
  );
};

function UpVoteComment({
  commentId,
  postId
}: {
  commentId: string;
  postId: string;
}) {
  const { mutate: upVoteComment } = useUpVoteComment();

  return (
    <button
      className="btn rounded-md btn-xs btn-ghost p-0"
      onClick={() => {
        upVoteComment({
          id: commentId,
          postId
        });
      }}
    >
      <ArrowUp className="h-5 w-5" />
      <span className="sr-only">Up vote</span>
    </button>
  );
}

function DownVoteComment({
  commentId,
  postId
}: {
  commentId: string;
  postId: string;
}) {
  const { mutate: downVoteComment } = useDownVoteComment();

  return (
    <button
      className="btn rounded-md btn-xs btn-ghost p-0"
      onClick={() => {
        downVoteComment({
          id: commentId,
          postId
        });
      }}
    >
      <ArrowDown className="h-5 w-5" />
      <span className="sr-only">Down vote</span>
    </button>
  );
}
