"use client";

import { ElementRef, useId, useRef, useTransition } from "react";
import { useCommentPost, useCreatePost } from "../lib/client";

interface FormElements extends HTMLFormControlsCollection {
  author: HTMLInputElement;
  content: HTMLTextAreaElement;
}

interface CommentPostFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const CommentPost = ({ postId }: { postId: string }) => {
  const errorMessageRef = useRef<ElementRef<"div">>(null);
  const {
    mutateAsync: commentPost,
    isPending,
    isError
  } = useCommentPost({
    onError: () => {
      requestAnimationFrame(() => {
        errorMessageRef.current?.focus();
      });
    }
  });

  const handleOnSubmit: React.FormEventHandler<CommentPostFormElement> = async (
    event
  ) => {
    event.preventDefault();
    event.persist();

    const author = event.currentTarget.elements.author.value;
    const content = event.currentTarget.elements.content.value;

    await commentPost({
      author,
      content,
      postId
    });
  };

  const authorInputId = useId();
  const contentInputId = useId();

  return (
    <form onSubmit={handleOnSubmit}>
      <fieldset disabled={isPending}>
        <legend className="font-semibold text-xl">Comment post</legend>

        <div className="form-control">
          <label htmlFor={authorInputId} className="label">
            Author
          </label>
          <input
            className="input input-bordered w-full rounded-md input-sm"
            id={authorInputId}
            name="author"
            type="text"
            required={true}
          />
        </div>

        <div className="form-control">
          <label htmlFor={contentInputId} className="label">
            Comment
          </label>
          <textarea
            className="textarea textarea-bordered rounded-md input-sm"
            id={contentInputId}
            name="content"
          />
        </div>

        <button
          className="btn btn-neutral self-start rounded-md btn-sm mt-3"
          type="submit"
        >
          {isPending ? "Submitting..." : "Submit"}
        </button>

        <div
          ref={errorMessageRef}
          className="border-red-50 bg-red-100  flex gap-2 "
          tabIndex={isError ? 0 : -1}
          style={{ visibility: isError ? "visible" : "hidden" }}
          role="alert"
        >
          <div className="w-[5px] bg-red-300" />
          <span className="p-1">Failed to create the post</span>
        </div>
      </fieldset>
    </form>
  );
};
