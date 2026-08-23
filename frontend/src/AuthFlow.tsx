import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Brain,
  Check,
  Code2,
  Dna,
  Eye,
  EyeOff,
  FlaskConical,
  GraduationCap,
  Landmark,
  LockKeyhole,
  Mail,
  Orbit,
  Sigma,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { KnomoBrand } from "./components/Brand";

export type User = {
  id: number;
  email: string;
  display_name: string;
  username: string;
  study_hours: number;
  streak: number;
  interests: string[];
  needs_onboarding: boolean;
};
type Mode = "login" | "signup" | "forgot" | "reset";
const icons: Record<string, typeof Atom> = {
  Biology: Dna,
  Chemistry: FlaskConical,
  Physics: Atom,
  Mathematics: Sigma,
  "Computer science": Code2,
  Astronomy: Orbit,
  Psychology: Brain,
  History: Landmark,
  Engineering: Wrench,
};
const field =
  "h-12 w-full rounded-xl border border-[#C98F9F] bg-white pl-11 pr-4 text-sm text-[#0B0B0D] shadow-sm outline-none transition placeholder:text-[#6B1F3A] focus:border-[#252329] focus:ring-4 focus:ring-[#C98F9F]/30";

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

export function AuthFlow({
  onAuth,
}: {
  onAuth: (user: User, token: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      if (mode === "forgot") {
        const result = await request("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: form.get("email") }),
        });
        if (result.demo_reset_token) {
          setResetToken(result.demo_reset_token);
          setMode("reset");
        } else setError(result.message);
        return;
      }
      if (mode === "reset") {
        await request("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            token: resetToken,
            password: form.get("password"),
          }),
        });
        setMode("login");
        setError("Password updated — sign in with your new password.");
        return;
      }
      const body =
        mode === "signup"
          ? {
              display_name: form.get("name"),
              username: form.get("username"),
              email: form.get("email"),
              password: form.get("password"),
            }
          : { email: form.get("email"), password: form.get("password") };
      const result = await request(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      localStorage.setItem("syllabite_token", result.token);
      onAuth(result.user, result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden border-r border-white/[.07] lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B0D] via-[#252329] to-[#6B1F3A]" />
        <div className="absolute -left-24 top-1/4 size-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-[32rem] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <KnomoBrand />
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-bold text-fuchsia-300">
              <Sparkles className="size-3" />
              Learning, rebuilt for your attention span
            </div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
              Your degree.
              <br />
              <span className="text-[#F7F1EE]">
                In your feed.
              </span>
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-[#F7F1EE]">
              Turn university syllabi into reels, memes, study paths, and
              achievements worth sharing.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                ["12k+", "Learners"],
                ["2.1m", "Minutes studied"],
                ["94%", "Keep streaks"],
              ].map(([a, b]) => (
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
                  <div className="text-xl font-black">{a}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-[#F7F1EE]">
                    {b}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            Built for curious minds, not endless scrolling.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[#EFE7E3] p-5 sm:p-10">
        <Card className="w-full max-w-md border border-white bg-white/90 p-3 shadow-xl shadow-[#252329]/10 sm:p-7">
          <div className="mb-8 lg:hidden">
            <KnomoBrand compact />
          </div>
          {mode !== "login" && (
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="mb-5 flex items-center gap-2 text-xs text-zinc-500 hover:text-white"
            >
              <ArrowLeft className="size-3" />
              Back to sign in
            </button>
          )}
          <h2 className="text-3xl font-black">
            {mode === "login"
              ? "Welcome back"
              : mode === "signup"
                ? "Create your account"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Choose a new password"}
          </h2>
          <p className="mt-2 text-sm text-[#6B1F3A]">
            {mode === "login"
              ? "Continue your streak and learning journey."
              : mode === "signup"
                ? "Your personalized syllabus feed starts here."
                : mode === "forgot"
                  ? "Enter your account email to receive a reset link."
                  : "Use at least eight characters."}
          </p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <>
                <label className="relative block">
                  <UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    name="name"
                    required
                    placeholder="Full name"
                    className={field}
                  />
                </label>
                <label className="relative block">
                  <GraduationCap className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
                  <input
                    name="username"
                    required
                    minLength={3}
                    pattern="[A-Za-z0-9_]+"
                    placeholder="Username"
                    className={field}
                  />
                </label>
              </>
            )}{" "}
            {mode !== "reset" && (
              <label className="relative block">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className={field}
                />
              </label>
            )}
            {mode !== "forgot" && (
              <label className="relative block">
                <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Password"
                  className={`${field} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                >
                  {show ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </label>
            )}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-semibold text-[#252329] hover:text-[#0B0B0D]"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {error && (
              <div
                className={`rounded-xl border px-3 py-2.5 text-xs ${error.startsWith("Password updated") ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300"}`}
              >
                {error}
              </div>
            )}
            <Button variant="accent" disabled={busy} className="h-12 w-full">
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Update password"}
            </Button>
          </form>
          {(mode === "login" || mode === "signup") && (
            <p className="mt-7 text-center text-sm text-[#6B1F3A]">
              {mode === "login" ? "New to KNOMO?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
                className="font-bold text-[#0B0B0D] hover:text-[#252329]"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          )}
        </Card>
      </section>
    </main>
  );
}

export function InterestOnboarding({
  user,
  token,
  onDone,
}: {
  user: User;
  token: string;
  onDone: (u: User) => void;
}) {
  const [options, setOptions] = useState<{ name: string; icon: string }[]>([]);
  const [selected, setSelected] = useState(new Set<string>());
  const [error, setError] = useState("");
  useEffect(() => {
    request("/api/interests").then((x) => setOptions(x.interests));
  }, []);
  const save = async () => {
    try {
      const result = await request("/api/me/interests", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ interests: [...selected] }),
      });
      onDone(result.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save");
    }
  };
  return (
    <main className="min-h-screen px-5 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <KnomoBrand compact />
          <div className="text-xs text-zinc-600">Step 1 of 1</div>
        </div>
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-fuchsia-400">
            Personalize your feed
          </div>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            What sparks your curiosity, {user.display_name.split(" ")[0]}?
          </h1>
          <p className="mt-4 text-zinc-500">
            Choose at least three interests. We’ll mix these with your
            university syllabus to build a feed that feels made for you.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {options.map((item) => {
            const Icon = icons[item.name] || BookOpen;
            const active = selected.has(item.name);
            return (
              <button
                key={item.name}
                onClick={() => {
                  const n = new Set(selected);
                  active ? n.delete(item.name) : n.add(item.name);
                  setSelected(n);
                }}
                className={`relative min-h-36 rounded-2xl border p-5 text-left transition hover:-translate-y-1 ${active ? "border-fuchsia-400 bg-fuchsia-500/10 shadow-xl shadow-fuchsia-950/30" : "border-white/[.08] bg-white/[.025] hover:border-white/20"}`}
              >
                <div
                  className={`mb-7 grid size-10 place-items-center rounded-xl ${active ? "bg-fuchsia-500 text-white" : "bg-white/5 text-zinc-500"}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="font-bold">{item.name}</div>
                {active && (
                  <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-fuchsia-500">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-2xl border border-[#F7F1EE]/10 bg-[#344650]/90 p-4 backdrop-blur-xl">
          <span className="text-sm text-zinc-500">
            <b className="text-white">{selected.size}</b> selected · minimum 3
          </span>
          <Button variant="accent" disabled={selected.size < 3} onClick={save}>
            Build my feed
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </div>
    </main>
  );
}
