import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

interface CreatePostState {
  previewUrl: string | null;
  fileName: string | null;
  file: File | null;
}

type CreatePostAction =
  | { type: "file-selected"; previewUrl: string; fileName: string; file: File }
  | { type: "reset" };

interface CreatePostContextValue {
  state: CreatePostState;
  dispatch: Dispatch<CreatePostAction>;
}

const initialState: CreatePostState = { previewUrl: null, fileName: null, file: null };
const CreatePostContext = createContext<CreatePostContextValue | null>(null);

function createPostReducer(state: CreatePostState, action: CreatePostAction): CreatePostState {
  switch (action.type) {
    case "file-selected":
      return { previewUrl: action.previewUrl, fileName: action.fileName, file: action.file };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function CreatePostProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(createPostReducer, initialState);
  return (
    <CreatePostContext.Provider value={{ state, dispatch }}>{children}</CreatePostContext.Provider>
  );
}

export function useCreatePost() {
  const context = useContext(CreatePostContext);
  if (!context) throw new Error("useCreatePost must be used within CreatePostProvider");
  return context;
}
