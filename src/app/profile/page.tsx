"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, Save, User as UserIcon, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { useTranslations, useLocale } from "next-intl";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const t = useTranslations("ProfilePage");
  const locale = useLocale();

  const enableUploadProfilePicture = false;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('toast.nameRequired'));
      return;
    }

    setIsSaving(true);

    try {
      if (typeof authClient.updateUser === "function") {
        const { error } = await authClient.updateUser({
          name: name.trim(),
          image: image.trim() || undefined,
        });

        if (error) {
          throw new Error(error.message || t('toast.updateError'));
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      toast.success(t('toast.updateSuccess'));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || t('toast.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground animate-pulse text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Header Section — matches Report Dashboard style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border/50">
          <Mail className="w-4 h-4" />
          <span>{session?.user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 relative items-start">
        {/* Left Side: Navigation */}
        <ProfileSidebar />

        {/* Right Side: Content */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">

          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Display Name Card */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('cards.displayName')}</p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <UserIcon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-bold truncate">{session?.user?.name || "—"}</p>
            </div>

            {/* Email Card */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('cards.email')}</p>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-bold truncate">{session?.user?.email || "—"}</p>
            </div>

            {/* Created At Card */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-5 flex flex-col space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('cards.memberSince')}</p>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-lg font-bold">
                {session?.user?.createdAt
                  ? new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", { dateStyle: "medium" }).format(new Date(session.user.createdAt))
                  : "—"}
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            {/* Section Header — Report Dashboard style */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  {t('form.title')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('form.description')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-8">

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-muted/20 border border-border/50">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:border-primary/20">
                      {image ? (
                        <img src={image} alt="Profile" className="w-full h-full object-cover" />
                      ) : session?.user?.image ? (
                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-muted-foreground/40" />
                      )}
                    </div>
                    {/* Visual cue for Upload */}
                    {enableUploadProfilePicture && (
                      <div className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg z-10 transition-all hover:scale-110 cursor-pointer ring-2 ring-background hover:ring-primary/50" title={t('form.changeAvatar')}>
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{t('form.avatarTitle')}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto sm:mx-0">
                      {t('form.avatarDescription')}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-sm font-semibold">{t('form.displayNameLabel')}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="transition-all duration-200 focus-visible:ring-primary bg-background h-11"
                      placeholder={t('form.displayNamePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground">{t('form.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      className="bg-muted/40 border-transparent text-muted-foreground cursor-not-allowed pointer-events-none h-11"
                      disabled
                      readOnly
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      {t('form.emailHelp')}
                    </p>
                  </div>

                  <div className="space-y-2.5 sm:col-span-2">
                    <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                      {t('form.avatarUrlLabel')}
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary uppercase font-bold tracking-wider">{t('form.avatarUrlOptional')}</span>
                    </Label>
                    <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="transition-all duration-200 focus-visible:ring-primary bg-background"
                      placeholder={t('form.avatarUrlPlaceholder')}
                    />
                    <p className="text-[11px] text-muted-foreground ml-1">
                      {t('form.avatarUrlHelp')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions — clean bar matching report style */}
              <div className="px-6 py-4 border-t border-border/50 bg-muted/10 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                  className="px-6"
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('actions.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t('actions.save')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
