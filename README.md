# 🐱 Pockat ✨

> **Feed your wallet. Save treats. Climb the tower!**

Pockat turns boring budgets into a cozy cat game! Track your spending, sort your finances into cute categories, battle friends on the savings leaderboard, and collect paw badges when you hoard more coins. 🪙

## 🌟 Features

*   **📝 Quick Recording Menu:** Easily log your income and expenses with a mobile-optimized, tactile UI. 
*   **🏷️ Custom Tags:** Categorize your spending (Shopping, Food, Transport, etc.). New users are automatically seeded with default tags!
*   **📊 Kitty Dashboard:** View a breakdown of your finances, including visual charts to see exactly where your treats are going.
*   **🗼 Cat Tower Leaderboard (Hall of Savers):** Compete with other users! View the top savers globally or filter by the current month (synced to Jakarta UTC+7 time). 
*   **🔐 Secure Authentication:** Built-in credential login with `bcryptjs` password hashing.
*   **💌 Password Recovery:** Fully functioning "Forgot Password" flow with secure tokens and real email delivery via Resend.
*   **📱 Mobile-First & Fluid:** Features an app-like bottom navigation bar, tactile active states (`active:scale-90`), and responsive layouts that look beautiful on any device.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Emails:** [Resend](https://resend.com/)

---

## 🚀 Getting Started

Follow these steps to run Pockat on your local machine.

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/pockat.git](https://github.com/yourusername/pockat.git)
cd pockat

```

### 2. Install dependencies

```bash
npm install

```

### 3. Set up Environment Variables

Create a `.env` file in the root of your project and add the following variables. (Make sure you have a database running, like PostgreSQL or MySQL, depending on your Prisma schema).

```env
# Database connection string
DATABASE_URL="your_database_connection_string_here"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_random_secret_string_here"

# Resend API Key for Password Reset Emails
RESEND_API_KEY="re_your_resend_api_key"

```

### 4. Push the Database Schema

Sync your Prisma schema with your database to create the required tables (`User`, `Transaction`, `Category`, etc.).

```bash
npx prisma db push

```

### 5. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app!

---

## 📂 Project Structure Highlights

* `app/page.tsx` - The responsive, landing page featuring the app's core value propositions.
* `app/recording/` - The main interactive hub for adding transactions and viewing the live timeline.
* `app/leaderboard/` - The "Cat Tower" ranking logic, dynamically sorting users by savings rate.
* `app/api/auth/` - Custom backend routes handling secure password resets and NextAuth configurations.
* `components/` - Reusable UI components like the mobile bottom navigation bar and feature cards.
