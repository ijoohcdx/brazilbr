import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, FilePlus2, Heart, ImagePlus, Loader2, MapPin, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addPostComment, attachPostMedia, createPost, listFeedPosts, listPostComments, removePostMedia, togglePostReaction } from '../firebase/posts';
import { listContributions } from '../firebase/contributions';
import { mediaKind, mediaURL, uploadMedia, validateMediaFile } from '../firebase/media';
import type { Contribution, MediaEntry, MediaReference, Post, PostComment } from '../types';

interface FeedScreenProps {
  onNavigate?: (path: string) => void;
}

type FeedItem = { kind: 'post'; value: Post } | { kind: 'contribution'; value: Contribution };

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

const isVideoURL = (url: string) => /\.(mp4|webm)(\?|$)/i.test(url);

const MediaGallery: React.FC<{ entries: MediaEntry[]; canDelete?: boolean; onDelete?: (entry: MediaReference) => void }> = ({ entries, canDelete, onDelete }) => {
  const visible = entries.filter((entry) => mediaURL(entry));
  if (visible.length === 0) return null;
  return <div className="mt-4 grid grid-cols-2 gap-2">{visible.slice(0, 4).map((entry, index) => { const url = mediaURL(entry); const isVideo = mediaKind(entry) === 'video' || isVideoURL(url); return <div key={`${url}-${index}`} className="relative overflow-hidden rounded-2xl bg-stone-100">{isVideo ? <video src={url} controls preload="metadata" className="h-40 w-full object-cover" /> : <img src={url} alt="Community media" loading="lazy" className="h-40 w-full object-cover" />}{canDelete && typeof entry !== 'string' && onDelete && <button type="button" onClick={() => onDelete(entry)} className="absolute right-2 top-2 rounded-full bg-stone-900/70 p-1.5 text-white" aria-label="Delete media"><X className="h-3.5 w-3.5" /></button>}</div>; })}</div>;
};

