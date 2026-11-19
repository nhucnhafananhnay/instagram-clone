import type { Post, User } from "@/types/index.type";

export const photos = [
  "https://images.unsplash.com/photo-1576565315529-dd151aeebb8d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1743485754066-f45e26489e9a?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1718942900361-d01a1ee8d077?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1557770401-dabe8321c0c5?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1574614366831-900f959788c9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1519805252437-e8c71d60435c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1736921591241-c40072d70b38?auto=format&fit=crop&w=900&q=85",
] as const;

export const users: User[] = [
  { user: "kimchi", name: "Kim Chi", img: photos[0] },
  { user: "ChibiChamp", name: "Hạnh Nguyễn", img: photos[5] },
  { user: "Thanhdora", name: "Thanh Dora", img: photos[2] },
  { user: "namphanhai2703", name: "Nam Phan", img: photos[4] },
  { user: "nam270303", name: "Nam Nguyễn", img: photos[6] },
];

export const currentUser: User = {
  user: "thachdaudai",
  name: "Thái Thị Liên Nga",
  img: photos[1],
};

export const feedPosts: Post[] = [
  {
    id: "hanoi-day",
    image: photos[3],
    user: "hoanganweb",
    caption: "Một ngày bình yên ở Hà Nội",
  },
  {
    id: "youth-memory",
    image: photos[5],
    user: "hanhnguyen",
    caption: "Cùng nhau lưu lại tuổi trẻ này nhé!",
  },
];
