import { useEffect, useMemo, useRef, useState } from "react";
import { AuthFlow, InterestOnboarding, type User } from "./AuthFlow";
import { KnomoBrand } from "./components/Brand";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Progress } from "./components/ui/progress";
import {
  BarChart3,
  Award,
  Bell,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Flame,
  Grid3X3,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  Bot,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Repeat2,
  Send,
  Settings,
  Share2,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  Upload,
  UserRound,
  UserSquare2,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Reel = {
  id: string;
  kind: "video" | "meme" | "lesson";
  creator: string;
  name: string;
  initials: string;
  course: string;
  unit: string;
  title: string;
  body: string;
  caption: string;
  likes: number;
  comments: number;
  video?: string;
  featured?: boolean;
  color: string;
};
const initialReels: Reel[] = [
  {
    id: "space",
    kind: "video",
    creator: "andrew_judah",
    name: "Andrew Judah",
    initials: "AJ",
    course: "Space science",
    unit: "Astronomy",
    title: "The 5 scariest space facts",
    body: "Five unsettling truths hiding in the universe.",
    caption:
      "The universe is beautiful. It is also deeply terrifying. #space #science",
    likes: 2841,
    comments: 193,
    video: "/media/featured-space-facts.mp4",
    featured: true,
    color: "from-violet-600 to-fuchsia-500",
  },
  {
    id: "deadlock",
    kind: "lesson",
    creator: "os_in_30",
    name: "OS in 30",
    initials: "OS",
    course: "Operating systems",
    unit: "Deadlocks",
    title: "Four ingredients that cook up a deadlock",
    body: "Mutual exclusion · Hold and wait · No preemption · Circular wait",
    caption: "Remove any one condition and the recipe fails. #OperatingSystems",
    likes: 1633,
    comments: 81,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "queue",
    kind: "meme",
    creator: "big_o_energy",
    name: "Big O Energy",
    initials: "O",
    course: "Data structures",
    unit: "Queues",
    title: "When someone cuts the canteen queue",
    body: "Queue data structure: “That is not FIFO behavior.”",
    caption: "Social justice, but make it O(1). #FIFO",
    likes: 2148,
    comments: 126,
    color: "from-cyan-500 to-blue-600",
  },
];
const creators = [
  { h: "andrew_judah", n: "Andrew Judah", i: "AJ" },
  { h: "os_in_30", n: "OS in 30", i: "OS" },
  { h: "big_o_energy", n: "Big O Energy", i: "O" },
  { h: "proof_daily", n: "Proof Daily", i: "PD" },
];
const nav = [
  { label: "For you", icon: Home },
  { label: "Explore", icon: Compass },
  { label: "Saved", icon: Bookmark },
  { label: "Progress", icon: BarChart3 },
  { label: "Profile", icon: UserRound },
];

function AvatarBlock({
  initials,
  gradient = "from-fuchsia-500 to-indigo-500",
  className = "",
}: {
  initials: string;
  gradient?: string;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarFallback className={`bg-gradient-to-br ${gradient}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function Sidebar({
  active,
  setActive,
  onLogout,
  savedCount,
}: {
  active: string;
  setActive: (v: string) => void;
  onLogout: () => void;
  savedCount: number;
}) {
  return (
    <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[.07] px-4 py-5 lg:flex">
      <div className="mb-8 px-2">
        <KnomoBrand compact />
      </div>
      <nav className="space-y-1">
        {nav.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active === label ? "bg-white text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
          >
            <Icon className="size-4" />
            {label}
            {label === "Saved" && (
              savedCount > 0 && <span className="ml-auto rounded-full bg-white/10 px-2 text-xs">{savedCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-8 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-zinc-600">
        Your courses
      </div>
      <div className="mt-3 space-y-3">
        {[
          ["Data structures", 72, "bg-cyan-400"],
          ["Operating systems", 48, "bg-orange-400"],
          ["Discrete math", 31, "bg-violet-400"],
        ].map(([n, p, c]) => (
          <div key={String(n)} className="px-2">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-zinc-300">{n}</span>
              <span className="text-zinc-600">{p}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded bg-white/5">
              <div className={`h-full ${c}`} style={{ width: `${p}%` }} />
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        className="mt-auto justify-start text-zinc-500"
        onClick={onLogout}
      >
        <LogOut className="size-4" /> Sign out
      </Button>
    </aside>
  );
}

function MobileNav({
  active,
  setActive,
}: {
  active: string;
  setActive: (value: string) => void;
}) {
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-white/10 p-2 shadow-2xl lg:hidden">
      {nav.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => setActive(label)}
          aria-label={label}
          className={`flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-bold transition ${active === label ? "bg-[#F7F1EE] text-[#0B0B0D]" : "text-zinc-500"}`}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function StudyAssistant({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const wakeRecognition = useRef<any>(null);
  const wakeTrigger = useRef(false);
  const [runnerDone, setRunnerDone] = useState(false);
  const [runRequested, setRunRequested] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: `Hey ${user.display_name.split(" ")[0]} — I’m your KNOMO study buddy. Ask me about ${user.interests.slice(0, 2).join(" or ") || "your syllabus"}.` }]);
  const answer = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes("plan") || q.includes("study")) return "Try a focused 25-minute session: choose one syllabus unit, watch one reel, save the key idea, then explain it back in your own words.";
    if (q.includes("reel") || q.includes("video")) return "Use Create reel in the top bar to upload a syllabus-linked video. Your reel is saved to your profile and shared to the feed.";
    if (q.includes("progress") || q.includes("hour")) return `You have logged ${user.study_hours} study hours. Open Progress to see your learning summary and keep building the habit.`;
    if (q.includes("interest") || q.includes("subject")) return `Your current interests are ${user.interests.join(", ") || "not selected yet"}. I can help you choose a focused subject path.`;
    return "I can help with study plans, syllabus topics, reel ideas, progress, and choosing interests. Try asking: ‘make me a study plan for today’.";
  };
  const send = (text = input) => { const clean = text.trim(); if (!clean) return; setMessages((m) => [...m, { role: "user", text: clean }, { role: "assistant", text: answer(clean) }]); setInput(""); };
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => { stream.getTracks().forEach((track) => track.stop()); setMicReady(true); })
      .catch(() => setMicReady(false));
  }, []);
  const listen = () => {
    const Speech = (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!Speech) { window.alert("Voice input is not supported in this browser. Try Chrome or Edge."); return; }
    const recognition = new Speech(); recognition.lang = "en-US"; recognition.interimResults = false;
    recognition.onstart = () => setListening(true); recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false); recognition.onresult = (event: any) => send(event.results[0][0].transcript); recognition.start();
  };
  const toggleWakeWord = () => {
    const Speech = (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!Speech) { window.alert("Voice activation is not supported in this browser. Try Chrome or Edge."); return; }
    if (wakeEnabled) { wakeRecognition.current?.stop(); setWakeEnabled(false); return; }
    const recognition = new Speech(); recognition.lang = "en-US"; recognition.continuous = true; recognition.interimResults = true;
    recognition.onresult = (event: any) => { const transcript = Array.from(event.results).slice(event.resultIndex).map((r: any) => r[0].transcript).join(" ").toLowerCase(); if (transcript.includes("baymax") && !wakeTrigger.current) { wakeTrigger.current = true; setOpen(false); setRunnerDone(false); setRunRequested(true); setMessages((m) => [...m, { role: "assistant", text: "I’m here. How can I help you learn?" }]); } };
    recognition.onerror = () => setWakeEnabled(false); recognition.onend = () => { if (wakeEnabled) { try { recognition.start(); } catch {} } };
    wakeRecognition.current = recognition; setWakeEnabled(true); recognition.start();
  };
  const greet = () => { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance("I'm Baymax. How may I help you?")); } };
  useEffect(() => { if (micReady && !wakeEnabled) toggleWakeWord(); }, [micReady]);
  const closeChat = () => { setOpen(false); setRunnerDone(false); setRunRequested(false); wakeTrigger.current = false; };
  return <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50">
    {open && <div className="mb-3 ml-auto mr-5 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[#C98F9F]/30 bg-[#0B0B0D]/95 text-[#F7F1EE] shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3"><div className="grid size-9 place-items-center rounded-xl bg-[#6B1F3A]"><Bot className="size-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-bold">Baymax</div><div className="text-[10px] text-white/55">{micReady ? "Microphone ready" : "Microphone access needed"}</div></div><button onClick={toggleWakeWord} className={`rounded-lg px-2 py-1 text-[10px] font-bold ${wakeEnabled ? "bg-[#C98F9F] text-[#0B0B0D]" : "bg-white/10 text-white/70"}`}>{wakeEnabled ? "Listening" : "Wake word"}</button></div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((m, i) => <div key={i} className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "ml-auto bg-[#C98F9F] text-[#0B0B0D]" : "bg-white/10 text-white/80"}`}>{m.text}</div>)}</div>
      <div className="flex gap-2 border-t border-white/10 p-3"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask KNOMO..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-3 text-xs outline-none placeholder:text-white/40" /><button onClick={listen} aria-label="Use microphone" className={`grid size-9 place-items-center rounded-xl ${listening ? "bg-[#C98F9F] text-black" : "bg-white/10"}`}><Mic className="size-4" /></button><button onClick={() => send()} aria-label="Send message" className="grid size-9 place-items-center rounded-xl bg-[#6B1F3A]"><Send className="size-4" /></button></div>
    </div>}
    <button onAnimationEnd={() => { if (runRequested && !runnerDone) { setRunnerDone(true); setOpen(true); setRunRequested(false); wakeTrigger.current = false; greet(); } }} onClick={() => { if (open) closeChat(); else if (!wakeEnabled) toggleWakeWord(); }} aria-label={open ? "Close Baymax study assistant" : "Baymax is listening"} className={`${open ? "pointer-events-auto absolute right-5 bottom-0 rounded-full bg-red-700 p-3" : `${runRequested ? "baymax-runner" : "baymax-idle"} pointer-events-auto absolute bottom-0 left-0 ${runnerDone ? "baymax-stopped" : ""}`} relative overflow-hidden`}>
      {open ? <MessageCircle className="size-6 text-white" /> : <video src="/baymax-transparent.webm#t=4,8" autoPlay={runRequested} muted playsInline className="baymax-figure" />}
    </button>
  </div>;
}

