const $ = selector =>
    document.querySelector(selector);


const feed = $("#feed");

const stories = $("#stories");


let currentCommentPost = null;

let pendingMedia = null;


/* DEFAULT POSTS */

const defaultPosts = [

    {
        id: 1,

        user: "Ayo",

        initial: "A",

        time: "2h",

        text: "Just enjoying the day ✨",

        media: null,

        likes: 128,

        liked: false,

        bookmarked: false,

        comments: [
            {
                user: "Mia",
                text: "Clean vibe 🔥"
            }
        ]
    },


    {
        id: 2,

        user: "Mia",

        initial: "M",

        time: "5h",

        text: "New day, new energy.",

        media:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",

        mediaType: "image",

        likes: 341,

        liked: false,

        bookmarked: false,

        comments: []
    },


    {
        id: 3,

        user: "Jay",

        initial: "J",

        time: "1d",

        text:
            "What's everybody listening to today?",

        media: null,

        likes: 72,

        liked: false,

        bookmarked: false,

        comments: []
    }

];


let posts =
    JSON.parse(
        localStorage.getItem("pulse_posts")
    ) || defaultPosts;


/* SAVE */

function save() {

    localStorage.setItem(
        "pulse_posts",
        JSON.stringify(posts)
    );
}


/* ESCAPE HTML */

function esc(value) {

    return String(value).replace(
        /[&<>"']/g,

        character => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        }[character])
    );
}


/* TOAST */

function toast(message) {

    const toastBox = $("#toast");

    toastBox.textContent = message;

    toastBox.classList.add("show");


    setTimeout(() => {

        toastBox.classList.remove("show");

    }, 1800);
}


/* STORIES */

function renderStories() {

    const names = [

        "Your story",

        "Aisha",

        "David",

        "Tobi",

        "Maya",

        "Chris",

        "Zara"

    ];


    stories.innerHTML = names.map(

        (name, index) => `

        <div class="story">

            <div class="story-avatar">

                <div>
                    ${index === 0
                        ? "+"
                        : esc(name[0])}
                </div>

            </div>

            ${esc(name)}

        </div>

        `

    ).join("");
}


/* FEED */

function renderFeed() {

    feed.innerHTML = posts.map(post => `

        <article
            class="post"
            data-id="${post.id}"
        >

            <div class="post-head">

                <div class="post-avatar">

                    ${esc(post.initial)}

                </div>


                <div>

                    <div class="post-user">

                        ${esc(post.user)}

                    </div>


                    <div class="post-time">

                        ${esc(post.time)}

                    </div>

                </div>


                <button class="more">

                    •••

                </button>

            </div>


            ${
                post.text

                ?

                `
                <div class="post-text">

                    ${esc(post.text)}

                </div>
                `

                :

                ""
            }


            ${
                post.media

                ?

                post.mediaType === "video"

                ?

                `
                <video
                    class="post-media"
                    src="${post.media}"
                    controls
                    playsinline>
                </video>
                `

                :

                `
                <img
                    class="post-media"
                    src="${post.media}"
                    alt="Post media">
                `

                :

                ""
            }


            <div class="post-actions">


                <button
                    class="action ${post.liked ? "liked" : ""}"
                    data-action="like">

                    ♡

                    <span>

                        ${post.likes}

                    </span>

                </button>


                <button
                    class="action"
                    data-action="comment">

                    ◯

                    <span>

                        ${post.comments.length}

                    </span>

                </button>


                <button
                    class="action"
                    data-action="share">

                    ↗

                </button>


                <button
                    class="action ${post.bookmarked ? "bookmarked" : ""}"
                    data-action="save"
                    style="margin-left:auto">

                    🔖

                </button>


            </div>


            <div class="post-info">

                <div class="likes">

                    ${post.likes.toLocaleString()}
                    likes

                </div>


                <div class="caption">

                    <b>

                        ${esc(post.user)}

                    </b>

                    ${esc(post.text || "")}

                </div>


                ${
                    post.comments.length

                    ?

                    `
                    <button
                        class="view-comments"
                        data-action="comment">

                        View all
                        ${post.comments.length}
                        comments

                    </button>
                    `

                    :

                    ""
                }

            </div>

        </article>

    `).join("");
}


/* FEED BUTTONS */

feed.addEventListener(

    "click",

    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) return;


        const postElement =
            button.closest(".post");


        const id =
            Number(
                postElement.dataset.id
            );


        const post =
            posts.find(
                item => item.id === id
            );


        const action =
            button.dataset.action;


        /* LIKE */

        if (action === "like") {

            post.liked =
                !post.liked;


            post.likes +=
                post.liked
                    ? 1
                    : -1;


            save();

            renderFeed();
        }


        /* SAVE */

        if (action === "save") {

            post.bookmarked =
                !post.bookmarked;


            save();

            renderFeed();


            toast(
                post.bookmarked
                    ? "Saved"
                    : "Removed from saved"
            );
        }


        /* COMMENT */

        if (action === "comment") {

            openComments(id);
        }


        /* SHARE */

        if (action === "share") {

            if (navigator.clipboard) {

                navigator.clipboard
                    .writeText(location.href);
            }


            toast("Post link copied");
        }

    }

);


/* OPEN POST */

function openPostModal() {

    $("#postModal")
        .classList
        .remove("hidden");


    $("#postText").focus();
}


/* CLOSE POST */

