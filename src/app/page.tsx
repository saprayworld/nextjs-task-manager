import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  ArrowRight,
  CheckCircle2,
  GripVertical,
  Kanban,
  LayoutList,
  Lock,
  Moon,
  Database,
  Zap,
  Smartphone,
  Github,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { getTranslations } from "next-intl/server";


const techStack = [
  { name: "Next.js 16", description: "App Router" },
  { name: "TypeScript", description: "Type-safe" },
  { name: "Tailwind CSS", description: "Utility-first" },
  { name: "shadcn/ui", description: "Components" },
  { name: "Drizzle ORM", description: "Database" },
  { name: "Better Auth", description: "Authentication" },
  { name: "Resend", description: "Email & OTP" },
  { name: "@dnd-kit", description: "Drag & Drop" },
  { name: "Neon (PostgreSQL)", description: "Serverless Database" },
];

export default async function Home() {
  const t = await getTranslations("Home");
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const features = [
    {
      icon: Lock,
      title: t("feature1Title"),
      description: t("feature1Desc"),
      badge: "Secure",
    },
    {
      icon: Kanban,
      title: t("feature2Title"),
      description: t("feature2Desc"),
      badge: "Interactive",
    },
    {
      icon: Type,
      title: t("feature3Title"),
      description: t("feature3Desc"),
      badge: "Editor",
    },
    {
      icon: LayoutList,
      title: t("feature4Title"),
      description: t("feature4Desc"),
      badge: "Flexible",
    },
    {
      icon: Zap,
      title: t("feature5Title"),
      description: t("feature5Desc"),
      badge: "Fast",
    },
    {
      icon: Smartphone,
      title: t("feature6Title"),
      description: t("feature6Desc"),
      badge: "Control",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Kanban className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <Button size="sm" asChild>
                <Link href="/kanban">
                  {t("dashboardButton")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t("loginButton")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    {t("getStartedButton")}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-chart-1/5 blur-3xl" />
          <div className="absolute left-0 top-2/3 h-[300px] w-[300px] rounded-full bg-chart-2/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {t("heroBadge")}
            </Badge>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t("heroTitle1")}
              <br />
              <span className="bg-gradient-to-r from-chart-1 via-chart-2 to-chart-5 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {t("heroDescription")}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {session ? (
                <Button size="lg" className="min-w-[180px] text-base" asChild>
                  <Link href="/kanban">
                    {t("goToBoardButton")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="min-w-[180px] text-base" asChild>
                    <Link href="/register">
                      {t("startFreeButton")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-w-[180px] text-base"
                    asChild
                  >
                    <Link href="/login">{t("loginButton")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="mx-auto mt-16 max-w-4xl md:mt-24">
            <div className="rounded-xl border bg-card p-3 shadow-2xl shadow-primary/5 md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/70" />
                <div className="h-3 w-3 rounded-full bg-chart-4/70" />
                <div className="h-3 w-3 rounded-full bg-chart-2/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  TaskFlow — Kanban Board
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {/* Todo Column */}
                <div className="rounded-lg bg-muted/50 p-2.5 md:p-3">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-chart-5" />
                    <span className="text-xs font-semibold md:text-sm">
                      {t("previewTodo")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto h-5 px-1.5 text-[10px]"
                    >
                      3
                    </Badge>
                  </div>
                  {["Design UI", "Write Tests", "Update Docs"].map(
                    (task, i) => (
                      <div
                        key={i}
                        className="mb-2 flex items-center gap-1.5 rounded-md border bg-card p-2 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent md:p-2.5 md:text-xs"
                      >
                        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                        {task}
                      </div>
                    )
                  )}
                </div>
                {/* In Progress Column */}
                <div className="rounded-lg bg-muted/50 p-2.5 md:p-3">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-chart-1" />
                    <span className="text-xs font-semibold md:text-sm">
                      {t("previewInProgress")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto h-5 px-1.5 text-[10px]"
                    >
                      2
                    </Badge>
                  </div>
                  {["Build API", "Auth Flow"].map((task, i) => (
                    <div
                      key={i}
                      className="mb-2 flex items-center gap-1.5 rounded-md border bg-card p-2 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent md:p-2.5 md:text-xs"
                    >
                      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                      {task}
                    </div>
                  ))}
                </div>
                {/* Done Column */}
                <div className="rounded-lg bg-muted/50 p-2.5 md:p-3">
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-chart-2" />
                    <span className="text-xs font-semibold md:text-sm">
                      {t("previewDone")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto h-5 px-1.5 text-[10px]"
                    >
                      2
                    </Badge>
                  </div>
                  {["Setup DB", "Init Project"].map((task, i) => (
                    <div
                      key={i}
                      className="mb-2 flex items-center gap-1.5 rounded-md border bg-card p-2 text-[11px] font-medium shadow-sm transition-colors hover:bg-accent md:p-2.5 md:text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-chart-2" />
                      <span className="line-through text-muted-foreground">
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 md:py-28 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-sm">
            {t("featuresBadge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="text-muted-foreground md:text-lg">
            {t("featuresDescription")}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-20 md:py-28 md:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-sm">
            {t("techBadge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("techTitle")}
          </h2>
          <p className="text-muted-foreground md:text-lg">
            {t("techDescription")}
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="group flex flex-col items-center gap-1.5 rounded-xl border bg-card p-4 text-center transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 md:p-5"
            >
              <span className="text-sm font-semibold tracking-tight md:text-base">
                {tech.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {tech.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mb-8 text-muted-foreground md:text-lg">
              {t("ctaDescription")}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="min-w-[200px] text-base" asChild>
                <Link href="/register">
                  {t("ctaRegisterFree")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="min-w-[200px] text-base text-muted-foreground"
                asChild
              >
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  {t("ctaGithub")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            <span className="font-medium">TaskFlow</span>
          </div>
          <p>
            {t("footerText", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
}