function Topbar({
  openUpload,
  openProfile,
  search,
  setSearch,
}: {
  openUpload: () => void;
  openProfile: () => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[.07] px-4 lg:px-7">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => window.alert("Use the bottom navigation to switch sections.")}>
        <Menu className="size-5" />
      </Button>
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 w-full rounded-xl border border-white/[.08] bg-white/[.04] pl-10 pr-10 text-sm outline-none placeholder:text-zinc-600 focus:border-fuchsia-500/50"
          placeholder="Search courses, topics, creators..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button variant="accent" className="hidden sm:flex" onClick={openUpload}>
        <Plus className="size-4" />
        Create reel
      </Button>
      <Button variant="ghost" size="icon" className="relative" onClick={() => window.alert("You’re all caught up — no new notifications.")}>
        <Bell className="size-5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-[#0B0B0D]" />
      </Button>
      <button
        onClick={openProfile}
        className="rounded-full ring-2 ring-transparent transition hover:ring-[#C98F9F]"
        aria-label="Open profile"
      >
        <AvatarBlock initials="AJ" className="size-9" />
      </button>
    </header>
  );
}

function CreatorRail({
  following,
  toggle,
  user,
}: {
  following: Set<string>;
  toggle: (h: string) => void;
  user: User;
}) {
  const stories = [
    {
      h: user.username,
      n: "Your achievement",
      i: user.display_name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 2),
      hours: user.study_hours,
      own: true,
    },
    { h: "andrew_judah", n: "Andrew Judah", i: "AJ", hours: 18.5 },
    { h: "os_in_30", n: "OS in 30", i: "OS", hours: 12.2 },
    { h: "big_o_energy", n: "Big O Energy", i: "O", hours: 9.8 },
    { h: "proof_daily", n: "Proof Daily", i: "PD", hours: 7.4 },
  ];
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Study achievements</h2>
          <p className="text-xs text-zinc-500">
            Hours learned by people you follow
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.alert("Leaderboard coming soon — follow more creators to compare study hours.")}>
          View leaderboard
        </Button>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3">
        {stories.map((s) => (
          <div key={s.h} className="w-[92px] shrink-0 text-center">
            <button
              onClick={() => !s.own && toggle(s.h)}
              className="group relative"
            >
              <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-500 p-[3px] transition group-hover:scale-105">
                <div className="rounded-full bg-[#0B0B0D] p-[3px]">
                  <AvatarBlock
                    initials={s.i}
                    className="size-[70px] border-0"
                  />
                </div>
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#0B0B0D] bg-[#F7F1EE] px-2 py-0.5 text-[10px] font-black text-[#0B0B0D]">
                {s.hours}h
              </span>
              {s.own && (
                <span className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full border-2 border-[#0B0B0D] bg-fuchsia-500 text-[#0B0B0D]">
                  <Plus className="size-3" />
                </span>
              )}
            </button>
            <div className="mt-3 truncate text-xs font-semibold">{s.n}</div>
            <div className="truncate text-[10px] text-zinc-600">
              {s.own
                ? `${user.streak} day streak`
                : following.has(s.h)
                  ? "Following"
                  : "Tap to follow"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReelCard({
  reel,
  liked,
  saved,
  token,
  onLike,
  onSave,
}: {
  reel: Reel;
  liked: boolean;
  saved: boolean;
  token: string;
  onLike: () => void;
  onSave: () => void;
}) {
  const [muted, setMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const loadComments = () => fetch(`/api/reels/${reel.id}/comments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((x) => setComments(x.comments || []));
  const addComment = async () => {
    if (!commentText.trim()) return;
    const response = await fetch(`/api/reels/${reel.id}/comments`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ body: commentText.trim() }) });
    if (response.ok) { const result = await response.json(); setComments((current) => [...current, result.comment]); setCommentText(""); }
  };
  return (
    <Card className="animate-enter overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AvatarBlock initials={reel.initials} gradient={reel.color} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold">{reel.name}</span>
              {reel.featured && (
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Featured
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-600">
              @{reel.creator} · {reel.course}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.alert(`More options for ${reel.name}`)}>
            <MoreHorizontal className="size-5" />
          </Button>
        </div>
      </CardHeader>
      {reel.video ? (
        <div className="group relative mx-5 aspect-video overflow-hidden rounded-2xl bg-black">
          <video
            src={reel.video}
            autoPlay
            loop
            muted={muted}
            playsInline
            controls
            className="size-full object-cover"
          />
          <div className="video-mask pointer-events-none absolute inset-0" />
          <button
            onClick={() => setMuted(!muted)}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 backdrop-blur"
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-fuchsia-300">
              <Play className="size-3 fill-current" />
              Now playing
            </div>
            <h2 className="text-xl font-black sm:text-2xl">{reel.title}</h2>
          </div>
        </div>
      ) : (
        <div
          className={`mx-5 grid min-h-64 place-items-center rounded-2xl bg-gradient-to-br ${reel.color} p-8 text-center text-[#0B0B0D]`}
        >
          <div>
            <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              {reel.kind}
            </span>
            <h2 className="mt-5 text-2xl font-black sm:text-3xl">
              {reel.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-white/75">
              {reel.body}
            </p>
          </div>
        </div>
      )}
      <CardContent className="pt-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLike}
            className={liked ? "text-rose-500" : ""}
          >
            <Heart className={`size-5 ${liked ? "fill-current" : ""}`} />
          </Button>
          <span className="mr-2 text-xs font-semibold">
            {(reel.likes + (liked ? 1 : 0)).toLocaleString()}
          </span>
          <Button variant="ghost" size="icon" onClick={() => { setCommentsOpen(true); void loadComments(); }}>
            <MessageCircle className="size-5" />
          </Button>
          <span className="mr-2 text-xs font-semibold">{reel.comments}</span>
          <Button variant="ghost" size="icon" onClick={() => window.alert("Share link copied to your clipboard.")}>
            <Send className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`ml-auto ${saved ? "text-fuchsia-400" : ""}`}
            onClick={onSave}
          >
            <Bookmark className={`size-5 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>
        <p className="mt-2 text-sm">
          <b>{reel.creator}</b>{" "}
          <span className="text-zinc-400">{reel.caption}</span>
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-500">
            {reel.unit}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-500">
            Syllabus matched
          </span>
        </div>
      </CardContent>
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent>
          <DialogTitle className="text-xl font-black">Comments</DialogTitle>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">{comments.length ? comments.map((comment) => <div key={comment.id} className="rounded-xl bg-white/5 p-3 text-sm"><b>{comment.username}</b><p className="mt-1 text-zinc-300">{comment.body}</p></div>) : <p className="text-sm text-zinc-500">Be the first to comment.</p>}</div>
          <div className="mt-4 flex gap-2"><input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void addComment()} placeholder="Add a thoughtful comment..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm" /><Button variant="accent" onClick={addComment}>Post</Button></div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ExplorePage({ reels, onOpen }: { reels: Reel[]; onOpen: () => void }) {
  const subjects = [
    ["Biology", "Cells, genetics & life", "from-emerald-500 to-cyan-500"],
    ["Chemistry", "Reactions made memorable", "from-[#C98F9F] to-orange-400"],
    ["Physics", "See the forces around you", "from-[#252329] to-indigo-400"],
    [
      "Computer science",
      "Code, systems & algorithms",
      "from-[#6B1F3A] to-[#C98F9F]",
    ],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-[.2em] text-[#C98F9F]">
          Discover something new
        </div>
        <h1 className="mt-2 text-4xl font-black">Explore your curiosity</h1>
        <p className="mt-2 text-zinc-500">
          Short, syllabus-aware paths built around how you like to learn.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {subjects.map(([name, copy, color]) => (
          <button
            key={name}
            onClick={() => window.alert(`Opening the ${name} learning path.`)}
            className={`group relative min-h-44 overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-6 text-left transition hover:-translate-y-1`}
          >
            <div className="absolute -right-10 -top-10 size-36 rounded-full bg-white/10 transition group-hover:scale-125" />
            <BookOpen className="mb-8 size-6" />
            <h2 className="text-2xl font-black">{name}</h2>
            <p className="mt-1 text-sm text-white/70">{copy}</p>
            <span className="absolute bottom-6 right-6 rounded-full bg-[#0B0B0D]/60 px-3 py-1 text-xs font-bold">
              Start path
            </span>
          </button>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">Trending learning moments</h2>
          <p className="text-xs text-zinc-500">
            Popular across your university
          </p>
        </div>
        <Button variant="accent" onClick={onOpen}>
          Create yours
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {reels.map((reel) => (
          <Card key={reel.id} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${reel.color}`} />
            <CardContent className="p-5">
              <div className="text-xs font-bold text-[#C98F9F]">
                {reel.course}
              </div>
              <h3 className="mt-2 line-clamp-2 font-black">{reel.title}</h3>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>@{reel.creator}</span>
                <span>{reel.likes.toLocaleString()} likes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgressPage({ user }: { user: User }) {
  const courses = [
    ["Data structures", 72, "12 of 16 units"],
    ["Operating systems", 48, "8 of 17 units"],
    ["Discrete mathematics", 31, "5 of 16 units"],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.2em] text-[#C98F9F]">
            Learning dashboard
          </div>
          <h1 className="mt-2 text-4xl font-black">Your momentum</h1>
          <p className="mt-2 text-zinc-500">
            Small sessions are turning into serious progress.
          </p>
        </div>
        <div className="rounded-2xl border border-[#C98F9F]/20 bg-[#C98F9F]/10 px-5 py-3">
          <div className="text-2xl font-black text-[#C98F9F]">
            {user.streak} days
          </div>
          <div className="text-xs text-zinc-500">Current streak</div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <Clock3 className="mb-5 text-[#C98F9F]" />
            <div className="text-3xl font-black">{user.study_hours}h</div>
            <div className="text-sm text-zinc-500">Total focused learning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Target className="mb-5 text-cyan-400" />
            <div className="text-3xl font-black">68%</div>
            <div className="text-sm text-zinc-500">Weekly goal complete</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <TrendingUp className="mb-5 text-emerald-400" />
            <div className="text-3xl font-black">+14%</div>
            <div className="text-sm text-zinc-500">More than last week</div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-black">Course progress</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {courses.map(([name, value, units]) => (
              <div key={String(name)}>
                <div className="mb-2 flex justify-between">
                  <div>
                    <div className="text-sm font-bold">{name}</div>
                    <div className="text-xs text-zinc-600">{units}</div>
                  </div>
                  <div className="font-black">{value}%</div>
                </div>
                <Progress value={Number(value)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-black">This week</h2>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end justify-between gap-2">
              {[35, 62, 48, 85, 55, 72, 28].map((height, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#252329] to-[#C98F9F]"
                    style={{ height: `${Number(height) * 1.35}px` }}
                  />
                  <span className="text-[10px] text-zinc-600">
                    {"MTWTFSS"[index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-white/[.04] p-3 text-center text-xs text-zinc-400">
              Best day: Thursday · 42 minutes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfilePage({
  user,
  reels,
  onCreate,
  onLogout,
}: {
  user: User;
  reels: Reel[];
  onCreate: () => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState("reels");
  const [editing, setEditing] = useState(false);
  const profileReels = reels.filter((reel) => reel.creator === user.username);
  const highlights = [
    {
      label: "Study time",
      value: `${user.study_hours}h`,
      icon: Clock3,
      color: "from-[#C98F9F] to-[#6B1F3A]",
    },
    {
      label: "Streak",
      value: `${user.streak}d`,
      icon: Flame,
      color: "from-orange-400 to-[#C98F9F]",
    },
    {
      label: "Top subject",
      value: user.interests[0] || "Explore",
      icon: Trophy,
      color: "from-[#252329] to-cyan-400",
    },
    {
      label: "Achievements",
      value: "8",
      icon: Award,
      color: "from-yellow-400 to-[#C98F9F]",
    },
  ];
  const copyProfile = async () => {
    await navigator.clipboard?.writeText(
      `${location.origin}/profile/${user.username}`,
    );
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="rounded-[2rem] border border-[#F7F1EE]/10 bg-gradient-to-br from-[#252329]/35 via-[#0B0B0D] to-[#6B1F3A]/25 p-5 shadow-2xl shadow-[#0B0B0D] sm:p-8">
        <div className="grid gap-7 md:grid-cols-[180px_1fr] md:items-center">
          <div className="relative mx-auto">
            <div className="rounded-full bg-gradient-to-tr from-[#C98F9F] via-[#F7F1EE] to-[#252329] p-1.5">
              <div className="rounded-full bg-[#0B0B0D] p-1">
                <AvatarBlock
                  initials={user.display_name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)}
                  className="size-32 border-0 sm:size-36"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#F7F1EE] px-3 py-1 text-xs font-black text-[#0B0B0D]">
              {user.study_hours}h learned
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black">{user.display_name}</h1>
              <span className="rounded-full border border-[#C98F9F]/30 bg-[#C98F9F]/10 px-3 py-1 text-xs font-bold text-[#C98F9F]">
                Level 8 learner
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              @{user.username} · Building knowledge one scroll at a time
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
              {[
                [profileReels.length, "reels"],
                [183, "study buddies"],
                [282, "following"],
              ].map(([value, label]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-white/[.07] bg-white/[.03] p-3 text-center"
                >
                  <div className="text-xl font-black">{value}</div>
                  <div className="text-[11px] text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="default" onClick={() => setEditing(true)}>
                Edit profile
              </Button>
              <Button variant="secondary" onClick={copyProfile}>
                <Share2 className="size-4" />
                Share profile
              </Button>
              <Button variant="secondary" onClick={() => window.alert("Study buddy discovery is coming soon.")}>
                <UserRound className="size-4" />
                Find study buddies
              </Button>
              <Button variant="secondary" onClick={onLogout}>
                <LogOut className="size-4" />
                Sign out
              </Button>
              <Button variant="ghost" size="icon" onClick={() => window.alert("Profile settings are coming soon.")}>
                <Settings className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-5 overflow-x-auto border-t border-white/[.07] pt-6">
          <button onClick={onCreate} className="w-20 shrink-0 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full border border-dashed border-[#F7F1EE]/40 text-zinc-400 transition hover:border-[#C98F9F] hover:text-[#C98F9F]">
              <Plus />
            </div>
            <div className="mt-2 text-xs font-semibold">New reel</div>
          </button>
          {highlights.map(({ label, value, icon: Icon, color }) => (
            <button key={label} onClick={() => window.alert(`${label}: ${value}`)} className="w-20 shrink-0 text-center">
              <div
                className={`mx-auto rounded-full bg-gradient-to-br ${color} p-[3px]`}
              >
                <div className="grid size-[58px] place-items-center rounded-full bg-[#0B0B0D]">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="mt-2 truncate text-xs font-semibold">{label}</div>
              <div className="text-[10px] text-zinc-600">{value}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
        {user.interests.map((x) => (
          <span
            key={x}
            className="rounded-full border border-[#252329] bg-[#252329]/25 px-3 py-1.5 text-xs font-semibold"
          >
            {x}
          </span>
        ))}
      </div>
      <div className="mt-8 flex justify-center border-b border-white/[.08]">
        {[
          ["reels", Grid3X3, "Reels"],
          ["remixes", Repeat2, "Remixes"],
          ["tagged", UserSquare2, "Tagged"],
        ].map(([id, Icon, label]) => (
          <button
            key={String(id)}
            onClick={() => setTab(String(id))}
            className={`flex min-w-32 items-center justify-center gap-2 border-b-2 px-5 py-4 text-xs font-bold uppercase tracking-wider ${tab === id ? "border-[#C98F9F] text-[#F7F1EE]" : "border-transparent text-zinc-600"}`}
          >
            <Icon className="size-4" />
            {String(label)}
          </button>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {tab === "reels" ? (
          profileReels
            .concat(profileReels)
            .slice(0, 6)
            .map((reel, index) => (
              <button
                key={`${reel.id}-${index}`}
                className={`group relative aspect-square overflow-hidden bg-gradient-to-br ${reel.color}`}
              >
                <div className="absolute inset-0 bg-[#0B0B0D]/10 transition group-hover:bg-transparent" />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#0B0B0D]/70 px-2 py-1 text-[10px] font-bold">
                  <Play className="size-3 fill-current" />
                  {(reel.likes / 1000).toFixed(1)}k
                </div>
                <div className="absolute inset-x-3 bottom-3 line-clamp-2 text-left text-xs font-bold sm:text-sm">
                  {reel.title}
                </div>
              </button>
            ))
        ) : (
          <div className="col-span-3 grid min-h-72 place-items-center text-center">
            <div>
              <Sparkles className="mx-auto mb-3 size-8 text-[#C98F9F]" />
              <h3 className="font-bold">Make this space yours</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Your {tab} learning moments will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogTitle className="text-xl font-black">
            Edit learning profile
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-zinc-500">
            Update how other learners see you.
          </DialogDescription>
          <div className="mt-6 space-y-3">
            <input
              defaultValue={user.display_name}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 text-sm outline-none focus:border-[#C98F9F]"
            />
            <input
              defaultValue={user.username}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 text-sm outline-none focus:border-[#C98F9F]"
            />
            <textarea
              defaultValue="Building knowledge one scroll at a time"
              className="min-h-24 w-full rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm outline-none focus:border-[#C98F9F]"
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="accent" onClick={() => setEditing(false)}>
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  addReel,
  token,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  addReel: (r: Reel) => void;
  token: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("Data structures");
  const [unit, setUnit] = useState("");
  const publish = async () => {
    if (!file || !title) return;
    const body = new FormData();
    body.append("title", title); body.append("course", course); body.append("unit", unit || "General topic"); body.append("file", file);
    const response = await fetch("/api/reels", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
    if (!response.ok) return;
    const result = await response.json();
    addReel(result.reel); setFile(null); setTitle(""); setUnit(""); onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-xl font-black">
          Create a learning reel
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-zinc-500">
          Upload a video and connect it to your university syllabus.
        </DialogDescription>
        <div
          onClick={() => input.current?.click()}
          className="mt-6 grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[.025] text-center hover:border-fuchsia-500/50"
        >
          <input
            ref={input}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div>
            <Upload className="mx-auto mb-3 size-7 text-fuchsia-400" />
            <div className="text-sm font-bold">
              {file ? file.name : "Drop video or click to browse"}
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              MP4, MOV or WebM · up to 200 MB
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reel title"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 text-sm outline-none focus:border-fuchsia-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <select value={course} onChange={(e) => { setCourse(e.target.value); setUnit(""); }} className="h-11 rounded-xl border border-white/10 bg-[#252329] px-3 text-sm">
              <option value="">Choose course</option>
              <option>Data structures</option>
              <option>Operating systems</option>
              <option>Computer science</option>
              <option>Biology</option>
              <option>Chemistry</option>
              <option>Physics</option>
              <option>Mathematics</option>
            </select>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-[#252329] px-3 text-sm">
              <option value="">Choose Category</option>
              <option>Stacks & queues</option>
              <option>Trees & graphs</option>
              <option>Sorting & searching</option>
              <option>Process scheduling</option>
              <option>Memory management</option>
              <option>Exam revision</option>
              <option>Study tips</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="accent" disabled={!file || !title} onClick={publish}>
            Publish reel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(
    localStorage.getItem("syllabite_token") || "",
  );
  const [checking, setChecking] = useState(Boolean(token));
  const [active, setActive] = useState("For you");
  const [following, setFollowing] = useState(
    new Set(["andrew_judah", "os_in_30"]),
  );
  const [liked, setLiked] = useState(new Set<string>());
  const [saved, setSaved] = useState(new Set<string>());
  const [reels, setReels] = useState(initialReels);
  const [upload, setUpload] = useState(false);
  const [search, setSearch] = useState("");
  const sessionSeconds = useRef(0);
  const lastTick = useRef(Date.now());
  const storageKey = user ? `knomo_state_${user.id}` : "";
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (stored) {
        setFollowing(new Set(stored.following || []));
        setLiked(new Set(stored.liked || []));
        setSaved(new Set(stored.saved || []));
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({
      following: [...following], liked: [...liked], saved: [...saved],
    }));
  }, [storageKey, following, liked, saved]);
  useEffect(() => {
    if (!token || !user) return;
    const syncUsage = async (seconds: number) => {
      if (seconds < 1) return;
      const sent = Math.floor(seconds);
      sessionSeconds.current = Math.max(0, sessionSeconds.current - sent);
      try {
        const result = await fetch("/api/me/study", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subject: user.interests[0] || "General study", duration_seconds: sent }),
        });
        if (result.ok) {
          const payload = await result.json();
          setUser((current) => current ? { ...current, study_hours: payload.user.study_hours } : current);
        }
      } catch { /* usage sync retries on the next tick */ }
    };
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible") sessionSeconds.current += Math.max(0, (now - lastTick.current) / 1000);
      lastTick.current = now;
      if (sessionSeconds.current >= 30) void syncUsage(sessionSeconds.current);
    };
    const interval = window.setInterval(tick, 1000);
    const flush = () => { tick(); if (sessionSeconds.current > 0) void syncUsage(sessionSeconds.current); };
    window.addEventListener("beforeunload", flush);
    return () => { window.clearInterval(interval); window.removeEventListener("beforeunload", flush); flush(); };
  }, [token, user?.id]);
  const visible = useMemo(() => {
    const source =
      active === "Saved" ? reels.filter((r) => saved.has(r.id)) : reels;
    const query = search.trim().toLowerCase();
    return query
      ? source.filter((reel) =>
          [reel.title, reel.course, reel.unit, reel.creator, reel.caption].some(
            (value) => value.toLowerCase().includes(query),
          ),
        )
      : source;
  }, [active, reels, saved, search]);
  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((x) => setUser(x.user))
      .catch(() => {
        localStorage.removeItem("syllabite_token");
        setToken("");
      })
      .finally(() => setChecking(false));
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const loadReels = () => fetch("/api/reels", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((payload) => setReels((current) => [...payload.reels, ...current.filter((r) => !payload.reels.some((x: Reel) => x.id === r.id))]))
      .catch(() => undefined);
    void loadReels();
    const interval = window.setInterval(loadReels, 10000);
    return () => window.clearInterval(interval);
  }, [token]);
  const authenticated = (u: User, t: string) => {
    setUser(u);
    setToken(t);
  };
  const logout = () => {
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => undefined);
    localStorage.removeItem("syllabite_token");
    setToken("");
    setUser(null);
  };
  if (checking)
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <BookOpen className="mx-auto mb-3 size-8 animate-pulse text-fuchsia-400" />
          <p className="text-sm text-zinc-500">
            Loading your learning universe...
          </p>
        </div>
      </div>
    );
  if (!user || !token) return <AuthFlow onAuth={authenticated} />;
  if (user.needs_onboarding)
    return <InterestOnboarding user={user} token={token} onDone={setUser} />;
  const toggle = (
    set: Set<string>,
    id: string,
    fn: (s: Set<string>) => void,
  ) => {
    const n = new Set(set);
    n.has(id) ? n.delete(id) : n.add(id);
    fn(n);
  };
  if (active === "Profile")
    return (
      <div>
        <Sidebar active={active} setActive={setActive} onLogout={logout} savedCount={saved.size} />
        <main className="min-h-screen lg:pl-64">
          <Topbar
            openUpload={() => setUpload(true)}
            openProfile={() => setActive("Profile")}
            search={search}
            setSearch={setSearch}
          />
          <ProfilePage
            user={user}
            reels={reels}
            onCreate={() => setUpload(true)}
            onLogout={logout}
          />
        </main>
        <MobileNav active={active} setActive={setActive} />
        <StudyAssistant user={user} />
        <UploadDialog
          open={upload}
          onOpenChange={setUpload}
          addReel={(reel) => setReels([reel, ...reels])}
          token={token}
        />
      </div>
    );
  if (active === "Explore" || active === "Progress")
    return (
      <div>
        <Sidebar active={active} setActive={setActive} onLogout={logout} savedCount={saved.size} />
        <main className="min-h-screen lg:pl-64">
          <Topbar
            openUpload={() => setUpload(true)}
            openProfile={() => setActive("Profile")}
            search={search}
            setSearch={setSearch}
          />
          {active === "Explore" ? (
            <ExplorePage reels={visible} onOpen={() => setUpload(true)} />
          ) : (
            <ProgressPage user={user} />
          )}
        </main>
        <MobileNav active={active} setActive={setActive} />
        <StudyAssistant user={user} />
        <UploadDialog
          open={upload}
          onOpenChange={setUpload}
          addReel={(reel) => setReels([reel, ...reels])}
          token={token}
        />
      </div>
    );
  return (
    <div>
      <Sidebar active={active} setActive={setActive} onLogout={logout} savedCount={saved.size} />
      <main className="min-h-screen lg:pl-64">
        <Topbar
          openUpload={() => setUpload(true)}
          openProfile={() => setActive("Profile")}
          search={search}
          setSearch={setSearch}
        />
        <div className="mx-auto max-w-[1480px] px-4 py-7 lg:px-7">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-fuchsia-400">
                <Sparkles className="size-3" />
                Personalized learning feed
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Good afternoon, {user.display_name.split(" ")[0]}.
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Your {user.interests.slice(0, 3).join(", ")} feed is ready.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setActive("Progress")}>
                <Clock3 className="size-4" />
                {user.study_hours} hours learned
              </Button>
              <Button variant="accent" onClick={() => setUpload(true)}>
                <Plus className="size-4" />
                New reel
              </Button>
            </div>
          </div>
          <CreatorRail
            following={following}
            toggle={(h) => toggle(following, h, setFollowing)}
            user={user}
          />
          <div className="mt-8">
            <section className="mx-auto w-full max-w-3xl space-y-6">
              {visible.length ? (
                visible.map((r) => (
                  <ReelCard
                    key={r.id}
                    reel={r}
                    token={token}
                    liked={liked.has(r.id)}
                    saved={saved.has(r.id)}
                    onLike={() => toggle(liked, r.id, setLiked)}
                    onSave={() => toggle(saved, r.id, setSaved)}
                  />
                ))
              ) : (
                <Card className="p-12 text-center">
                  <Bookmark className="mx-auto mb-3 size-8 text-zinc-700" />
                  <h3 className="font-bold">No saved reels yet</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Bookmark something useful and it will appear here.
                  </p>
                </Card>
              )}
            </section>
          </div>
        </div>
      </main>
      <MobileNav active={active} setActive={setActive} />
      <StudyAssistant user={user} />
      <UploadDialog
        open={upload}
        onOpenChange={setUpload}
        addReel={(r) => setReels([r, ...reels])}
        token={token}
      />
    </div>
  );
}
