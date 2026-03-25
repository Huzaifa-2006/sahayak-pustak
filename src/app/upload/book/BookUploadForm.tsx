"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createBook } from "@/actions/books";
import { SEMESTERS, SUBJECTS } from "@/lib/utils";
import { Upload, Star, Gift, Tag, MapPin } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(2, "Author is required"),
  subject: z.string().min(1, "Subject is required"),
  semester: z.coerce.number().int().min(1).max(8),
  condition: z.enum(["new", "good", "fair"]),
  price: z.coerce.number().int().min(0).max(5000).optional(),
  pickupLocation: z.string().min(3, "Pickup location is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function BookUploadForm({ defaultDonate }: { defaultDonate?: boolean }) {
  const router = useRouter();
  const [isDonation, setIsDonation] = useState(defaultDonate ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { condition: "good", semester: 1, price: 0 },
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("author", values.author);
    fd.append("subject", values.subject);
    fd.append("semester", String(values.semester));
    fd.append("condition", values.condition);
    fd.append("price", isDonation ? "0" : String(values.price ?? 0));
    fd.append("isDonation", String(isDonation));
    fd.append("pickupLocation", values.pickupLocation);
    if (imageFile) fd.append("image", imageFile);

    const result = await createBook(fd);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        isDonation ? "Book donated! +300 karma earned 🎉" : "Book listed successfully!"
      );
      router.push(result.bookId ? `/books/${result.bookId}` : "/books");
    } else {
      toast.error(result.error ?? "Failed to create listing");
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([, msgs]) => {
          if (msgs?.[0]) toast.error(msgs[0]);
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Donation / Sell toggle */}
      <div className="flex gap-3 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setIsDonation(true)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            isDonation ? "bg-green-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Gift className="h-4 w-4" />
          Donate Free
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isDonation ? "bg-white/20" : "bg-amber-100 text-amber-700"}`}>
            +300 karma
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsDonation(false)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            !isDonation ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Tag className="h-4 w-4" />
          Sell for Price
        </button>
      </div>

      {isDonation && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
          <Star className="h-4 w-4 fill-current shrink-0" />
          Donating earns you <strong>+300 karma points</strong> and helps fellow students!
        </div>
      )}

      {/* Book details */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Book Title *</label>
          <input {...register("title")} placeholder="e.g. Engineering Mathematics - I" className="input" />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Author *</label>
          <input {...register("author")} placeholder="e.g. H.K. Dass" className="input" />
          {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author.message}</p>}
        </div>

        <div>
          <label className="label">Condition *</label>
          <select {...register("condition")} className="input">
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="label">Subject *</label>
          <select {...register("subject")} className="input">
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="label">Semester *</label>
          <select {...register("semester")} className="input">
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        {!isDonation && (
          <div>
            <label className="label">Price (₹) *</label>
            <input
              {...register("price")}
              type="number"
              min={1}
              max={5000}
              placeholder="e.g. 150"
              className="input"
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
          </div>
        )}

        {/* Pickup Location — full width */}
        <div className="sm:col-span-2">
          <label className="label">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand-500" />
              Pickup Location *
            </span>
          </label>
          <input
            {...register("pickupLocation")}
            placeholder="e.g. Dombivli East, near Tilak Chowk / Kurla Station West"
            className="input"
          />
          <p className="text-xs text-slate-400 mt-1">
            Enter a landmark, colony, or station so the buyer/receiver can find you easily.
          </p>
          {errors.pickupLocation && (
            <p className="text-xs text-red-500 mt-1">{errors.pickupLocation.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="label">Book Image (optional)</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-colors text-center"
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-cover" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Click to upload book cover image</p>
              <p className="text-xs text-slate-300 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
        {isSubmitting ? "Uploading..." : isDonation ? "Donate Book" : "List for Sale"}
      </button>
    </form>
  );
}
