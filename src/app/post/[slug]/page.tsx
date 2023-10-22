import { Suspense } from "react";
import { CommentPostForm } from "../../../components/CommentPostForm";
import { PostContents } from "../../../components/PostContents";
import { getTRPCClient } from "../../../lib/trpc";
import { PostComments } from "../../../components/PostComments";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <article className="max-w-xl m-auto">
      <nav>
        <Link
          href="/"
          className={
            "underline text-blue-500 mb-2 text-md flex items-center gap-1"
          }
        >
          <ArrowLeft className={"w-5 h-5"} />
          <span>Go back</span>
        </Link>
      </nav>
      <PostContents post={post} />
      <div className="divider" />
      <CommentPostForm postId={post.id} />
      <Suspense fallback={<span>Loading comments...</span>}>
        <PostComments postId={post.id} />
      </Suspense>
    </article>
  );
}
