# PropSpace 🇨🇲

PropSpace is a high-performance, full-stack property listing and management platform engineered with a Cameroon-centric focus (using **FCFA** as the default currency and preloaded with beautiful real estates from Douala, Yaoundé, Buea, and Kribi). It provides property owners and renters with a seamless, polished, single-view interactive dashboard, custom listing portfolio uploads, analytics, direct secure contact channels, and user profile management.

---

##  Key Features

*   **Cameroon-Centric Properties & Currency**: Automatically handles **FCFA** currency formatting based on location, featuring pre-loaded, highly detailed luxury listings in major cities.
*   **Dual-Input Property Image Upload**: Supports uploading properties either by pasting direct **image URLs** or browsing and **uploading local image files** (which are safely serialized and handled at high fidelity).

*   **Robust Portfolio Dashboard**: Integrated interactive analytical charts (using **Recharts**) to track statistics, custom inquiries, and portfolio performance in real time.
*   **Fully Responsive Styling**: Fluid, high-contrast, beautiful mobile-first layouts designed using **Tailwind CSS v4** and animated smoothly with **Motion**.

---

##  Tech Stack

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Animations)
*   **Backend**: Node.js, Express (Single-process unified server-client proxy architecture)
*   **Icons & Charts**: Lucide React, Recharts (Responsive charts)
*   **Database**: Local persistent file-based JSON database with automated validation and directory-safeguards (`/data/db.json`)

---

##  How to Run Locally in VS Code

Follow these straightforward steps to run the application on your computer:


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
0


### Step 5: Start the Development Server
In your terminal, start the unified dev server by running:
```bash
npm run dev
```
Once started, open your web browser and navigate to:
http://localhost:3000

---

##  Production Build & Deploy

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

