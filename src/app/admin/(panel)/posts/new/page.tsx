import PostForm from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-zinc-900">پست جدید</h1>
        <p className="text-sm text-zinc-500 mt-1">
          محتوا، سئو و چیدمان نمایش خبر را تنظیم کنید
        </p>
      </div>
      <PostForm />
    </div>
  );
}
