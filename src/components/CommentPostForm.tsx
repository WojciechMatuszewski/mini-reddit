"use client";

import { ElementRef, useId, useRef } from "react";
import { useCommentPost } from "../lib/client";

interface FormElements extends HTMLFormControlsCollection {
  author: HTMLInputElement;
  content: HTMLTextAreaElement;
}

interface CommentPostFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const CommentPostForm = ({ postId }: { postId: string }) => {
  const errorMessageRef = useRef<ElementRef<"div">>(null);
  const {
    mutate: commentPost,
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

    commentPost({
      author,
      content,
      postId
    });

    event.currentTarget.reset();
  };

  const authorInputId = useId();
  const contentInputId = useId();

  return (
    <form onSubmit={handleOnSubmit}>
      <fieldset disabled={isPending}>
        <legend className="font-semibold text-2xl">Comment post</legend>

        <div className="form-control">
          <label htmlFor={authorInputId} className="label">
            Author
          </label>
          <input
            className="input input-bordered w-full rounded-md input-md"
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
            className="textarea textarea-bordered rounded-md textarea-md"
            id={contentInputId}
            name="content"
          />
        </div>

        <button
          className="btn btn-neutral self-start rounded-md btn-md mt-4"
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
