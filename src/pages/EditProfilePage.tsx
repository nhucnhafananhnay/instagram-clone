import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Button, EmptyState, InputField, UserAvatar } from "@/components/ui";
import { editProfileSchema, type EditProfileFormValues } from "@/schemas/profile.schema";
import { getMediaUrl } from "@/services/http/media-url";
import {
  deleteProfilePicture,
  getMyProfile,
  updateProfile,
} from "@/services/users/user.api";
import type { EditProfileRequest, UserProfile } from "@/services/users/user.types";
import { useAuthStore } from "@/stores/use-auth-store";

export default function EditProfilePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [profilePicture, setProfilePicture] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: "", bio: "", website: "", gender: "other" },
  });
  const fullName = useWatch({ control, name: "fullName" });
  const bio = useWatch({ control, name: "bio" });

  function syncProfile(profile: UserProfile) {
    void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    void queryClient.invalidateQueries({ queryKey: ["user-profile", profile._id] });
    void queryClient.invalidateQueries({ queryKey: ["feed"] });
    void queryClient.invalidateQueries({ queryKey: ["explore"] });
    void queryClient.invalidateQueries({ queryKey: ["post"] });
    void queryClient.invalidateQueries({ queryKey: ["comments"] });
    void queryClient.invalidateQueries({ queryKey: ["user-search"] });
    void queryClient.invalidateQueries({ queryKey: ["search-history"] });
    void queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
    void queryClient.invalidateQueries({ queryKey: ["follow-list"] });

    if (session) {
      setSession({ ...session, user: { ...session.user, ...profile } });
    }
  }

  const updateMutation = useMutation({
    mutationFn: (data: Partial<EditProfileRequest>) => updateProfile(data),
    retry: false,
    onSuccess: (profile) => {
      syncProfile(profile);
      setProfilePicture(undefined);
      setPreviewUrl("");
      setSaved(true);
    },
  });

  const deletePictureMutation = useMutation({
    mutationFn: deleteProfilePicture,
    retry: false,
    onSuccess: () => {
      if (profileQuery.data) {
        syncProfile({ ...profileQuery.data, profilePicture: null });
      }
      setProfilePicture(undefined);
      setPreviewUrl("");
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    reset({
      fullName: profile.fullName,
      bio: profile.bio ?? "",
      website: profile.website ?? "",
      gender: profile.gender ?? "other",
    });
  }, [profileQuery.data, reset]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPictureError("Vui lòng chọn một tệp hình ảnh.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPictureError("Ảnh đại diện không được lớn hơn 5MB.");
      event.target.value = "";
      return;
    }

    setPictureError("");
    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSaved(false);
  }

  function handleSaveProfile(data: EditProfileFormValues) {
    const current = profileQuery.data;
    if (!current || updateMutation.isPending) return;

    const changes: Partial<EditProfileRequest> = {};
    if (data.fullName !== current.fullName) changes.fullName = data.fullName;
    if (data.bio !== (current.bio ?? "")) changes.bio = data.bio;
    if (data.website !== (current.website ?? "")) changes.website = data.website;
    if (data.gender !== (current.gender ?? "other")) changes.gender = data.gender;
    if (profilePicture) changes.profilePicture = profilePicture;

    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }

    updateMutation.mutate(changes);
  }

  function handleDeletePicture() {
    if (
      profileQuery.data?.profilePicture &&
      window.confirm("Bạn có chắc muốn xóa ảnh đại diện?")
    ) {
      deletePictureMutation.mutate();
    }
  }

  if (profileQuery.isPending) {
    return (
      <main className="edit-page">
        <p className="copyright">Đang tải trang cá nhân...</p>
      </main>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <main className="edit-page">
        <EmptyState
          icon="user"
          title="Không thể tải trang cá nhân"
          text="Vui lòng thử lại sau."
        />
      </main>
    );
  }

  const profile = profileQuery.data;

  return (
    <main className="edit-page">
      <h1>Chỉnh sửa trang cá nhân</h1>
      <form className="edit-card" onSubmit={handleSubmit(handleSaveProfile)}>
        <div className="edit-user">
          <UserAvatar
            size={58}
            src={previewUrl || getMediaUrl(profile.profilePicture)}
            name={fullName || profile.username}
          />
          <div>
            <strong>{profile.username}</strong>
            <span>{fullName}</span>
          </div>
          <Button onClick={() => inputRef.current?.click()}>Đổi ảnh</Button>
          {profile.profilePicture && (
            <button
              type="button"
              className="text-action"
              onClick={handleDeletePicture}
              disabled={deletePictureMutation.isPending}
            >
              {deletePictureMutation.isPending ? "Đang xóa..." : "Xóa ảnh"}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </div>
        <label>
          Họ tên
          <InputField
            placeholder="Họ tên"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
        </label>
        <label>
          Tiểu sử
          <textarea maxLength={150} {...register("bio")} />
          <small>{bio.length} / 150</small>
          {errors.bio && <small className="field-error">{errors.bio.message}</small>}
        </label>
        <label>
          Trang web
          <InputField
            placeholder="Trang web"
            error={errors.website?.message}
            {...register("website")}
          />
        </label>
        <label>
          Giới tính
          <select {...register("gender")}>
            <option value="female">Nữ</option>
            <option value="male">Nam</option>
            <option value="other">Không muốn tiết lộ</option>
          </select>
        </label>
        {(updateMutation.isError || deletePictureMutation.isError) && (
          <small className="field-error">Không thể cập nhật trang cá nhân.</small>
        )}
        {pictureError && <small className="field-error">{pictureError}</small>}
        {saved && <small className="auth-success">Đã lưu thay đổi.</small>}
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </main>
  );
}
