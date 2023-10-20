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
        <legend className="font-semibold text-lg">Create post</legend>

        <div className="flex flex-col">
          <label htmlFor={authorInputId}>Author</label>
          <input
            className="border bg-red-50"
            id={authorInputId}
            name="author"
            type="text"
            required={true}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={titleInputId}>Title</label>
          <input
            className="border bg-red-50"
            id={titleInputId}
            name="title"
            type="text"
            required={true}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor={contentInputId}>Content</label>
          <textarea
            className="border bg-red-50"
            id={contentInputId}
            name="content"
          />
        </div>

        <button className="border self-start p-2" type="submit">
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
