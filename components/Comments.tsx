import { timeAgo } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { CommentForm, DeleteCommentButton } from "./CommentForm";
import { SignInButton } from "./SignInButton";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userImage: string | null;
};

export function Comments({
  postId,
  slug,
  comments,
  viewer,
}: {
  postId: string;
  slug: string;
  comments: Comment[];
  viewer: { id: string; name: string; image?: string | null; isAdmin: boolean } | null;
}) {
  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <h2 id="comments-heading" className="font-serif text-2xl font-bold">
        💬 टिप्पणियाँ <span className="text-muted">({comments.length})</span>
      </h2>

      <div className="mt-6 rounded-3xl border border-line bg-surface p-5">
        {viewer ? (
          <div className="flex gap-3">
            <Avatar name={viewer.name} image={viewer.image} size={40} />
            <CommentForm postId={postId} />
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="mb-4 text-muted">अपने विचार साझा करने के लिए Google से लॉगिन करें 🙏</p>
            <SignInButton callbackURL={`/blog/${slug}#comments`} />
          </div>
        )}
      </div>

      <ul className="mt-6 space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3 rounded-2xl border border-line/70 bg-surface/60 p-4">
            <Avatar name={c.userName} image={c.userImage} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <p className="font-semibold">{c.userName}</p>
                <time dateTime={c.createdAt.toISOString()} className="text-sm text-muted">
                  {timeAgo(c.createdAt)}
                </time>
                {viewer && (viewer.id === c.userId || viewer.isAdmin) && (
                  <DeleteCommentButton commentId={c.id} />
                )}
              </div>
              <p className="mt-1 whitespace-pre-line break-words">{c.content}</p>
            </div>
          </li>
        ))}
        {!comments.length && <li className="py-6 text-center text-muted">पहली टिप्पणी आप करें! ✨</li>}
      </ul>
    </section>
  );
}
