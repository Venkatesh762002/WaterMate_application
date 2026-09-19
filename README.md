# WaterMate 💧

> **Shared water can ordering, cost splitting, and payment management application designed for bachelor rooms and flat roommates.**

WaterMate solves the everyday friction roommates experience when managing shared 20-liter drinking water cans. It separates **vendor payments** (who actually handed cash or UPI to the delivery person) from **internal cost sharing** (who consumed the water and owes what), calculates optimal debt transfers to settle dues with minimal transactions, and keeps a clear audit trail.

---

## 🌟 Key Features

### 1. Authentication & Roommate Profiles
- **User Accounts**: Fast signup, login, and secure session management.
- **Preloaded Demo Accounts**: Instant 1-click test logins (`rahul`, `alex`, `priya`, `vikram`) for quick walkthroughs.
- **Repayment Profiles**: Save contact numbers, custom avatar colors, and personal UPI IDs (e.g. `alex.dsouza@okaxis`) so roommates can reimburse you with one tap.

### 2. Bachelor Room & Water Supplier Management
- **Multi-Room Support**: Switch between multiple flats or shared rooms from the top navigation bar.
- **Room Invite Codes**: Unique 6-character invite codes (e.g., `WM-304`) allowing roommates to join instantly without manual invites. Admins can regenerate codes when necessary.
- **Supplier Directory**: Store your local water agency's details—vendor name, can brand (e.g. 20L Bisleri Sealed Jar), delivery timing notes, and a 1-tap `Call Supplier` link.
- **Configurable Pricing**: Set room default rate per can (e.g. ₹35) and regional currency (`₹`, `$`, `€`, `£`).

### 3. Water Can Order Tracking
- **One-Tap Quick Orders**: Immediate `+ 1 Can`, `+ 2 Cans`, or `+ 3 Cans` buttons for when the delivery boy arrives.
- **Detailed Custom Orders**: Record delivery date, quantity, price per can, notes, and supplier names.
- **Delivery Statuses**: Track orders as `Delivered`, `Ordered / En Route`, or `Cancelled`.
- **Flexible Cost Splitting**:
  - **Equal Split**: Automatically divided among all active roommates.
  - **Custom Split**: Set exact amounts or percentages per roommate with instant balance validation.
- **Upfront Vendor Payment**: Option to record an immediate payment made directly upon delivery.

### 4. Dual-Layer Accounting & Settlement Engine
- **Vendor Payment Tracking**: Record partial or full payments made to the water delivery person (via UPI, Cash, Card, Net Banking, or other methods). Orders automatically display `PAID`, `PARTIALLY_PAID`, or `UNPAID` statuses with visual progress indicators.
- **Cost Share vs. Vendor Payment**: Distinguishes between paying the water supplier and bearing the cost of consumed water.
- **Debt Simplification**: An algorithmic settlement matrix calculates the fewest peer-to-peer repayments needed to balance all accounts.
- **1-Click Peer Settlements**: Pay back a roommate via UPI with recipient UPI copy-to-clipboard functionality and record settlement notes.

### 5. Analytics & Dashboard
- **Daily, Weekly, and Monthly Metrics**: Total cans delivered and money spent today, over the last 7 days, and in the current month.
- **Personal Net Balance Card**: Instant visibility into whether you are owed money (green) or owe the room (red).
- **6-Month Consumption Trend**: Visual SVG chart showing monthly water can volume and total expenditure.
- **Pending Vendor Dues**: Highlights unpaid supplier balances with direct "Pay" action shortcuts.

### 6. Roommate Roster, Admin Controls & Audit Trail
- **Admin Permissions**: Promote or demote room administrators.
- **Vacation / Away Status**: Mark roommates as `Away` to exclude them from cost sharing while traveling, and reactivate them upon return.
- **Audit Activity Log**: Transparent chronological history of every order placed, payment logged, settlement cleared, or member permission changed.
- **CSV Data Exports**: Download complete, formatted CSV reports for **Orders**, **Vendor Payments**, and **Roommate Settlements**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Express.js REST API running on Node.js
- **Persistence**: JSON file store (`data/watermate-db.json`) with sample rooms, members, orders, payments, and settlements pre-seeded
- **Build Tooling**: Vite & esbuild

---

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
npm install
```

### Running the Development Server
```bash
# Start backend and Vite frontend
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 👥 Demo Logins

You can log in with any of these pre-seeded demo accounts (password for all is `demo123`):

| Roommate | Username | Role in "Koramangala Flat 402" | UPI ID |
| :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `rahul` | Admin | `rahul.sharma@okhdfcbank` |
| **Alex D'Souza** | `alex` | Roommate | `alex.dsouza@okaxis` |
| **Priya Patel** | `priya` | Roommate | `priya.patel@icici` |
| **Vikram Singh** | `vikram` | Roommate (Away) | `vikram.singh@oksbi` |

---

## 📄 License
MIT License. Feel free to use and adapt for your shared apartment or flat.
