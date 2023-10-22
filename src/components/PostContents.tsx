import { PostData } from "../lib/client";

export const PostContents = ({ post }: { post: NonNullable<PostData> }) => {
  return (
    <section>
      <h1 className="font-semibold text-4xl mb-2">{post.title}</h1>
      <p className="text-base whitespace-pre-wrap">{post.content}</p>
    </section>
  );
};