export const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [retryFiles, setRetryFiles] = useState<Record<string, File[]>>({});
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaRetrying, setMediaRetrying] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [commentSaving, setCommentSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [postResult, contributionResult] = await Promise.allSettled([listFeedPosts(), listContributions()]);
    setPosts(postResult.status === 'fulfilled' ? postResult.value : []);
    setContributions(contributionResult.status === 'fulfilled' ? contributionResult.value : []);
    if (postResult.status === 'rejected' && contributionResult.status === 'rejected') setError('The community feed is unavailable right now. Please try again.');
    else if (postResult.status === 'rejected') setError('Social posts are temporarily unavailable. Community knowledge is still shown.');
    else if (contributionResult.status === 'rejected') setError('Community contributions are temporarily unavailable. Social posts are still shown.');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const feedItems = useMemo<FeedItem[]>(() => [...posts.map((value) => ({ kind: 'post' as const, value })), ...contributions.map((value) => ({ kind: 'contribution' as const, value }))].sort((left, right) => right.value.createdAt.localeCompare(left.value.createdAt)), [posts, contributions]);

  const uploadPostFiles = async (files: File[], postId: string): Promise<MediaReference[]> => {
    if (!user) throw new Error('You must be signed in to upload media.');
    const references: MediaReference[] = [];
    for (const [index, file] of files.entries()) {
      const reference = await uploadMedia(file, { owner: 'post', authorId: user.uid, associatedId: postId }, (progress) => setUploadProgress(Math.round(((index + progress / 100) / files.length) * 100)));
      references.push(reference);
    }
    return references;
  };

  const publish = async () => {
    if (!user || !content.trim()) return;
    const files = mediaFiles;
    setSaving(true); setUploadProgress(files.length > 0 ? 0 : null); setError(null); setSuccess(null);
    let createdPost: Post | null = null;
    try {
      createdPost = await createPost(user.uid, userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'BrazilBR member', userProfile?.photoURL || user.photoURL || null, content, userProfile?.currentCity || '', 'public', link.trim() || null);
      setPosts((current) => [createdPost as Post, ...current]);
      setContent(''); setLink(''); setMediaFiles([]);
      if (files.length > 0) {
        const references = await uploadPostFiles(files, createdPost.id);
        await attachPostMedia(createdPost.id, references);
        setPosts((current) => current.map((item) => item.id === createdPost?.id ? { ...item, media: references } : item));
        setSuccess('Post and media shared successfully.');
      } else {
        setSuccess('Post shared successfully.');
      }
    } catch (publishError) {
      console.error('Could not publish post or media:', publishError);
      if (createdPost && files.length > 0) {
        setRetryFiles((current) => ({ ...current, [createdPost?.id || '']: files }));
        setError('Your post was saved, but the media upload failed. Retry it below.');
      } else {
        setError('We could not publish your post yet. Please try again.');
      }
    } finally { setSaving(false); setUploadProgress(null); }
  };

  const retryPostMedia = async (post: Post) => {
    if (!retryFiles[post.id]) return;
    setMediaRetrying(post.id); setUploadProgress(0); setError(null); setSuccess(null);
    try {
      const references = await uploadPostFiles(retryFiles[post.id], post.id);
      await attachPostMedia(post.id, references);
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, media: references } : item));
      setRetryFiles((current) => { const next = { ...current }; delete next[post.id]; return next; });
      setSuccess('Post media uploaded successfully.');
    } catch (retryError) {
      console.error('Could not retry post media:', retryError);
      setError('Media upload failed again. Check your connection and retry.');
    } finally { setMediaRetrying(null); setUploadProgress(null); }
  };

  const reactToPost = async (post: Post) => {
    if (!user) return;
    const wasLiked = likedPosts[post.id] === true;
    setLikedPosts((current) => ({ ...current, [post.id]: !wasLiked }));
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, reactionCount: Math.max(0, item.reactionCount + (wasLiked ? -1 : 1)) } : item));
    try { const liked = await togglePostReaction(post.id, user.uid); setLikedPosts((current) => ({ ...current, [post.id]: liked })); }
    catch (reactionError) { console.error('Could not react to post:', reactionError); setLikedPosts((current) => ({ ...current, [post.id]: wasLiked })); setPosts((current) => current.map((item) => item.id === post.id ? { ...item, reactionCount: post.reactionCount } : item)); setError('We could not save that reaction yet. Please try again.'); }
  };

  const deletePostMedia = async (post: Post, media: MediaReference) => {
    if (!user || post.authorId !== user.uid) return;
    try { await removePostMedia(post, media.id); setPosts((current) => current.map((item) => item.id === post.id ? { ...item, media: (item.media || []).filter((entry) => entry.id !== media.id) } : item)); setSuccess('Media deleted.'); }
    catch (deleteError) { console.error('Could not delete post media:', deleteError); setError('We could not delete that media yet. Please try again.'); }
  };

  const toggleComments = async (postId: string) => {
    const nextOpen = !openComments[postId];
    setOpenComments((current) => ({ ...current, [postId]: nextOpen }));
    if (nextOpen && !comments[postId]) {
      try { setComments((current) => ({ ...current, [postId]: [] })); const loadedComments = await listPostComments(postId); setComments((current) => ({ ...current, [postId]: loadedComments })); }
      catch (commentError) { console.error('Could not load comments:', commentError); setError('Comments are unavailable right now. Please try again.'); }
    }
  };

  const submitComment = async (post: Post) => {
    if (!user || !commentDrafts[post.id]?.trim()) return;
    setCommentSaving(post.id);
    try { const comment = await addPostComment(post.id, user.uid, userProfile?.displayName || user.displayName || 'BrazilBR member', commentDrafts[post.id]); setComments((current) => ({ ...current, [post.id]: [comment, ...(current[post.id] || [])] })); setCommentDrafts((current) => ({ ...current, [post.id]: '' })); setPosts((current) => current.map((item) => item.id === post.id ? { ...item, commentCount: item.commentCount + 1 } : item)); }
    catch (commentError) { console.error('Could not publish comment:', commentError); setError('We could not add your comment yet. Please try again.'); }
    finally { setCommentSaving(null); }
  };

  const chooseMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []) as File[];
    event.target.value = '';
    const valid: File[] = [];
    const invalid: string[] = [];
    selected.slice(0, 4).forEach((file) => { const result = validateMediaFile(file, 'post'); if (result.ok) valid.push(file); else invalid.push(result.message || file.name); });
    setMediaFiles(valid);
    if (invalid.length > 0) setError(invalid.join(' ')); else setError(null);
  };

  const displayName = userProfile?.displayName || user?.displayName || 'BrazilBR member';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between"><div><div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700"><Sparkles className="h-3.5 w-3.5" />Community feed</div><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">What is happening?</h2></div><button type="button" onClick={() => onNavigate?.('/discover')} className="text-xs font-bold text-emerald-700">Meet people</button></div>
      <div className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 font-bold text-emerald-800">{userProfile?.photoURL || user?.photoURL ? <img src={userProfile?.photoURL || user?.photoURL || ''} alt="" className="h-full w-full rounded-2xl object-cover" referrerPolicy="no-referrer" /> : initials || <UserRound className="h-5 w-5" />}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a place, a question or a small win in Brazil..." rows={3} className="min-w-0 flex-1 resize-none rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div><div className="mt-3 flex flex-wrap items-center gap-2"><input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={chooseMedia} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-600 hover:border-emerald-300 hover:text-emerald-700"><ImagePlus className="h-3.5 w-3.5" />Add photos/video</button>{mediaFiles.map((file) => <span key={`${file.name}-${file.size}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800"><span className="max-w-32 truncate">{file.name}</span><button type="button" onClick={() => setMediaFiles((current) => current.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}><X className="h-3 w-3" /></button></span>)}</div><div className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0 flex-1"><input value={link} onChange={(event) => setLink(event.target.value)} type="url" placeholder="Add a link (optional)" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] outline-none focus:border-emerald-500" /><p className="mt-1 text-[10px] text-stone-500">Public post · {userProfile?.currentCity || 'Brazil'} · JPG, PNG, WebP up to 10 MB; MP4/WebM up to 50 MB</p></div><button type="button" onClick={() => void publish()} disabled={saving || !content.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}{saving ? uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Posting' : 'Post'}</button></div></div>
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">{success}</div>}
      {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900">{error}</div>}
      {loading && <div className="flex min-h-40 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && feedItems.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><Sparkles className="mx-auto h-7 w-7 text-stone-400" /><h3 className="mt-3 font-bold text-stone-900">Your feed is empty.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Make your first post or contribute something useful for another traveler.</p></div>}
      {!loading && feedItems.map((item) => item.kind === 'contribution' ? <ContributionCard key={`contribution-${item.value.id}`} contribution={item.value} onNavigate={onNavigate} /> : <article key={`post-${item.value.id}`} className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm"><header className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 font-bold text-emerald-800">{item.value.authorPhotoURL ? <img src={item.value.authorPhotoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : item.value.authorName.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><button type="button" onClick={() => onNavigate?.(`/profile?uid=${encodeURIComponent(item.value.authorId)}`)} className="truncate text-left text-sm font-bold text-stone-900 hover:text-emerald-700">{item.value.authorName}</button><p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><MapPin className="h-3 w-3 text-emerald-600" />{item.value.city || 'Brazil'} · {formatDate(item.value.createdAt)}</p></div></header><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{item.value.content}</p>{item.value.linkUrl && <a href={item.value.linkUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1.5 truncate text-xs font-bold text-emerald-700"><ExternalLink className="h-3.5 w-3.5 shrink-0" />{item.value.linkUrl}</a>}<MediaGallery entries={item.value.media || []} canDelete={item.value.authorId === user?.uid} onDelete={(media) => void deletePostMedia(item.value, media)} />{retryFiles[item.value.id] && <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs leading-relaxed text-amber-900">Media upload failed. Your text is safe.</p><button type="button" onClick={() => void retryPostMedia(item.value)} disabled={mediaRetrying === item.value.id} className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-[11px] font-bold text-amber-950 disabled:opacity-50">{mediaRetrying === item.value.id ? 'Retrying' : 'Retry'}</button></div>}<div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3"><button type="button" onClick={() => void reactToPost(item.value)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${likedPosts[item.value.id] ? 'bg-rose-50 text-rose-700' : 'text-stone-500 hover:bg-stone-50'}`}><Heart className={`h-4 w-4 ${likedPosts[item.value.id] ? 'fill-current' : ''}`} />{item.value.reactionCount || 0}</button><button type="button" onClick={() => void toggleComments(item.value.id)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-stone-500 hover:bg-stone-50"><MessageCircle className="h-4 w-4" />{item.value.commentCount || 0}</button>{onNavigate && <button type="button" onClick={() => onNavigate('/contribute')} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"><FilePlus2 className="h-4 w-4" />Contribute</button>}</div>{openComments[item.value.id] && <div className="mt-3 space-y-3 border-t border-stone-100 pt-3"><div className="flex gap-2"><input value={commentDrafts[item.value.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [item.value.id]: event.target.value }))} placeholder="Add a helpful comment..." className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none focus:border-emerald-500" /><button type="button" onClick={() => void submitComment(item.value)} disabled={commentSaving === item.value.id || !commentDrafts[item.value.id]?.trim()} aria-label="Send comment" className="rounded-xl bg-emerald-600 p-2 text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button></div>{comments[item.value.id]?.map((comment) => <div key={comment.id} className="rounded-2xl bg-stone-50 p-3"><p className="text-xs font-bold text-stone-800">{comment.authorName}</p><p className="mt-1 text-xs leading-relaxed text-stone-600">{comment.text}</p></div>)}{comments[item.value.id]?.length === 0 && <p className="text-xs text-stone-500">No comments yet. Start the conversation.</p>}</div>}</article>)}
    </section>
  );
};

const ContributionCard: React.FC<{ contribution: Contribution; onNavigate?: (path: string) => void }> = ({ contribution, onNavigate }) => <article className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-sm"><header className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><FilePlus2 className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Community knowledge</p><h3 className="mt-1 truncate text-sm font-bold text-stone-900">{contribution.title}</h3><p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500"><MapPin className="h-3 w-3 text-emerald-600" />{contribution.city || 'Brazil'} · {contribution.type.replace('-', ' ')}</p></div></header><p className="mt-4 text-sm leading-relaxed text-stone-700">{contribution.description}</p><MediaGallery entries={contribution.media || []} /><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-amber-200/70 pt-3">{contribution.links[0] && <a href={contribution.links[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-amber-900"><ExternalLink className="h-3.5 w-3.5" />Open link</a>}{contribution.placeId && onNavigate && <button type="button" onClick={() => onNavigate(`/place?id=${encodeURIComponent(contribution.placeId || '')}`)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><MapPin className="h-3.5 w-3.5" />Open Place Profile</button>}</div></article>;
