// ============================================================
// MARKETING NLP LAB — VERSION 2
// ============================================================

let sentimentChart = null;
let ratingChart = null;
let topicChart = null;
let keywordChart = null;

let reviewData = [];
let analysisData = null;


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();

    setupHamburger();

    setupDatasetUpload();

    setupReviewFilters();

    setupSingleAnalyzer();

    setupRefresh();

    checkBackend();

});


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    navigateTo(
                        item.dataset.section
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-section-target]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    navigateTo(
                        button.dataset.sectionTarget
                    );

                }
            );

        });

}


function navigateTo(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const target =
        document.getElementById(sectionId);


    if (!target) return;


    target.classList.add("active");


    document
        .querySelectorAll(".menu-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );

        });


    const activeMenu =
        document.querySelector(
            `.menu-item[data-section="${sectionId}"]`
        );


    const title =
        activeMenu
            ? activeMenu.querySelector("span").textContent
            : sectionId;


    const breadcrumb =
        document.getElementById(
            "breadcrumbTitle"
        );


    if (breadcrumb) {

        breadcrumb.textContent = title;

    }


    closeMobileSidebar();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// HAMBURGER
// ============================================================

function setupHamburger() {

    const hamburger =
        document.getElementById("hamburger");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");


    if (!hamburger || !sidebar || !overlay) {
        return;
    }


    hamburger.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

            overlay.classList.toggle(
                "active"
            );

        }
    );


    overlay.addEventListener(
        "click",
        closeMobileSidebar
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMobileSidebar();

            }

        }
    );

}


function closeMobileSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove("open");

    }


    if (overlay) {

        overlay.classList.remove("active");

    }

}


// ============================================================
// DATASET UPLOAD
// ============================================================

function setupDatasetUpload() {

    const fileInput =
        document.getElementById("csvFile");

    const fileName =
        document.getElementById("fileName");

    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (!fileInput || !analyzeButton) {
        return;
    }


    fileInput.addEventListener(
        "change",
        () => {

            if (fileInput.files.length > 0) {

                fileName.textContent =
                    fileInput.files[0].name;

            } else {

                fileName.textContent =
                    "Choose CSV file";

            }

        }
    );


    analyzeButton.addEventListener(
        "click",
        analyzeDataset
    );

}


// ============================================================
// ANALYZE CSV
// ============================================================

async function analyzeDataset() {

    const fileInput =
        document.getElementById(
            "csvFile"
        );

    const message =
        document.getElementById(
            "uploadMessage"
        );


    if (!fileInput.files.length) {

        message.textContent =
            "Please choose a CSV file first.";

        return;

    }


    const file =
        fileInput.files[0];


    message.textContent =
        "Analyzing customer feedback, topics and keywords...";


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    try {

        const response =
            await fetch(
                "/api/marketing/analyze-csv",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to analyze dataset."
            );

        }


        analysisData = data;

        reviewData =
            data.reviews || [];


        updateDashboard(data);


        message.textContent =
            `Analysis complete — ${formatNumber(data.total_reviews)} reviews processed.`;


        navigateTo("overview");


    } catch (error) {

        console.error(error);

        message.textContent =
            "Error: " + error.message;

    }

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(data) {

    setText(
        "totalReviews",
        formatNumber(data.total_reviews)
    );


    setText(
        "positivePercentage",
        `${data.positive_percentage}%`
    );


    setText(
        "negativePercentage",
        `${data.negative_percentage}%`
    );


    setText(
        "averageRating",
        data.average_rating !== null
            ? `${data.average_rating} / 5`
            : "N/A"
    );


    createSentimentChart(
        data.sentiment_distribution
    );


    createRatingChart(
        reviewData
    );


    renderOverviewReviews(
        reviewData.slice(0, 5)
    );


    renderReviewTable(
        reviewData
    );


    renderSentimentBreakdown(
        data
    );


    renderTopics(
        data.topics || []
    );


    renderKeywords(
        data.keywords || []
    );


    renderSentimentKeywords(
        data.positive_keywords || [],
        data.negative_keywords || []
    );


    generateQuickInsights(
        data
    );


    renderBusinessInsights(
        data.business_insights || []
    );

}


