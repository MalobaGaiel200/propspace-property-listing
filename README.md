# PropSpace 🏢🇨🇲

PropSpace is a high-performance, full-stack property listing and management platform engineered with a Cameroon-centric focus (using **FCFA** as the default currency and preloaded with beautiful real estates from Douala, Yaoundé, Buea, and Kribi). It provides property owners and renters with a seamless, polished, single-view interactive dashboard, custom listing portfolio uploads, analytics, direct secure contact channels, and user profile management.

---

## 🚀 Key Features

*   **Cameroon-Centric Properties & Currency**: Automatically handles **FCFA** currency formatting based on location, featuring pre-loaded, highly detailed luxury listings in major cities.
*   **Dual-Input Property Image Upload**: Supports uploading properties either by pasting direct **image URLs** or browsing and **uploading local image files** (which are safely serialized and handled at high fidelity).
*   **Zero AI-Slop Design**: Built with elegant, humbler, and professional visual icons (removed generic sparkles or AI widgets according to strict requirements).
*   **Robust Portfolio Dashboard**: Integrated interactive analytical charts (using **Recharts**) to track statistics, custom inquiries, and portfolio performance in real time.
*   **Fully Responsive Styling**: Fluid, high-contrast, beautiful mobile-first layouts designed using **Tailwind CSS v4** and animated smoothly with **Motion**.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Animations)
*   **Backend**: Node.js, Express (Single-process unified server-client proxy architecture)
*   **Icons & Charts**: Lucide React, Recharts (Responsive charts)
*   **Database**: Local persistent file-based JSON database with automated validation and directory-safeguards (`/data/db.json`)

---

## 📦 How to Run Locally in VS Code

Follow these straightforward steps to run the application on your computer:

### Step 1: Export/Download Project from AI Studio
1. In the Google AI Studio build editor, click the **Settings** gear icon (or the export menu) in the upper corner.
2. Select **Export to ZIP** or **Download ZIP**.
3. Extract the downloaded `.zip` file on your computer.

### Step 2: Open in VS Code
1. Open **Visual Studio Code**.
2. Click **File -> Open Folder** (or **Open...** on macOS) and choose the extracted project folder.

### Step 3: Install Dependencies
Open the VS Code integrated terminal (`Ctrl+` ` ` or `Cmd+` ` `) and run:
```bash
npm install
```

### Step 4: Configure Environment Variables
1. Create a new file named `.env` in the root directory (you can copy `.env.example`).
2. Add the following environment variables:
```env
# Secret key used to sign secure JWT authentication tokens
JWT_SECRET="your_custom_secure_key_here_123456"

# Port (Defaults to 3000)
PORT=3000
```

### Step 5: Start the Development Server
In your terminal, start the unified dev server by running:
```bash
npm run dev
```
Once started, open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🏗️ Production Build & Deploy

To build the application for production (optimizes files and bundles the Express backend server into a single file via `esbuild`):

1. **Build the project**:
   ```bash
   npm run build
   ```
2. **Start production server**:
   ```bash
   npm start
   ```

---

## 🐙 How to Push to Your GitHub Repository

To upload this complete, fully configured codebase to your repository: **`https://github.com/MalobaGaiel200/propspace-property-listing`**

1. Open your VS Code terminal and make sure you are in the root folder of the project.
2. Initialize a new local Git repository:
   ```bash
   git init
   ```
3. Add all your source files to git staging (this respects the `.gitignore` so folders like `node_modules` or local `dist` aren't uploaded):
   ```bash
   git add .
   ```
4. Commit your files with a descriptive message:
   ```bash
   git commit -m "feat: initial commit of Cameroon-centric PropSpace property listing platform"
   ```
5. Set your default branch to `main`:
   ```bash
   git branch -M main
   ```
6. Link your local repository to your remote GitHub repository:
   ```bash
   git remote add origin https://github.com/MalobaGaiel200/propspace-property-listing.git
   ```
7. Push your changes up to GitHub:
   ```bash
   git push -u origin main
   ```

*Note: If you already have files in your repository, you might need to run `git pull origin main --rebase` before running the final push command.*
