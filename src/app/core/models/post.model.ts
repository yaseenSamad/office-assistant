export interface Post {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface CreatePostDto {
  content: string;
}

export interface CreateCommentDto {
  content: string;
}