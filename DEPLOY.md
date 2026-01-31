# How to Deploy Thapar Venture Club Hub to GitHub Pages

You have two main options to host this project on GitHub.

## Option 1: Automatic (simplest)

1.  **Create a new Repository** on GitHub (e.g., named `tvc-games`).
2.  **Push your code**:
    ```bash
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/tvc-games.git
    git push -u origin main
    ```
3.  **Enable GitHub Pages**:
    -   Go to your Repository **Settings** > **Pages**.
    -   Under "Build and deployment", select **GitHub Actions**.
    -   Search for "Static HTML" or "Vite" workflow if prompted, OR:
    -   **Easier Method**: Change source to **"Deploy from a branch"**.
    -   Select `main` branch and `/ (root)` folder (This works for raw HTML projects, but we are using Vite, so see Option 2 for the correct "Build" way).

## Option 2: The "Build" Way (Recommended for Vite)

Since this project uses Vite, we should build it into a `dist` folder to serve optimized files.

1.  **Run Build Locally**:
    ```bash
    npm run build
    ```
    This creates a `dist` folder with your game.

2.  **Deploy `dist` folder**:
    We can use a tool like `gh-pages` or manually upload.
    
    **Manual Upload:**
    -   Drag and drop the contents of the `dist` folder to a new GitHub repo.
    -   Enable Pages on that repo.

    **Git Subtree (Professional):**
    1.  Commit your `dist` folder (remove `dist` from `.gitignore` first!).
    2.  `git add dist && git commit -m "Add build"`
    3.  `git subtree push --prefix dist origin gh-pages`

## Recommended Steps for YOU right now:

1.  Create a repo on GitHub.
2.  Run these commands in your terminal:
    ```bash
    git add .
    git commit -m "Ready for deployment"
    npm run build
    ```
3.  (Optional) Install `gh-pages` tool for easy deploy:
    ```bash
    npm install gh-pages --save-dev
    ```
    Add this script to `package.json`: `"deploy": "gh-pages -d dist"`
    Then run: `npm run deploy`

Your site will be live at `https://YOUR_USERNAME.github.io/REPO_NAME/`.
