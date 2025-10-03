import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { Post } from '../../core/models/post.model';



@Component({
  selector: 'app-post-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostManagementComponent implements OnInit {
  currentUser = {
    id: 1,
    name: 'John Doe',
    role: 'Employee' as 'Employee' | 'HR' | 'Admin'
  };

  newPostContent: string = '';
  posts: Post[] = [];

  constructor(private postService: PostService,private authService: AuthService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    const currentUserData: any = this.authService.getUserData()
    this.postService.getPosts(currentUserData.userId).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.posts = res.data
        }else{
          this.posts = []
        }
      },
      error: (err) => {
        console.error('Failed to load posts', err)
      }
    });
  }

  submitPost() {
    if (!this.newPostContent.trim()) return;
     const currentUserData: any = this.authService.getUserData()
    const newPost = {
      content: this.newPostContent,
      authorId: currentUserData?.userId || null
    };

    this.postService.createPost(newPost).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.loadPosts()
          this.newPostContent = '';
        }else{
          this.posts = []
        }
      },
      error: (err) => {
        this.posts = []
        console.error('Failed to create post', err)
      }
    });
  }

  canDelete(post: Post): boolean {
    const currentUserData: any = this.authService.getUserData()
    return this.authService.isAdminOrHR() || post.authorId === currentUserData.userId;
  }

  deletePost(post: Post) {
    this.postService.deletePost(post.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
      },
      error: (err) => console.error('Failed to delete post', err)
    });
  }

  toggleLike(post: Post) {
    const currentUserData: any = this.authService.getUserData()

      this.postService.likeOrUnlikePost({userId: currentUserData.userId ,postId: post.id  }).subscribe({
        next: (res) => {
          if(res.statusCode == 200){
            if(res.message == 'LIKE_REMOVED'){
              post.likedByMe = false;
              post.likes -= 1;
            }else if(res.message == 'LIKE_ADDED'){
              post.likedByMe = true;
              post.likes += 1;
            }else{

            }
          }else{

          }
        },
        error: (err) => {
          console.error('Failed to update reaction', err)
        }
      });
  }

  toggleCommentSection(post: Post) {
    post.showComments = !post.showComments;
  }

  addComment(post: Post) {
    if (!post.newComment?.trim()) return;

    const currentUserData: any = this.authService.getUserData()

    const newComment = {
      userId: currentUserData.userId,
      content: post.newComment,
      postId: post.id
    };

    this.postService.addComment(newComment).subscribe({
      next: (res) => {
        if(res.statusCode == 200){
          this.loadPosts()
          post.newComment = '';
        }else{

        }
      },
      error: (err) => console.error('Failed to add comment', err)
    });
  }
}
