"use client";

import { ElementRef, useId, useRef, useTransition } from "react";
import { useCreatePost } from "../lib/client";

interface FormElements extends HTMLFormControlsCollection {
  author: HTMLInputElement;
  title: HTMLInputElement;
  content: HTMLTextAreaElement;
}

interface PostFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const CreatePost = () => {
  const errorMessageRef = useRef<ElementRef<"div">>(null);
  const {
    mutateAsync: createPost,
    isPending,
    isError
  } = useCreatePost({
    onError: () => {
      requestAnimationFrame(() => {
        errorMessageRef.current?.focus();
      });
    }
  });

  const handleOnSubmit: React.FormEventHandler<PostFormElement> = async (
    event
  ) => {
    event.preventDefault();
    event.persist();

    const author = event.currentTarget.elements.author.value;
    const title = event.currentTarget.elements.title.value;
    const content = event.currentTarget.elements.content.value;

    await createPost({
      author,
      content,
      title
    });

    // Why is the current target not available here?
    // https://github.com/github/eslint-plugin-github/blob/main/docs/rules/async-currenttarget.md
  };

  const authorInputId = useId();
  const contentInputId = useId();
  const titleInputId = useId();

  return (
    <form onSubmit={handleOnSubmit}>
      <fieldset disabled={isPending} className="flex flex-col gap-3">
        <legend className="font-semibold text-4xl">Create post</legend>

        <div className="form-group">
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

        <div className="form-group">
          <label htmlFor={titleInputId} className="label">
            Title
          </label>
          <input
            className="input input-bordered w-full rounded-md input-md"
            id={titleInputId}
            name="title"
            type="text"
            required={true}
          />
        </div>

        <div className="form-group">
          <label htmlFor={contentInputId} className="label">
            Content
          </label>
          <textarea
            className="textarea textarea-bordered rounded-md textarea-md w-full"
            id={contentInputId}
            name="content"
          />
        </div>

        <button className="btn btn-neutral self-start rounded-md" type="submit">
          {isPending ? "Submitting..." : "Create post"}
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
