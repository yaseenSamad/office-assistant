export interface Comment {
  commentId?: string;
  authorId: number;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: number;
  authorName: string;
  authorRole: 'Employee' | 'HR' | 'Admin';
  timestamp: string;
  content: string;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  showComments?: boolean;
  newComment?: string;
}