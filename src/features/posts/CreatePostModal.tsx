import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Button, EmptyState, Icon, Modal, UserAvatar } from "@/components/ui";
import { CreatePostProvider, useCreatePost } from "@/contexts/CreatePostContext";
import { createPostSchema, type CreatePostFormValues } from "@/schemas/post.schema";
import { getMediaUrl } from "@/services/http/media-url";
import { createPost } from "@/services/posts/post.api";
import { useAuthStore } from "@/stores/use-auth-store";

interface CreatePostModalProps {
  close: () => void;
}

function CreatePostContent({ close }: CreatePostModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { state, dispatch } = useCreatePost();
  const [fileError, setFileError] = useState("");
  const [created, setCreated] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { caption: "" },
  });
  const caption = useWatch({ control, name: "caption" });
  const createMutation = useMutation({
    mutationFn: ({ file, caption }: { file: File; caption: string }) => createPost(file, caption),
    retry: false,
    onSuccess: () => {
      setCreated(true);
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["explore"] });
      void queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setTimeout(close, 900);
    },
  });

  useEffect(
    () => () => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    },
    [state.previewUrl],
  );

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setFileError("Vui lòng chọn một tệp ảnh hoặc video.");
      event.target.value = "";
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFileError("Ảnh hoặc video không được lớn hơn 50MB.");
      event.target.value = "";
      return;
    }

    setFileError("");
    dispatch({
      type: "file-selected",
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
      file,
    });
  }

  function handleCreatePost(data: CreatePostFormValues) {
    if (!state.file || createMutation.isPending) return;
    createMutation.mutate({ file: state.file, caption: data.caption });
  }

  return (
    <Modal title="Tạo bài viết mới" close={close} wide={!!state.previewUrl}>
      <form
        className={`create-body ${state.previewUrl ? "has-preview" : ""}`}
        onSubmit={handleSubmit(handleCreatePost)}
      >
        {state.previewUrl ? (
          <>
            <div className="upload-preview">
              {state.file?.type.startsWith("video/") ? (
                <video
                  src={state.previewUrl}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <img src={state.previewUrl} alt="Xem trước ảnh tải lên" />
              )}
            </div>
            <div className="caption-editor">
              {currentUser && (
                <div className="user-row">
                  <UserAvatar
                    src={getMediaUrl(currentUser.profilePicture)}
                    name={currentUser.fullName || currentUser.username}
                    size={44}
                  />
                  <div className="user-copy">
                    <strong>{currentUser.username}</strong>
                    <span>{currentUser.fullName}</span>
                  </div>
                </div>
              )}
              <textarea autoFocus placeholder="Viết chú thích..." {...register("caption")} />
              <div>
                <Icon name="smile" />
                <span>{caption.length}/2.200</span>
              </div>
              {errors.caption && <small className="field-error">{errors.caption.message}</small>}
              {createMutation.isError && (
                <small className="field-error">Không thể đăng bài. Vui lòng thử lại.</small>
              )}
              {created && <small className="auth-success">Đăng bài thành công.</small>}
              <Button type="submit" disabled={createMutation.isPending || created}>
                {createMutation.isPending ? "Đang chia sẻ..." : "Chia sẻ"}
              </Button>
            </div>
          </>
        ) : (
          <EmptyState
            icon="image"
            title="Kéo ảnh và video vào đây"
            text="Chia sẻ ảnh và video của bạn với mọi người."
            action="Chọn từ máy tính"
            onAction={openFilePicker}
          />
        )}
        {fileError && <small className="field-error">{fileError}</small>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleFileChange}
        />
      </form>
    </Modal>
  );
}

export function CreatePostModal(props: CreatePostModalProps) {
  return (
    <CreatePostProvider>
      <CreatePostContent {...props} />
    </CreatePostProvider>
  );
}