// ============================================================
// SENTIMENT CHART
// ============================================================

function createSentimentChart(
    distribution
) {

    const canvas =
        document.getElementById(
            "sentimentChart"
        );


    if (!canvas) return;


    if (sentimentChart) {

        sentimentChart.destroy();

    }


    sentimentChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Positive",
                        "Neutral",
                        "Negative"
                    ],

                    datasets: [{

                        data: [

                            distribution.Positive || 0,

                            distribution.Neutral || 0,

                            distribution.Negative || 0

                        ],

                        backgroundColor: [
                            "#35a875",
                            "#94a3b8",
                            "#d65c5c"
                        ],

                        borderWidth: 0

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                usePointStyle: true,

                                padding: 18,

                                font: {
                                    size: 12
                                }

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// RATING CHART
// ============================================================

function createRatingChart(
    reviews
) {

    const canvas =
        document.getElementById(
            "ratingChart"
        );


    if (!canvas) return;


    const ratings = {

        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0

    };


    reviews.forEach(
        review => {

            const rating =
                Number(review.rating);


            if (
                ratings[rating] !== undefined
            ) {

                ratings[rating]++;

            }

        }
    );


    if (ratingChart) {

        ratingChart.destroy();

    }


    ratingChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "1 Star",
                        "2 Stars",
                        "3 Stars",
                        "4 Stars",
                        "5 Stars"
                    ],

                    datasets: [{

                        data: [

                            ratings[1],
                            ratings[2],
                            ratings[3],
                            ratings[4],
                            ratings[5]

                        ],

                        backgroundColor:
                            "#315efb",

                        borderRadius: 5

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// TOPIC INTELLIGENCE
// ============================================================

function renderTopics(topics) {

    renderTopicChart(topics);

    renderTopicSummary(topics);

    renderTopicCards(topics);

}


function renderTopicChart(topics) {

    const canvas =
        document.getElementById(
            "topicChart"
        );


    if (!canvas) return;


    if (topicChart) {

        topicChart.destroy();

    }


    if (!topics.length) {

        return;

    }


    topicChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        topics.map(
                            topic => topic.name
                        ),

                    datasets: [{

                        label:
                            "Mentions",

                        data:
                            topics.map(
                                topic =>
                                    topic.mentions
                            ),

                        backgroundColor:
                            "#315efb",

                        borderRadius: 6

                    }]

                },

                options: {

                    indexAxis: "y",

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


function renderTopicSummary(topics) {

    const container =
        document.getElementById(
            "topicSummary"
        );


    if (!container) return;


    if (!topics.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-layer-group"></i>
                <p>Not enough text data to discover topics.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        topics
            .slice(0, 5)
            .map(
                topic => `

                    <div class="insight-item">

                        <div class="insight-icon">
                            <i class="fa-solid fa-layer-group"></i>
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(topic.name)}
                            </strong>

                            <p>
                                ${topic.mentions} mentions
                                · ${topic.percentage}% of reviews
                                · ${sentimentBadge(topic.sentiment)}
                            </p>

                        </div>

                    </div>

                `
            )
            .join("");

}


function renderTopicCards(topics) {

    const container =
        document.getElementById(
            "topicCards"
        );


    if (!container) return;


    if (!topics.length) {

        container.innerHTML = "";

        return;

    }


    container.innerHTML =
        topics
            .map(
                topic => `

                    <div class="panel">

                        <div class="panel-header">

                            <div>

                                <h2>
                                    ${escapeHTML(topic.name)}
                                </h2>

                                <p>
                                    ${topic.mentions}
                                    customer mentions
                                </p>

                            </div>

                            ${sentimentBadge(
                                topic.sentiment
                            )}

                        </div>


                        <div class="metric-list">

                            <div class="metric-row">

                                <span>
                                    Conversation Share
                                </span>

                                <strong>
                                    ${topic.percentage}%
                                </strong>

                            </div>


                            <div class="metric-row">

                                <span>
                                    Sentiment Score
                                </span>

                                <strong>
                                    ${topic.sentiment_score}
                                </strong>

                            </div>

                        </div>


                        <div
                            class="keyword-cloud"
                            style="margin-top:15px;"
                        >

                            ${topic.keywords
                                .map(
                                    keyword =>
                                        `<span class="keyword">${escapeHTML(keyword)}</span>`
                                )
                                .join("")
                            }

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// KEYWORD INTELLIGENCE
// ============================================================

function renderKeywords(keywords) {

    renderKeywordChart(keywords);

    renderKeywordTable(keywords);

}


function renderKeywordChart(keywords) {

    const canvas =
        document.getElementById(
            "keywordChart"
        );


    if (!canvas) return;


    if (keywordChart) {

        keywordChart.destroy();

    }


    if (!keywords.length) return;


    const topKeywords =
        keywords.slice(0, 12);


    keywordChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        topKeywords.map(
                            item =>
                                item.keyword
                        ),

                    datasets: [{

                        label:
                            "Frequency",

                        data:
                            topKeywords.map(
                                item =>
                                    item.frequency
                            ),

                        backgroundColor:
                            "#315efb",

                        borderRadius: 6

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


function renderKeywordTable(keywords) {

    const tbody =
        document.getElementById(
            "keywordTableBody"
        );


    if (!tbody) return;


    if (!keywords.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No keywords could be extracted.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        keywords
            .slice(0, 25)
            .map(
                item => {

                    const sentiment =
                        getKeywordSentiment(
                            item
                        );


                    return `

                        <tr>

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        item.keyword
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${item.frequency}
                            </td>

                            <td>
                                ${item.positive}
                            </td>

                            <td>
                                ${item.neutral}
                            </td>

                            <td>
                                ${item.negative}
                            </td>

                            <td>
                                ${sentimentBadge(
                                    sentiment
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


function getKeywordSentiment(item) {

    if (
        item.positive >
        item.negative
    ) {

        return "Positive";

    }


    if (
        item.negative >
        item.positive
    ) {

        return "Negative";

    }


    return "Neutral";

}


// ============================================================
// SENTIMENT KEYWORDS
// ============================================================

function renderSentimentKeywords(
    positiveKeywords,
    negativeKeywords
) {

    const positiveContainer =
        document.getElementById(
            "positiveKeywords"
        );


    const negativeContainer =
        document.getElementById(
            "negativeKeywords"
        );


    if (positiveContainer) {

        positiveContainer.innerHTML =
            positiveKeywords.length

                ? positiveKeywords
                    .map(
                        item =>
                            `<span class="keyword">
                                ${escapeHTML(item.keyword)}
                                <small>(${item.frequency})</small>
                            </span>`
                    )
                    .join("")

                : `<span class="keyword-placeholder">
                    No positive keywords found.
                  </span>`;

    }


    if (negativeContainer) {

        negativeContainer.innerHTML =
            negativeKeywords.length

                ? negativeKeywords
                    .map(
                        item =>
                            `<span class="keyword">
                                ${escapeHTML(item.keyword)}
                                <small>(${item.frequency})</small>
                            </span>`
                    )
                    .join("")

                : `<span class="keyword-placeholder">
                    No negative keywords found.
                  </span>`;

    }

}


// ============================================================
// OVERVIEW REVIEWS
// ============================================================

function renderOverviewReviews(
    reviews
) {

    const container =
        document.getElementById(
            "overviewReviews"
        );


    if (!container) return;


    if (!reviews.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-comments"></i>
                <p>No reviews available.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        reviews
            .map(
                review => `

                    <div class="insight-item">

                        <div class="insight-icon">
                            <i class="fa-regular fa-comment"></i>
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    review.customer ||
                                    "Customer"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    review.review
                                )}
                            </p>

                            ${sentimentBadge(
                                review.sentiment
                            )}

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// REVIEW TABLE
// ============================================================

function renderReviewTable(
    reviews
) {

    const tbody =
        document.getElementById(
            "reviewTableBody"
        );


    if (!tbody) return;


    if (!reviews.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-empty">
                    No reviews available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        reviews
            .map(
                review => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                review.customer ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                review.product ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${renderStars(
                                review.rating
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                review.review
                            )}
                        </td>

                        <td>
                            ${sentimentBadge(
                                review.sentiment
                            )}
                        </td>

                        <td>
                            ${Number(
                                review.compound || 0
                            ).toFixed(3)}
                        </td>

                    </tr>

                `
            )
            .join("");

}


// ============================================================
// FILTERS
// ============================================================

function setupReviewFilters() {

    const search =
        document.getElementById(
            "reviewSearch"
        );

    const sentiment =
        document.getElementById(
            "sentimentFilter"
        );

    const rating =
        document.getElementById(
            "ratingFilter"
        );


    [
        search,
        sentiment,
        rating
    ].forEach(
        element => {

            if (!element) return;

            element.addEventListener(
                "input",
                applyFilters
            );

            element.addEventListener(
                "change",
                applyFilters
            );

        }
    );

}


function applyFilters() {

    const search =
        document
            .getElementById(
                "reviewSearch"
            )
            .value
            .toLowerCase();


    const sentiment =
        document.getElementById(
            "sentimentFilter"
        ).value;


    const rating =
        document.getElementById(
            "ratingFilter"
        ).value;


    const filtered =
        reviewData.filter(
            review => {

                const text =
                    String(
                        review.review || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                const matchesSentiment =
                    sentiment === "all" ||
                    review.sentiment === sentiment;


                const matchesRating =
                    rating === "all" ||
                    String(
                        review.rating
                    ) === rating;


                return (
                    matchesSearch &&
                    matchesSentiment &&
                    matchesRating
                );

            }
        );


    renderReviewTable(
        filtered
    );

}


// ============================================================
// SENTIMENT BREAKDOWN
// ============================================================

function renderSentimentBreakdown(
    data
) {

    const container =
        document.getElementById(
            "sentimentBreakdown"
        );


    if (!container) return;


    const items = [

        {
            name: "Positive",
            value: data.positive_percentage,
            className: "positive"
        },

        {
            name: "Neutral",
            value: data.neutral_percentage,
            className: "neutral"
        },

        {
            name: "Negative",
            value: data.negative_percentage,
            className: "negative"
        }

    ];


    container.innerHTML =
        items
            .map(
                item => `

                    <div class="metric-row">

                        <span>
                            ${item.name}
                        </span>

                        <div class="metric-track">

                            <div
                                class="metric-fill ${item.className}"
                                style="width:${item.value}%"
                            ></div>

                        </div>

                        <strong>
                            ${item.value}%
                        </strong>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// QUICK INSIGHTS
// ============================================================

function generateQuickInsights(
    data
) {

    const container =
        document.getElementById(
            "quickInsights"
        );


    if (!container) return;


    const insights = [];


    if (
        data.positive_percentage >= 60
    ) {

        insights.push({

            icon:
                "fa-face-smile",

            title:
                "Strong positive perception",

            text:
                `${data.positive_percentage}% of reviews are positive.`

        });

    }


    if (
        data.negative_percentage >= 20
    ) {

        insights.push({

            icon:
                "fa-triangle-exclamation",

            title:
                "Negative feedback requires attention",

            text:
                `${data.negative_percentage}% of reviews are negative.`

        });

    }


    if (
        data.average_rating !== null
    ) {

        insights.push({

            icon:
                "fa-star",

            title:
                "Average customer rating",

            text:
                `Customers are giving an average rating of ${data.average_rating}/5.`

        });

    }


    if (!insights.length) {

        insights.push({

            icon:
                "fa-lightbulb",

            title:
                "Customer feedback analyzed",

            text:
                "Explore topics and keywords to understand the drivers behind customer sentiment."

        });

    }


    container.innerHTML =
        insights
            .map(
                insight => `

                    <div class="insight-item">

                        <div class="insight-icon">

                            <i class="fa-solid ${insight.icon}"></i>

                        </div>

                        <div>

                            <strong>
                                ${insight.title}
                            </strong>

                            <p>
                                ${insight.text}
                            </p>

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// BUSINESS INSIGHTS
// ============================================================

function renderBusinessInsights(
    insights
) {

    const container =
        document.getElementById(
            "businessInsights"
        );


    if (!container) return;


    if (!insights.length) {

        container.innerHTML = `
            <div class="empty-state panel">
                <i class="fa-solid fa-lightbulb"></i>
                <h3>No insights yet</h3>
                <p>
                    Analyze customer reviews to generate
                    marketing insights.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        insights
            .map(
                item => `

                    <div class="panel">

                        <div class="insight-item">

                            <div class="insight-icon">

                                <i class="fa-solid
                                    ${
                                        item.type === "risk"
                                            ? "fa-triangle-exclamation"
                                            : item.type === "opportunity"
                                                ? "fa-bullseye"
                                                : "fa-lightbulb"
                                    }
                                "></i>

                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.title
                                    )}
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        item.text
                                    )}
                                </p>

                                <p>
                                    <strong>
                                        Recommended action:
                                    </strong>

                                    ${escapeHTML(
                                        item.action
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");

}


// ============================================================
// SINGLE REVIEW ANALYZER
// ============================================================

function setupSingleAnalyzer() {

    const button =
        document.getElementById(
            "singleAnalyzeButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        analyzeSingleReview
    );

}


async function analyzeSingleReview() {

    const input =
        document.getElementById(
            "singleReview"
        );

    const result =
        document.getElementById(
            "singleResult"
        );


    const text =
        input.value.trim();


    if (!text) {

        result.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p>Please enter a customer review.</p>
            </div>
        `;

        return;

    }


    result.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Analyzing review...</p>
        </div>
    `;


    try {

        const response =
            await fetch(
                "/api/marketing/sentiment",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Analysis failed."
            );

        }


        const icon =
            data.sentiment === "Positive"
                ? "😊"
                : data.sentiment === "Negative"
                    ? "😞"
                    : "😐";


        result.innerHTML = `

            <div class="result-main">

                <div class="result-icon">
                    ${icon}
                </div>

                <h3>
                    ${data.sentiment}
                </h3>

                <div class="result-score">

                    Compound Score:

                    <strong>
                        ${Number(
                            data.compound
                        ).toFixed(3)}
                    </strong>

                </div>


                <div class="score-details">

                    <div class="score-detail">

                        <span>
                            Positive
                        </span>

                        <strong>
                            ${(data.positive * 100).toFixed(1)}%
                        </strong>

                    </div>


                    <div class="score-detail">

                        <span>
                            Neutral
                        </span>

                        <strong>
                            ${(data.neutral * 100).toFixed(1)}%
                        </strong>

                    </div>


                    <div class="score-detail">

                        <span>
                            Negative
                        </span>

                        <strong>
                            ${(data.negative * 100).toFixed(1)}%
                        </strong>

                    </div>

                </div>

            </div>

        `;

    } catch (error) {

        result.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            </div>
        `;

    }

}


// ============================================================
// REFRESH
// ============================================================

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        checkBackend
    );

}


// ============================================================
// BACKEND STATUS
// ============================================================

async function checkBackend() {

    const dot =
        document.getElementById(
            "statusDot"
        );

    const text =
        document.getElementById(
            "statusText"
        );


    try {

        const response =
            await fetch(
                "/api/health"
            );


        if (!response.ok) {

            throw new Error();

        }


        dot.style.background =
            "#35a875";


        text.textContent =
            "Connected";


    } catch {

        dot.style.background =
            "#d65c5c";


        text.textContent =
            "Offline";

    }

}


// ============================================================
// HELPERS
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


function formatNumber(
    number
) {

    return Number(number)
        .toLocaleString();

}


function renderStars(
    rating
) {

    const value =
        Number(rating);


    if (
        !value ||
        value < 1 ||
        value > 5
    ) {

        return "—";

    }


    return (
        "★".repeat(value) +
        `<span style="color:#d1d5db">` +
        "★".repeat(5 - value) +
        "</span>"
    );

}


function sentimentBadge(
    sentiment
) {

    if (!sentiment) return "—";


    const className =
        sentiment === "Positive"

            ? "badge-positive"

            : sentiment === "Negative"

                ? "badge-negative"

                : "badge-neutral";


    return `

        <span class="badge ${className}">
            ${escapeHTML(sentiment)}
        </span>

    `;

}


function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}