function closePostModal() {

    $("#postModal")
        .classList
        .add("hidden");


    $("#postText").value = "";


    $("#mediaPreview")
        .innerHTML = "";


    $("#mediaPreview")
        .classList
        .add("hidden");


    pendingMedia = null;


    $("#mediaInput").value = "";
}


/* POST BUTTONS */

$("#openComposer")
    .onclick = openPostModal;


$("#navCreate")
    .onclick = openPostModal;


$("#quickMedia")
    .onclick = openPostModal;


$("#closeModal")
    .onclick = closePostModal;


/* CLOSE MODAL WHEN CLICKING BACKGROUND */

$("#postModal").addEventListener(

    "click",

    event => {

        if (
            event.target.id ===
            "postModal"
        ) {

            closePostModal();
        }

    }

);


/* MEDIA UPLOAD */

$("#mediaInput").addEventListener(

    "change",

    event => {

        const file =
            event.target.files[0];


        if (!file) return;


        /* LIMIT */

        if (
            file.size >
            15 * 1024 * 1024
        ) {

            toast(
                "Use a file under 15MB"
            );


            event.target.value = "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload = () => {

            pendingMedia = {

                data: reader.result,

                type:
                    file.type.startsWith(
                        "video/"
                    )

                    ?

                    "video"

                    :

                    "image"

            };


            const preview =
                $("#mediaPreview");


            preview.classList
                .remove("hidden");


            if (
                pendingMedia.type ===
                "video"
            ) {

                preview.innerHTML = `

                    <video
                        src="${pendingMedia.data}"
                        controls>
                    </video>

                `;

            }

            else {

                preview.innerHTML = `

                    <img
                        src="${pendingMedia.data}"
                        alt="Preview">

                `;

            }

        };


        reader.readAsDataURL(file);

    }

);


/* PUBLISH */

$("#publishBtn").onclick = () => {

    const text =
        $("#postText")
        .value
        .trim();


    if (
        !text &&
        !pendingMedia
    ) {

        toast(
            "Add text or a photo/video"
        );

        return;
    }


    posts.unshift({

        id: Date.now(),

        user: "You",

        initial: "P",

        time: "now",

        text: text,

        media:
            pendingMedia
                ?.data || null,

        mediaType:
            pendingMedia
                ?.type || null,

        likes: 0,

        liked: false,

        bookmarked: false,

        comments: []

    });


    save();

    renderFeed();

    closePostModal();


    toast(
        "Posted successfully"
    );

};


/* OPEN COMMENTS */

function openComments(id) {

    currentCommentPost = id;


    const post =
        posts.find(
            item => item.id === id
        );


    if (post.comments.length) {

        $("#commentsList").innerHTML =
            post.comments.map(

                comment => `

                <div class="comment">

                    <div class="comment-avatar">

                        ${esc(
                            comment.user[0]
                        )}

                    </div>


                    <div>

                        <p>

                            <b>
                                ${esc(
                                    comment.user
                                )}
                            </b>

                            ${esc(
                                comment.text
                            )}

                        </p>


                        <small>
                            Just now
                        </small>

                    </div>

                </div>

                `

            ).join("");

    }

    else {

        $("#commentsList").innerHTML = `

            <div class="empty">

                No comments yet.
                Be the first.

            </div>

        `;

    }


    $("#commentsModal")
        .classList
        .remove("hidden");
}


/* CLOSE COMMENTS */

$("#closeComments").onclick = () => {

    $("#commentsModal")
        .classList
        .add("hidden");

};


/* SEND COMMENT */

$("#sendComment").onclick = () => {

    const input =
        $("#commentInput");


    const text =
        input.value.trim();


    if (
        !text ||
        currentCommentPost === null
    ) return;


    const post =
        posts.find(
            item =>
                item.id ===
                currentCommentPost
        );


    post.comments.push({

        user: "You",

        text: text

    });


    input.value = "";


    save();


    openComments(
        currentCommentPost
    );


    renderFeed();

};


/* ENTER TO COMMENT */

$("#commentInput")
    .addEventListener(

        "keydown",

        event => {

            if (
                event.key ===
                "Enter"
            ) {

                $("#sendComment").click();

            }

        }

    );


/* EMOJI */

$("#emojiBtn").onclick = () => {

    const textarea =
        $("#postText");


    textarea.setRangeText(

        " ❤️ ✨ 🔥 ",

        textarea.selectionStart,

        textarea.selectionEnd,

        "end"

    );

};


/* SEARCH */

$("#searchBtn").onclick = () => {

    toast(
        "Search UI is ready"
    );

};


/* MESSAGES */

$("#messagesBtn").onclick = () => {

    toast(
        "Messages UI is ready"
    );

};


/* NAVIGATION */

document
    .querySelectorAll(
        ".nav-item[data-tab]"
    )
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(
                    ".nav-item"
                )
                .forEach(item =>
                    item.classList
                        .remove("active")
                );


            button.classList
                .add("active");


            if (
                button.dataset.tab ===
                "profile"
            ) {

                toast(
                    "Profile page coming next"
                );

            }


            if (
                button.dataset.tab ===
                "explore"
            ) {

                toast(
                    "Explore page coming next"
                );

            }


            if (
                button.dataset.tab ===
                "notifications"
            ) {

                toast(
                    "No new notifications"
                );

            }

        };

    });


/* START WEBSITE */

renderStories();

renderFeed();