import { PrismaClient } from "@prisma/client";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const prisma = new PrismaClient();

const createPost = t.procedure
  .input(
    z.object({
      title: z.string(),
      author: z.string(),
      content: z.string()
    })
  )
  .mutation(async ({ input }) => {
    const response = await prisma.post.create({
      data: {
        content: input.content,
        title: input.title,
        author: input.author
      }
    });

    return response;
  });

const getPosts = t.procedure
  .input(
    z.object({
      cursor: z.string().optional()
    })
  )
  .query(async ({ input }) => {
    const [[lastPost], paginatedPosts] = await prisma.$transaction([
      prisma.post.findMany({
        orderBy: {
          createdAt: "asc"
        },
        take: 1
      }),
      prisma.post.findMany({
        take: 10,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { createdAt: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc"
        }
      })
    ]);

    const lastPaginatedPost = paginatedPosts[paginatedPosts.length - 1];
    const hasNextPage = lastPost?.id !== lastPaginatedPost?.id;

    return {
      items: paginatedPosts,
      cursor: hasNextPage ? lastPaginatedPost?.createdAt : undefined
    };
  });

const getPost = t.procedure
  .input(
    z.object({
      id: z.string()
    })
  )
  .query(async ({ input }) => {
    const post = await prisma.post.findFirst({
      where: {
        id: {
          equals: input.id
        }
      }
    });

    return post;
  });

const commentPost = t.procedure
  .input(
    z.object({
      postId: z.string(),
      content: z.string(),
      author: z.string()
    })
  )
  .mutation(async ({ input }) => {
    const comment = await prisma.comment.create({
      data: {
        author: input.author,
        content: input.content,
        postId: input.postId
      }
    });

    return comment;
  });

const getPostComments = t.procedure
  .input(
    z.object({
      postId: z.string(),
      cursor: z.string().optional()
    })
  )
  .query(async ({ input }) => {
    const [[lastComment], paginatedComments] = await prisma.$transaction([
      prisma.comment.findMany({
        orderBy: {
          createdAt: "asc"
        },
        take: 1
      }),
      prisma.comment.findMany({
        take: 10,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { createdAt: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          replies: true
        }
      })
    ]);

    const lastPaginatedComment =
      paginatedComments[paginatedComments.length - 1];
    const hasNextPage = lastComment?.id !== lastPaginatedComment?.id;

    return {
      items: paginatedComments,
      cursor: hasNextPage ? lastPaginatedComment?.createdAt : undefined
    };
  });

const replyComment = t.procedure
  .input(
    z.object({
      commentId: z.string(),
      postId: z.string(),
      content: z.string(),
      author: z.string()
    })
  )
  .mutation(async ({ input }) => {
    console.log("before creating the reply");

    return await prisma.reply.create({
      data: {
        author: input.author,
        content: input.content,
        commentId: input.commentId
      }
    });
  });

const getReplies = t.procedure
  .input(
    z.object({
      replyId: z.string(),
      cursor: z.string()
    })
  )
  .query(async ({ input }) => {
    return {};
    // const [[lastReply], paginatedReplies] = await prisma.$transaction([
    //   prisma.reply.findMany({
    //     orderBy: {
    //       createdAt: "asc"
    //     },
    //     take: 1,
    //     where: {
    //       replyTo: {

    //       }
    //     }
    //   }),
    //   prisma.comment.findMany({
    //     take: 10,
    //     skip: input.cursor ? 1 : 0,
    //     cursor: input.cursor ? { createdAt: input.cursor } : undefined,
    //     orderBy: {
    //       createdAt: "desc"
    //     },
    //     include: {
    //       replies: true
    //     }
    //   })
    // ]);

    // const lastPaginatedComment =
    //   paginatedComments[paginatedComments.length - 1];
    // const hasNextPage = lastComment?.id !== lastPaginatedComment?.id;

    // return {
    //   items: paginatedComments,
    //   cursor: hasNextPage ? lastPaginatedComment?.createdAt : undefined
    // };
  });

export const appRouter = t.router({
  createPost,
  getPosts,
  getPost,
  commentPost,
  getPostComments,
  replyComment
});

export type AppRouter = typeof appRouter;
