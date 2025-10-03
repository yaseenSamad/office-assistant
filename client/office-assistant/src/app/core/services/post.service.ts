import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}

  // ----- POSTS -----
  getPosts(userId: string): Observable<any> {
    return this.http.get(`/api/posts/${userId}`).pipe(map(res => res));
  }

  createPost(data: any): Observable<any> {
    return this.http.post('/api/posts', data).pipe(map(res => res));
  }

  updatePost(postId: string, data: any): Observable<any> {
    return this.http.patch(`/api/posts/${postId}`, data).pipe(map(res => res));
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(`/api/posts/${postId}`).pipe(map(res => res));
  }

  // ----- LIKES -----
  likeOrUnlikePost(data: any): Observable<any> {
    return this.http.post(`/api/posts/like`, data).pipe(map(res => res));
  }



  // ----- COMMENTS -----
  getComments(postId: string): Observable<any> {
    return this.http.get(`/api/posts/${postId}/comments`).pipe(map(res => res));
  }

  addComment( data: any): Observable<any> {
    return this.http.post(`/api/posts/comment`, data).pipe(map(res => res));
  }

  updateComment(commentId: string, data: any): Observable<any> {
    return this.http.patch(`/api/comments/${commentId}`, data).pipe(map(res => res));
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete(`/api/comments/${commentId}`).pipe(map(res => res));
  }
}
