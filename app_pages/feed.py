import json
import random
import time
import uuid
from pathlib import Path

import streamlit as st


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SYLLABUS = ROOT / "data" / "sample_syllabus.json"
FEATURED_VIDEO = ROOT / "assets" / "videos" / "featured-space-facts.mp4"


@st.cache_data
def load_default_syllabus() -> dict:
    return json.loads(DEFAULT_SYLLABUS.read_text(encoding="utf-8"))


def initialize_state() -> None:
    defaults = {
        "syllabus": load_default_syllabus(),
        "liked": set(),
        "saved": set(),
        "completed": set(),
        "streak": 7,
        "feed_seed": 42,
        "active_nav": "For you",
        "following": {"stack_sensei", "os_in_30"},
        "uploaded_posts": [],
        "learning_seconds": 0.0,
        "last_seen": time.time(),
        "profile_name": "Alex Morgan",
        "profile_handle": "alexlearns",
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)
    now = time.time()
    st.session_state.learning_seconds += min(max(now - st.session_state.last_seen, 0), 60)
    st.session_state.last_seen = now


def all_posts(syllabus: dict) -> list[dict]:
    posts = [
        {
            "id": "featured-space-facts",
            "type": "reel",
            "label": "Featured",
            "featured": True,
            "badge": "red",
            "creator": "andrew_judah",
            "creator_name": "Andrew Judah",
            "duration": "Featured video",
            "hook": "The 5 scariest space facts",
            "body": "A journey through five unsettling facts about the universe and what waits beyond our world.",
            "caption": "Featured by Andrew Judah · Space science reel",
            "likes": 2841,
            "video_path": str(FEATURED_VIDEO),
            "course": "Featured learning",
            "course_code": "SPACE",
            "unit": "Astronomy",
            "accent": "red",
        }
    ]
    posts.extend(st.session_state.get("uploaded_posts", []))
    for course in syllabus.get("courses", []):
        for unit in course.get("units", []):
            for item in unit.get("content", []):
                posts.append(
                    {
                        **item,
                        "course": course["name"],
                        "course_code": course["code"],
                        "unit": unit["title"],
                        "accent": course.get("accent", "violet"),
                    }
                )
    return posts


def upload_syllabus() -> None:
    uploaded = st.file_uploader(
        "Upload syllabus JSON",
        type=["json"],
        help="Use the sample file structure in data/sample_syllabus.json.",
    )
    if uploaded:
        try:
            data = json.load(uploaded)
            if not data.get("courses"):
                raise ValueError("The file needs a non-empty 'courses' list.")
            st.session_state.syllabus = data
            st.session_state.completed = set()
            st.success("Syllabus loaded", icon=":material/check_circle:")
        except (json.JSONDecodeError, ValueError) as exc:
            st.error(f"Could not load syllabus: {exc}", icon=":material/error:")


def render_sidebar(syllabus: dict) -> tuple[str, list[str]]:
    with st.sidebar:
        st.title("Syllabite")
        st.caption("Learn in your scroll.")

        nav = st.segmented_control(
            "Explore",
            ["For you", "Saved", "Progress", "Profile"],
            default=st.session_state.active_nav,
            key="nav_control",
        )
        st.session_state.active_nav = nav or "For you"

        st.subheader(syllabus.get("university", "My university"))
        st.caption(syllabus.get("program", "Degree syllabus"))

        course_names = [course["name"] for course in syllabus.get("courses", [])]
        selected = st.multiselect(
            "Courses",
            course_names,
            default=course_names,
            placeholder="Choose courses",
        )

        with st.expander("Change syllabus", icon=":material/upload_file:"):
            upload_syllabus()
            if st.button("Restore sample", icon=":material/restart_alt:"):
                st.session_state.syllabus = load_default_syllabus()
                st.rerun()

        st.space("small")
        st.caption("Prototype · Content can be connected to a CMS or AI generator.")
    return st.session_state.active_nav, selected


def render_creator_row(posts: list[dict]) -> None:
    st.subheader("Creators to follow")
    creators = list(dict.fromkeys(post.get("creator", "syllabite") for post in posts))[:5]
    columns = st.columns(min(len(creators), 5))
    for column, creator in zip(columns, creators):
        with column.container(border=True, height="stretch"):
            st.markdown(":material/account_circle:")
            st.markdown(f"**@{creator}**")
            following = creator in st.session_state.following
            if st.button(
                "Following" if following else "Follow",
                type="secondary" if following else "primary",
                key=f"follow_{creator}",
                width="stretch",
            ):
                toggle_set("following", creator)
                st.rerun()


