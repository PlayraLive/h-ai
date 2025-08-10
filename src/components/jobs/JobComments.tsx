"use client";

import React, { useState, useEffect } from 'react';
import { UsersService } from '@/lib/appwrite/users';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreVertical,
  Edit,
  Trash2,
  Star
} from 'lucide-react';

interface Comment {
  $id: string;
  jobId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRating?: number;
  content: string;
  type: 'suggestion' | 'comment' | 'feedback';
  parentId?: string;
  likes: number;
  dislikes: number;
  $createdAt: string;
  $updatedAt: string;
}

interface JobCommentsProps {
  jobId: string;
  className?: string;
}

export default function JobComments({ jobId, className = '' }: JobCommentsProps) {
  const { user } = useAuthContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion'>('comment');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Load comments
  useEffect(() => {
    loadComments();
  }, [jobId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        const base: Comment[] = data.comments;
        // Enrich with user rating
        const uniqueUserIds = Array.from(new Set(base.map((c: Comment) => c.userId)));
        const idToRating: Record<string, number> = {};
        await Promise.all(uniqueUserIds.map(async (uid) => {
          try {
            const profile = await UsersService.getUserProfile(uid);
            if (profile && typeof profile.rating === 'number') {
              idToRating[uid] = profile.rating;
            }
          } catch {}
        }));
        const enriched = base.map((c) => ({ ...c, userRating: idToRating[c.userId] }));
        setComments(enriched);
      } else {
        // Fallback to mock data if API fails
        setComments([
          {
            $id: 'comment-1',
            jobId,
            userId: 'user1',
            userName: 'Александр К.',
            content: 'Отличная идея! Предлагаю добавить еще несколько функций для улучшения UX.',
            type: 'suggestion',
            likes: 3,
            dislikes: 0,
            $createdAt: new Date(Date.now() - 3600000).toISOString(),
            $updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            $id: 'comment-2',
            jobId,
            userId: 'user2',
            userName: 'Мария Д.',
            content: 'Согласна с предыдущим комментарием. Это действительно улучшит проект.',
            type: 'comment',
            parentId: 'comment-1',
            likes: 1,
            dislikes: 0,
            $createdAt: new Date(Date.now() - 1800000).toISOString(),
            $updatedAt: new Date(Date.now() - 1800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to mock data
      setComments([
        {
          $id: 'comment-1',
          jobId,
          userId: 'user1',
          userName: 'Александр К.',
          content: 'Отличная идея! Предлагаю добавить еще несколько функций для улучшения UX.',
          type: 'suggestion',
          likes: 3,
          dislikes: 0,
          $createdAt: new Date(Date.now() - 3600000).toISOString(),
          $updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const commentData = {
        jobId,
        userId: user.$id,
        userName: user.name || 'Аноним',
        userAvatar: user.avatar,
        content: newComment.trim(),
        type: commentType,
        parentId: replyingTo
      };

      const response = await fetch(`/api/jobs/${jobId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });

      const result = await response.json();

      if (result.success) {
        setComments(prev => [result.comment, ...prev]);
        setNewComment('');
        setCommentType('comment');
        setReplyingTo(null);
      } else {
        throw new Error(result.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Не удалось отправить комментарий. Попробуйте еще раз.');
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const replyData = {
        jobId,
        userId: user.$id,
        userName: user.name || 'Аноним',
        userAvatar: user.avatar,
        content: replyContent.trim(),
        type: 'comment' as const,
        parentId: commentId
      };

      const response = await fetch(`/api/jobs/${jobId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      });

      const result = await response.json();

      if (result.success) {
        setComments(prev => [result.comment, ...prev]);
        setReplyContent('');
        setReplyingTo(null);
      } else {
        throw new Error(result.error || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Не удалось отправить ответ. Попробуйте еще раз.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      return;
    }

    setDeletingComment(commentId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/comments?commentId=${commentId}&userId=${user.$id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setComments(prev => prev.filter(comment => comment.$id !== commentId));
      } else {
        throw new Error(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Не удалось удалить комментарий. Попробуйте еще раз.');
    } finally {
      setDeletingComment(null);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !editingContent.trim()) return;
    try {
      const response = await fetch(`/api/jobs/${jobId}/comments?commentId=${commentId}&userId=${user.$id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingContent.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setComments(prev => prev.map(c => c.$id === commentId ? { ...c, content: editingContent, $updatedAt: new Date().toISOString() } : c));
        setEditingCommentId(null);
        setEditingContent('');
      } else {
        throw new Error(result.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Не удалось обновить комментарий. Попробуйте еще раз.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = comments.filter(c => c.parentId === comment.$id);
    
    return (
      <div key={comment.$id} className={cn(
        "space-y-3",
        isReply && "ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
      )}>
        <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {comment.userAvatar ? (
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-bold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
                <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {comment.userName}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(comment.$createdAt)}</span>
                    {typeof comment.userRating === 'number' && (
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{comment.userRating.toFixed(1)}</span>
                      </span>
                    )}
                  {comment.type === 'suggestion' && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                      Предложение
                    </span>
                  )}
                </div>
              </div>
            </div>
            {user && comment.userId === user.$id && (
              <div className="relative group">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => { setEditingCommentId(comment.$id); setEditingContent(comment.content); }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.$id)}
                    disabled={deletingComment === comment.$id}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>
                      {deletingComment === comment.$id ? 'Удаление...' : 'Удалить'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {editingCommentId === comment.$id ? (
            <div className="space-y-2">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              <div className="flex items-center justify-end space-x-2">
                <button onClick={() => { setEditingCommentId(null); setEditingContent(''); }} className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Отмена</button>
                <button onClick={() => handleEditComment(comment.$id)} disabled={!editingContent.trim()} className={cn("px-3 py-1 text-sm rounded-lg transition-all", editingContent.trim() ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed")}>Сохранить</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
              {comment.content}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{comment.likes}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs">{comment.dislikes}</span>
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === comment.$id ? null : comment.$id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Reply className="w-4 h-4" />
                <span className="text-xs">Ответить</span>
              </button>
            </div>
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.$id && (
            <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Напишите ответ..."
                rows={2}
                className="w-full px-3 py-2 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Отмена
                </button>
                <button
                  onClick={() => handleReply(comment.$id)}
                  disabled={!replyContent.trim()}
                  className={cn(
                    "px-3 py-1 text-sm rounded-lg transition-all",
                    replyContent.trim()
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Ответить
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-3">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Комментарии и предложения
        </h3>
      </div>

      {/* Comment Form */}
      <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200/30 dark:border-gray-700/30">
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => setCommentType('comment')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all",
              commentType === 'comment'
                ? "bg-purple-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}
          >
            Комментарий
          </button>
          <button
            onClick={() => setCommentType('suggestion')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-all",
              commentType === 'suggestion'
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}
          >
            Предложение
          </button>
        </div>
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={commentType === 'suggestion' ? "Предложите улучшения для проекта..." : "Напишите комментарий..."}
          rows={3}
          className="w-full px-4 py-3 bg-gray-100/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
        />
        
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2",
              newComment.trim()
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-200/50 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            <span>Отправить</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Загрузка комментариев...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.filter(comment => !comment.parentId).map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Пока нет комментариев. Будьте первым!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
