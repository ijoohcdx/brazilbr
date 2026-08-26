import React, { useEffect, useState } from 'react';
import { ExternalLink, FilePlus2, Heart, Loader2, MapPin, MessageCircle, Send, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addPostComment, listFeedPosts, listPostComments, createPost, togglePostReaction } from '../firebase/posts';
import type { Post, PostComment } from '../types';

interface FeedScreenProps {
  onNavigate?: (path: string) => void;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

export const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commentSaving, setCommentSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await listFeedPosts());
    } catch (loadError) {
      console.error('Could not load feed:', loadError);
      setError('The feed is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const publish = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const post = await createPost(
        user.uid,
        userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'BrazilBR member',
        userProfile?.photoURL || user.photoURL || null,
        content,
        userProfile?.currentCity || '',
        'public',
        link.trim() || null,
      );
      setPosts((current) => [post, ...current]);
      setContent('');
      setLink('');
    } catch (publishError) {
      console.error('Could not publish post:', publishError);
      setError('We could not publish your post yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reactToPost = async (post: Post) => {
    if (!user) return;
    const wasLiked = likedPosts[post.id] === true;
    setLikedPosts((current) => ({ ...current, [post.id]: !wasLiked }));
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, reactionCount: Math.max(0, item.reactionCount + (wasLiked ? -1 : 1)) } : item));
    try {
      const liked = await togglePostReaction(post.id, user.uid);
      setLikedPosts((current) => ({ ...current, [post.id]: liked }));
    } catch (reactionError) {
      console.error('Could not react to post:', reactionError);
      setLikedPosts((current) => ({ ...current, [post.id]: wasLiked }));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, reactionCount: post.reactionCount } : item));
      setError('We could not save that reaction yet. Please try again.');
    }
  };

  const toggleComments = async (postId: string) => {
    const nextOpen = !openComments[postId];
    setOpenComments((current) => ({ ...current, [postId]: nextOpen }));
    if (nextOpen && !comments[postId]) {
      try {
        const loadedComments = await listPostComments(postId);
        setComments((current) => ({ ...current, [postId]: loadedComments }));
      } catch (commentError) {
        console.error('Could not load comments:', commentError);
        setError('Comments are unavailable right now. Please try again.');
      }
    }
  };

  const submitComment = async (post: Post) => {
    if (!user || !commentDrafts[post.id]?.trim()) return;
    setCommentSaving(post.id);
    try {
      const comment = await addPostComment(post.id, user.uid, userProfile?.displayName || user.displayName || 'BrazilBR member', commentDrafts[post.id]);
      setComments((current) => ({ ...current, [post.id]: [comment, ...(current[post.id] || [])] }));
      setCommentDrafts((current) => ({ ...current, [post.id]: '' }));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, commentCount: item.commentCount + 1 } : item));
    } catch (commentError) {
      console.error('Could not publish comment:', commentError);
      setError('We could not add your comment yet. Please try again.');
    } finally {
      setCommentSaving(null);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || 'BrazilBR member';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between"><div><div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700"><Sparkles className="h-3.5 w-3.5" />Community feed</div><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">What is happening?</h2></div><button type="button" onClick={() => onNavigate?.('/discover')} className="text-xs font-bold text-emerald-700">Meet people</button></div>
      <div className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">{userProfile?.photoURL || user?.photoURL ? <img src={userProfile?.photoURL || user?.photoURL || ''} alt="" className="h-full w-full rounded-2xl object-cover" referrerPolicy="no-referrer" /> : initials || <UserRound className="h-5 w-5" />}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a place, a question or a small win in Brazil..." rows={3} className="min-w-0 flex-1 resize-none rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div><div className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0 flex-1"><input value={link} onChange={(event) => setLink(event.target.value)} type="url" placeholder="Add a link (optional)" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] outline-none focus:border-emerald-500" /><p className="mt-1 text-[10px] text-stone-500">Public post · {userProfile?.currentCity || 'Brazil'} · text and links work now</p></div><button type="button" onClick={() => void publish()} disabled={saving || !content.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}{saving ? 'Posting' : 'Post'}</button></div></div>
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">{error}</div>}
      {loading && <div className="flex min-h-40 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && posts.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><Sparkles className="mx-auto h-7 w-7 text-stone-400" /><h3 className="mt-3 font-bold text-stone-900">Your feed is empty.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Make your first post and help another traveler feel at home.</p></div>}
      {!loading && posts.map((post) => <article key={post.id} className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm"><header className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 font-bold text-emerald-800">{post.authorPhotoURL ? <img src={post.authorPhotoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : post.authorName.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-stone-900">{post.authorName}</h3><p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><MapPin className="h-3 w-3 text-emerald-600" />{post.city || 'Brazil'} · {formatDate(post.createdAt)}</p></div></header><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{post.content}</p>{post.linkUrl && <a href={post.linkUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-bold text-emerald-700"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{post.linkUrl}</a>}<div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3"><button type="button" onClick={() => void reactToPost(post)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${likedPosts[post.id] ? 'bg-rose-50 text-rose-700' : 'text-stone-500 hover:bg-stone-50'}`}><Heart className={`h-4 w-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />{post.reactionCount || 0}</button><button type="button" onClick={() => void toggleComments(post.id)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-stone-500 hover:bg-stone-50"><MessageCircle className="h-4 w-4" />{post.commentCount || 0}</button>{onNavigate && <button type="button" onClick={() => onNavigate('/contribute')} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"><FilePlus2 className="h-4 w-4" />Contribute</button>}</div>{openComments[post.id] && <div className="mt-3 space-y-3 border-t border-stone-100 pt-3"><div className="flex gap-2"><input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Add a helpful comment..." className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none focus:border-emerald-500" /><button type="button" onClick={() => void submitComment(post)} disabled={commentSaving === post.id || !commentDrafts[post.id]?.trim()} aria-label="Send comment" className="rounded-xl bg-emerald-600 p-2 text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button></div>{comments[post.id]?.map((comment) => <div key={comment.id} className="rounded-2xl bg-stone-50 p-3"><p className="text-xs font-bold text-stone-800">{comment.authorName}</p><p className="mt-1 text-xs leading-relaxed text-stone-600">{comment.text}</p></div>)}{comments[post.id]?.length === 0 && <p className="text-xs text-stone-500">No comments yet. Start the conversation.</p>}</div>}</article>)}
    </section>
  );
};