@st.dialog("Upload a video reel", icon=":material/video_call:", width="large")
def upload_reel_dialog(syllabus: dict) -> None:
    courses = syllabus.get("courses", [])
    if not courses:
        st.warning("Load a syllabus before uploading a reel.")
        return
    with st.form("upload_reel_form"):
        video = st.file_uploader("Video", type=["mp4", "mov", "webm", "m4v"])
        title = st.text_input("Reel hook", placeholder="Explain the concept in one irresistible line")
        caption = st.text_area("Caption", placeholder="Key takeaway and hashtags")
        course_code = st.selectbox(
            "Course",
            [course["code"] for course in courses],
            format_func=lambda code: next(
                f"{course['code']} · {course['name']}" for course in courses if course["code"] == code
            ),
        )
        course = next(course for course in courses if course["code"] == course_code)
        units = [unit["title"] for unit in course.get("units", [])] or ["General"]
        unit = st.selectbox("Syllabus unit", units)
        submitted = st.form_submit_button("Publish reel", icon=":material/publish:", type="primary")
    if submitted:
        if not video or not title.strip():
            st.error("Add a video and a reel hook before publishing.")
            return
        st.session_state.uploaded_posts.insert(
            0,
            {
                "id": f"upload-{uuid.uuid4().hex}",
                "type": "reel",
                "badge": "violet",
                "creator": st.session_state.profile_handle,
                "duration": "Video reel",
                "hook": title.strip(),
                "body": "A student-created reel mapped directly to the university syllabus.",
                "caption": caption.strip(),
                "likes": 0,
                "video_bytes": video.getvalue(),
                "video_type": video.type,
                "course": course["name"],
                "course_code": course["code"],
                "unit": unit,
                "accent": course.get("accent", "violet"),
            },
        )
        st.toast("Your reel is live", icon=":material/check_circle:")
        st.rerun()


def toggle_set(name: str, post_id: str) -> None:
    bucket = st.session_state[name]
    if post_id in bucket:
        bucket.remove(post_id)
    else:
        bucket.add(post_id)


def render_post(post: dict) -> None:
    post_id = post["id"]
    completed = post_id in st.session_state.completed
    with st.container(border=True, key=f"post_{post_id}"):
        top_left, top_right = st.columns([5, 1], vertical_alignment="center")
        with top_left:
            st.markdown(f"**{post['course_code']} · {post['unit']}**")
            creator = post.get("creator_name", f"@{post.get('creator', 'syllabite')}")
            st.caption(f"By {creator} · {post.get('duration', '30 sec')}")
        with top_right:
            st.badge(post.get("label", post["type"].capitalize()), color=post.get("badge", "violet"))

        if post.get("image"):
            st.image(post["image"], caption=post.get("image_caption", ""), width="stretch")
        if post.get("video_bytes"):
            st.video(post["video_bytes"], format=post.get("video_type", "video/mp4"), autoplay=False)
        elif post.get("video_path"):
            st.video(
                post["video_path"],
                format="video/mp4",
                autoplay=bool(post.get("featured")),
                muted=bool(post.get("featured")),
            )

        st.subheader(post["hook"])
        st.write(post["body"])

        if post["type"] == "reel":
            with st.expander("Watch the 30-second lesson", icon=":material/play_circle:"):
                for index, beat in enumerate(post.get("beats", []), start=1):
                    st.markdown(f"**{index}.** {beat}")
                st.caption("A production version can render these beats as vertical video.")
        elif post["type"] == "quiz":
            answer = st.segmented_control(
                post["question"],
                post["options"],
                key=f"quiz_{post_id}",
                label_visibility="visible",
            )
            if answer:
                if answer == post["answer"]:
                    st.success("Exactly right — +10 XP", icon=":material/check_circle:")
                    st.session_state.completed.add(post_id)
                else:
                    st.warning(post["explanation"], icon=":material/lightbulb:")

        st.caption(post.get("caption", ""))
        with st.container(horizontal=True, vertical_alignment="center"):
            liked = post_id in st.session_state.liked
            if st.button(
                str(post.get("likes", 0) + int(liked)),
                icon=":material/favorite:" if liked else ":material/favorite_border:",
                key=f"like_{post_id}",
                help="Like",
            ):
                toggle_set("liked", post_id)
                st.rerun()
            saved = post_id in st.session_state.saved
            if st.button(
                "Saved" if saved else "Save",
                icon=":material/bookmark:" if saved else ":material/bookmark_border:",
                key=f"save_{post_id}",
            ):
                toggle_set("saved", post_id)
                st.toast("Collection updated", icon=":material/bookmark:")
                st.rerun()
            if post["type"] != "quiz" and st.button(
                "Done" if completed else "Mark learned",
                icon=":material/check_circle:" if completed else ":material/done:",
                key=f"done_{post_id}",
            ):
                toggle_set("completed", post_id)
                st.rerun()


