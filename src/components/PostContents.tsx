import { PostData } from "../lib/client";

export const PostContents = ({ post }: { post: NonNullable<PostData> }) => {
  return (
    <section>
      <h1 className="font-semibold text-lg mb-2">{post.title}</h1>
      <p className="text-base">{post.content}</p>
    </section>
  );
};
