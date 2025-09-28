document.addEventListener('DOMContentLoaded', () => {
    const storiesList = document.querySelector('.stories-list');
    const storyViewer = document.querySelector('.story-viewer');
    const storyImage = document.querySelector('.story-image');
    const storyAvatar = document.querySelector('.story-avatar');
    const storyUsername = document.querySelector('.story-username');
    const storyProgress = document.querySelector('.story-progress');
    const loader = document.querySelector('.loader');

    let storiesData = [];
    let currentUserIndex = 0;
    let currentStoryIndex = 0;
    let storyTimeout;
    const viewedUsers = new Set();

    // Fetch stories from an external JSON file
    fetch('stories.json')
        .then(response => response.json())
        .then(data => {
            storiesData = data;
            displayStoriesList();
        });

    function displayStoriesList() {
        storiesData.forEach((user, index) => {
            const storyItem = document.createElement('div');
            storyItem.classList.add('story-item');
            storyItem.dataset.username = user.username; // Add data attribute for easy selection
            storyItem.innerHTML = `
                <img src="${user.avatar}" alt="${user.username}'s Story">
                <p>${user.username}</p>
            `;
            storyItem.addEventListener('click', () => openStory(index));
            storiesList.appendChild(storyItem);
        });
    }

    function markUserAsViewed(username) {
        if (!viewedUsers.has(username)) {
            viewedUsers.add(username);
            const storyItem = document.querySelector(`.story-item[data-username="${username}"]`);
            if (storyItem) {
                storyItem.classList.add('viewed');
            }
        }
    }

    function openStory(userIndex) {
        currentUserIndex = userIndex;
        currentStoryIndex = 0;
        storyViewer.style.display = 'flex';
        showStory();
    }

    function showStory() {
        clearTimeout(storyTimeout);
        loader.style.display = 'block';
        storyImage.style.display = 'none';

        const user = storiesData[currentUserIndex];
        const story = user.stories[currentStoryIndex];

        storyAvatar.src = user.avatar;
        storyUsername.textContent = user.username;

        const img = new Image();
        img.src = story.imageUrl;
        img.onload = () => {
            storyImage.src = story.imageUrl;
            loader.style.display = 'none';
            storyImage.style.display = 'block';
            updateProgressBars();
            storyTimeout = setTimeout(nextStory, 5000);
        };
    }

    function updateProgressBars() {
        storyProgress.innerHTML = '';
        storiesData[currentUserIndex].stories.forEach((_, index) => {
            const progressBar = document.createElement('div');
            progressBar.classList.add('progress-bar');
            const progressBarFill = document.createElement('div');
            progressBarFill.classList.add('progress-bar-fill');
            if (index < currentStoryIndex) {
                progressBarFill.style.width = '100%';
            } else if (index === currentStoryIndex) {
                setTimeout(() => {
                    progressBarFill.style.width = '100%';
                }, 50);
            }
            progressBar.appendChild(progressBarFill);
            storyProgress.appendChild(progressBar);
        });
    }

    function nextStory() {
        if (currentStoryIndex < storiesData[currentUserIndex].stories.length - 1) {
            currentStoryIndex++;
            showStory();
        } else {
            // Mark as viewed when the last story of a user finishes
            markUserAsViewed(storiesData[currentUserIndex].username);
            nextUser();
        }
    }

    function prevStory() {
        if (currentStoryIndex > 0) {
            currentStoryIndex--;
            showStory();
        } else {
            prevUser();
        }
    }
    
    function nextUser() {
        if (currentUserIndex < storiesData.length - 1) {
            currentUserIndex++;
            currentStoryIndex = 0;
            showStory();
        } else {
            closeStoryViewer();
        }
    }

    function prevUser() {
        if (currentUserIndex > 0) {
            currentUserIndex--;
            currentStoryIndex = 0; // Start from the first story of the previous user
            showStory();
        }
    }

    function closeStoryViewer() {
        // Mark the current user's story as viewed when closing the viewer
        markUserAsViewed(storiesData[currentUserIndex].username);
        storyViewer.style.display = 'none';
        clearTimeout(storyTimeout);
    }

    document.querySelector('.next-story').addEventListener('click', nextStory);
    document.querySelector('.prev-story').addEventListener('click', prevStory);
    storyViewer.addEventListener('click', (e) => {
        if (e.target === storyViewer) {
            closeStoryViewer();
        }
    });
});