def render_progress(posts: list[dict]) -> None:
    total = max(1, len(posts))
    done = len({post["id"] for post in posts} & st.session_state.completed)
    st.title("Your learning progress")
    st.progress(done / total, text=f"{done} of {total} learning moments completed")
    cols = st.columns(3)
    cols[0].metric("Current streak", f"{st.session_state.streak} days")
    cols[1].metric("XP earned", done * 10)
    cols[2].metric("Saved", len(st.session_state.saved))

    for course in st.session_state.syllabus.get("courses", []):
        course_posts = [post for post in posts if post["course_code"] == course["code"]]
        course_done = len({p["id"] for p in course_posts} & st.session_state.completed)
        with st.container(border=True):
            st.subheader(f"{course['code']} · {course['name']}")
            st.progress(course_done / max(1, len(course_posts)))
            st.caption(f"{course_done}/{len(course_posts)} moments completed")


def render_profile(posts: list[dict]) -> None:
    hours = st.session_state.learning_seconds / 3600
    profile, stats = st.columns([1, 2], vertical_alignment="center")
    with profile.container(horizontal_alignment="center"):
        st.markdown(":material/account_circle:")
        st.title(st.session_state.profile_name, text_alignment="center")
        st.caption(f"@{st.session_state.profile_handle} · university learner")
    with stats:
        stat_cols = st.columns(3)
        stat_cols[0].metric("Learning time", f"{hours:.2f} h")
        stat_cols[1].metric("Following", len(st.session_state.following))
        stat_cols[2].metric("Reels posted", len(st.session_state.uploaded_posts))
        st.caption("Learning time counts active app use and pauses after inactivity.")

    st.subheader("Your learning identity")
    with st.container(border=True):
        st.text_input("Display name", key="profile_name")
        st.text_input("Username", key="profile_handle")
        st.progress(
            min(st.session_state.learning_seconds / (5 * 3600), 1.0),
            text=f"{hours:.2f} of 5 weekly hours",
        )

    st.subheader("Your reels")
    if not st.session_state.uploaded_posts:
        st.info("You have not posted a reel yet.", icon=":material/video_library:")
    for post in st.session_state.uploaded_posts:
        render_post(post)


def render_context_panel(posts: list[dict]) -> None:
    with st.container(border=True):
        st.markdown("**Daily goal**")
        learned = len(st.session_state.completed)
        st.progress(min(learned / 3, 1.0), text=f"{min(learned, 3)}/3 moments")
        st.caption("Finish three moments to keep your streak alive.")
    with st.container(border=True):
        st.markdown("**Trending in your course**")
        for post in sorted(posts, key=lambda item: item.get("likes", 0), reverse=True)[:3]:
            st.markdown(f"**{post['hook']}**")
            st.caption(f"{post['course_code']} · {post.get('likes', 0)} likes")
    with st.container(border=True):
        st.markdown("**Study buddy challenge**")
        st.write("Complete 5 moments before Friday.")
        st.button("Invite a friend", icon=":material/group_add:", width="stretch")


def render_feed() -> None:
    initialize_state()
    syllabus = st.session_state.syllabus
    nav, selected_courses = render_sidebar(syllabus)
    posts = [
        post
        for post in all_posts(syllabus)
        if post.get("featured") or post["course"] in selected_courses
    ]

    if nav == "Progress":
        render_progress(posts)
        return
    if nav == "Profile":
        render_profile(posts)
        return
    if nav == "Saved":
        posts = [post for post in posts if post["id"] in st.session_state.saved]

    header, action = st.columns([5, 1], vertical_alignment="center")
    with header:
        st.title("Good afternoon, learner")
        st.caption("Short lessons. Real syllabus. Zero boring scrolls.")
    with action:
        if st.button("Upload reel", icon=":material/video_call:", type="primary", width="stretch"):
            upload_reel_dialog(syllabus)

    if not posts:
        st.info("Nothing here yet. Select a course or save a post from the For you feed.", icon=":material/inbox:")
        return

    featured_posts = [post for post in posts if post.get("featured")]
    regular_posts = [post for post in posts if not post.get("featured")]
    random.Random(st.session_state.feed_seed).shuffle(regular_posts)
    posts = featured_posts + regular_posts
    render_creator_row(posts)
    feed_col, context_col = st.columns([1.75, 1], gap="large")
    with feed_col:
        for post in posts:
            render_post(post)
    with context_col:
        render_context_panel(posts)
