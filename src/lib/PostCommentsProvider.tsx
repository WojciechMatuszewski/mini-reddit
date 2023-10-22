import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore
} from "react";

type Subscriber = (state: Map<string, boolean>) => void;

class ShowingRepliesStore {
  private state = new Map<string, boolean>();
  private subscribers = new Set<Subscriber>();

  constructor() {}

  public subscribe = (subscriber: Subscriber) => {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  public getSnapshot = () => {
    return this.state;
  };

  public setShowingReplies = ({
    commentId,
    showingReplies
  }: {
    commentId: string;
    showingReplies: boolean;
  }) => {
    this.state.set(commentId, showingReplies);

    this.subscribers.forEach((subscriber) => {
      subscriber(this.state);
    });
  };
}

const PostCommentsContext = createContext<ShowingRepliesStore | null>(null);

export const PostCommentsProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const store = useMemo(() => {
    return new ShowingRepliesStore();
  }, []);

  return (
    <PostCommentsContext.Provider value={store}>
      {children}
    </PostCommentsContext.Provider>
  );
};

export const useSetShowReplies = () => {
  const store = useContext(PostCommentsContext);
  if (!store) {
    throw new Error("Missing context");
  }

  return store.setShowingReplies;
};

export const useGetShowingReplies = ({ commentId }: { commentId: string }) => {
  const store = useContext(PostCommentsContext);
  if (!store) {
    throw new Error("Missing context");
  }

  // Not really a violation of hooks as the store is either defined or not defined.
  return useSyncExternalStore(store.subscribe, () => {
    return store.getSnapshot().get(commentId);
  });
};
