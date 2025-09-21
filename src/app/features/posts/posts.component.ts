import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  authorId: number;
  authorName: string;
  content: string;
  timestamp: string;
}

interface Post {
  id: number;
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

@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostManagementComponent {
  currentUser = {
    id: 1,
    name: 'John Doe',
    role: 'Employee' as 'Employee' | 'HR' | 'Admin'
  };

  newPostContent: string = '';
  posts: Post[] = [
    {
      id: 1,
      authorId: 2,
      authorName: 'Alice',
      authorRole: 'HR',
      timestamp: new Date().toISOString(),
      content: 'Welcome to the company! Please read all policies.',
      likes: 5,
      likedByMe: false,
      comments: [
        { authorId: 1, authorName: 'John Doe', content: 'Thanks!', timestamp: new Date().toISOString() }
      ]
    },
    {
      id: 2,
      authorId: 1,
      authorName: 'John Doe',
      authorRole: 'Employee',
      timestamp: new Date().toISOString(),
      content: 'Looking forward to our team outing next month!',
      likes: 3,
      likedByMe: true,
      comments: []
    }
  ];

  submitPost() {
    if (!this.newPostContent.trim()) return;
    const newPost: Post = {
      id: Date.now(),
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorRole: this.currentUser.role,
      timestamp: new Date().toISOString(),
      content: this.newPostContent,
      likes: 0,
      likedByMe: false,
      comments: []
    };
    this.posts.unshift(newPost);
    this.newPostContent = '';
  }

  canDelete(post: Post): boolean {
    return this.currentUser.role === 'HR' || this.currentUser.role === 'Admin' || post.authorId === this.currentUser.id;
  }

  deletePost(post: Post) {
    this.posts = this.posts.filter(p => p.id !== post.id);
  }

  toggleLike(post: Post) {
    post.likedByMe = !post.likedByMe;
    post.likes += post.likedByMe ? 1 : -1;
  }

  toggleCommentSection(post: Post) {
    post.showComments = !post.showComments;
  }

  addComment(post: Post) {
    if (!post.newComment?.trim()) return;
    post.comments.push({
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      content: post.newComment,
      timestamp: new Date().toISOString()
    });
    post.newComment = '';
  }
}
