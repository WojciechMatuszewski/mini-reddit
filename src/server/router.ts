import { PrismaClient } from "@prisma/client";
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
const prisma = new PrismaClient({ log: ["query"] });

const PAGE_SIZE = 20;

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
        take: PAGE_SIZE,
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
        where: {
          postId: input.postId,
          inReplyToId: null
        },
        take: 1
      }),
      prisma.comment.findMany({
        take: PAGE_SIZE,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { createdAt: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc"
        },
        where: {
          postId: input.postId,
          inReplyToId: null
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
      inReplyToId: z.string(),
      postId: z.string(),
      content: z.string(),
      author: z.string()
    })
  )
  .mutation(async ({ input }) => {
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          author: input.author,
          content: input.content,
          inReplyToId: input.inReplyToId,
          postId: input.postId
        }
      }),
      prisma.comment.update({
        where: {
          id: input.inReplyToId
        },
        data: {
          numberOfComments: {
            increment: 1
          }
        }
      })
    ]);

    return comment;
  });

const getCommentReplies = t.procedure
  .input(
    z.object({
      inReplyToId: z.string(),
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
        where: {
          postId: input.postId,
          inReplyToId: input.inReplyToId
        },
        take: 1
      }),
      prisma.comment.findMany({
        take: PAGE_SIZE,
        skip: input.cursor ? 1 : 0,
        cursor: input.cursor ? { createdAt: input.cursor } : undefined,
        orderBy: {
          createdAt: "desc"
        },
        where: {
          postId: input.postId,
          inReplyToId: input.inReplyToId
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

const upVotePost = t.procedure
  .input(
    z.object({
      id: z.string()
    })
  )
  .mutation(async ({ input }) => {
    return await prisma.comment.update({
      where: {
        id: input.id
      },
      data: {
        upVotes: {
          increment: 1
        }
      }
    });
  });

const downVotePost = t.procedure
  .input(
    z.object({
      id: z.string()
    })
  )
  .mutation(async ({ input }) => {
    return await prisma.comment.update({
      where: {
        id: input.id
      },
      data: {
        upVotes: {
          decrement: 1
        }
      }
    });
  });

export const appRouter = t.router({
  createPost,
  getPosts,
  getPost,
  commentPost,
  getPostComments,
  replyComment,
  getCommentReplies,
  upVotePost,
  downVotePost
});

export type AppRouter = typeof appRouter;
