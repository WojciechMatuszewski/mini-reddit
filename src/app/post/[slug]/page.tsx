import { Suspense } from "react";
import { CommentPostForm } from "../../../components/CommentPostForm";
import { PostContents } from "../../../components/PostContents";
import { getTRPCClient } from "../../../lib/trpc";
import { PostComments } from "../../../components/PostComments";

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getTRPCClient().getPost.query({ id: params.slug });

  if (!post) {
    return (
      <section>
        <h1>Post not found</h1>
      </section>
    );
  }

  return (
    <article className="max-w-sm m-auto">
      <PostContents post={post} />
      <div className="divider" />
      <CommentPostForm postId={post.id} />
      <Suspense fallback={<span>Loading comments...</span>}>
        <PostComments postId={post.id} />
      </Suspense>
    </article>
  );
}
