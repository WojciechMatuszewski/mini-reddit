import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery
} from "@tanstack/react-query";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/router";
import { getTRPCClient } from "./trpc";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PostData = RouterOutputs["getPost"];
export type CommentData = RouterOutputs["getPostComments"]["items"][number];

export const useCreatePost = (options?: { onError: VoidFunction }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RouterInputs["createPost"]) => {
      return await getTRPCClient().createPost.mutate(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"]
      });
    },
    ...options
  });
};

export type PostPaginationData = RouterOutputs["getPosts"];

export const useGetPosts = (initialData: PostPaginationData) => {
  return useSuspenseInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      return getTRPCClient().getPosts.query({ cursor: pageParam });
    },
    queryKey: ["posts"],
    initialPageParam: initialData.cursor,
    getNextPageParam: (lastPage) => {
      return lastPage.cursor;
    },
    initialData: {
      pages: [initialData],
      pageParams: [initialData.cursor]
    }
  });
};

export const useGetPost = ({ id }: { id: string }) => {
  return useSuspenseQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      return getTRPCClient().getPost.query({ id });
    }
  });
};

export const useCommentPost = (options?: { onError: VoidFunction }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RouterInputs["commentPost"]) => {
      return await getTRPCClient().commentPost.mutate(payload);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", { postId: variables.postId }]
      });
    },
    ...options
  });
};

export type PostCommentPaginationData = RouterOutputs["getPostComments"];

export const useGetPostComments = ({ postId }: { postId: string }) => {
  return useSuspenseInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      return getTRPCClient().getPostComments.query({
        cursor: pageParam,
        postId
      });
    },
    queryKey: ["postComments", { postId }],
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.cursor;
    }
  });
};

export const useReplyComment = ({ onSuccess }: { onSuccess: VoidFunction }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RouterInputs["replyComment"]) => {
      return await getTRPCClient().replyComment.mutate(payload);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", { postId: variables.postId }]
      });

      /**
       * This is not very well optimized.
       * Ideally we would be able to have a granular cache updates.
       * Sadly, this is not really possible with tanstack-query.
       */
      queryClient.invalidateQueries({
        queryKey: [
          "commentReplies",
          {
            postId: variables.postId
          }
        ],
        exact: false
      });

      onSuccess();
    }
  });
};

export const useGetCommentReplies = ({
  inReplyToId,
  postId
}: {
  inReplyToId: string;
  postId: string;
}) => {
  return useSuspenseInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      return getTRPCClient().getCommentReplies.query({
        inReplyToId,
        postId,
        cursor: pageParam
      });
    },
    queryKey: [
      "commentReplies",
      {
        inReplyToId,
        postId
      }
    ],
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.cursor;
    }
  });
};

export const useUpVoteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; postId: string }) => {
      return await getTRPCClient().upVotePost.mutate({ id });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", { postId: variables.postId }]
      });

      queryClient.invalidateQueries({
        queryKey: ["commentReplies", { postId: variables.postId }],
        exact: false
      });
    }
  });
};

export const useDownVoteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; postId: string }) => {
      return await getTRPCClient().downVotePost.mutate({ id });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", { postId: variables.postId }]
      });

      queryClient.invalidateQueries({
        queryKey: ["commentReplies", { postId: variables.postId }],
        exact: false
      });
    }
  });
};
