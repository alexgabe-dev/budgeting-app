# Lumo - Simple Budgeting App

A modern, AI-powered personal budgeting application built with Next.js 15, React 19, and TypeScript. Features offline-first design with local storage and electric insights powered by AI.

**Created by [Alex Gabe](https://github.com/alexgabe-dev)**  
**Repository**: [https://github.com/alexgabe-dev/budgeting-app](https://github.com/alexgabe-dev/budgeting-app)

> 💡 **Personal Project**: This is my hobby app to manage my personal finances. Built with features I actually need for tracking my own spending, budgeting, and financial insights.

## ✨ Features

### 📊 Dashboard
- **Quick Stats**: Overview of your financial health at a glance
- **Spending Charts**: Visual representation of your spending patterns
- **Budget Overview**: Track your budget progress and remaining amounts
- **Recent Transactions**: Latest financial activity
- **Category Spending**: Breakdown by spending categories

### 💰 Budget Management
- Create and manage multiple budgets
- Set spending limits by category
- Track progress with visual indicators
- Budget alerts and notifications

### 💳 Transaction Tracking
- Add, edit, and categorize transactions
- Import transactions from various sources
- Search and filter transaction history
- Export transaction data

### 📈 Insights & Analytics
- AI-powered financial insights
- Spending pattern analysis
- Financial health scoring
- Predictive budgeting recommendations

### 📋 Reports
- Comprehensive financial reports
- Custom date range analysis
- Export capabilities (PDF, CSV)
- Visual charts and graphs

### 🎨 Modern UI/UX
- Dark/Light theme support
- Responsive design for all devices
- Smooth animations with Framer Motion
- Accessible components with Radix UI

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.4
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: Zustand
- **Database**: Dexie (IndexedDB for offline storage)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexgabe-dev/budgeting-app.git
   cd budgeting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
mbudgeting-app/
├── app/                    # Next.js app directory
│   ├── budgets/           # Budget management pages
│   ├── insights/          # AI insights pages
│   ├── reports/           # Reports pages
│   ├── transactions/      # Transaction pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── add-budget-dialog.tsx
│   ├── add-transaction-dialog.tsx
│   ├── budget-list.tsx
│   ├── dashboard-header.tsx
│   ├── financial-summary.tsx
│   └── ...               # Other components
├── lib/                  # Utility libraries
│   ├── database.ts       # Database configuration
│   ├── store.ts          # State management
│   ├── utils.ts          # Helper functions
│   └── ai-insights.ts    # AI insights logic
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/               # Global styles
```

## 🎯 Key Features

### Offline-First Design
- Works without internet connection
- Data stored locally using IndexedDB
- Sync when connection is restored

### AI-Powered Insights
- Smart spending analysis
- Budget recommendations
- Financial health scoring
- Predictive analytics

### Modern Development Experience
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Hot reload for fast development

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

### Themes
The app supports both light and dark themes. Theme preference is automatically detected and can be toggled in the settings.

### Styling
Built with Tailwind CSS for easy customization. Component styles can be modified in the respective component files.

## 📱 Mobile Support

Fully responsive design that works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🔒 Data Privacy

- All data stored locally on your device
- No data sent to external servers
- Complete privacy and control over your financial data
- Optional cloud sync (when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon toolkit

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/alexgabe-dev/budgeting-app/issues) page
2. Create a new issue with detailed information
3. Contact [Alex Gabe](https://github.com/alexgabe-dev)

---

**Lumo** - Illuminate your financial future with smart budgeting. 💡💰
