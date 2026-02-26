1. Your thought process
    - Why GraphQL?
      -> Mas maikli yung payload na galing sa GraphQl kaya mas mabilis. from REST API na individual endpoint, isang endpoint lang ang kailangan para makuha lahat ng data. 
    - Why React Query vs Zustand split?
      -> For the rendering of data, React Query yung gamit. Andito na yung mga data from the API and firebase.
      -> For the state management, Zustand yung gamit. Dito nilalagay yung mga data na kailangan i-update or i-delete.
    - How you structured components/modules
      -> graphql/ , service/ , config/ yung gamit sa backend.
      -> components/ , hooks/ , store/ , types/ , utils/ yung gamit sa frontend.
      -> As suggested ni Gemini, naka segregate yung mga components base sa task. may "micro" components na reusable tas may mga components na specifically for that task lang. 
2. Tradeoffs
    - What you intentionally didn’t build (to avoid overengineering)
      -> At first, turborepo yung ginawang boilerplate code ni antogravity but to avoid overengineering, ginawa ko na lang na simple FE and BE yung structure sa folder. 
      -> in the prev project ko din using firebase, madalas gusto magpaset-up ng authentication but if single user lang naman, hindi na siya inimplement.
      -> Di rin linear yung workflow ng status ng mga card. it can do to TODO then jump sa DONE. then back to TODO. 

## 📁 Project Structure

```text
├── backend/              # Node.js + Apollo GraphQL Server
│   ├── src/
│   │   ├── config/       # Firebase & App Configuration
│   │   ├── graphql/      # Schema (TypeDefs) & Resolvers
│   │   ├── services/     # Business Logic & Firestore Operations
│   │   ├── types/        # TypeScript Definitions
│   │   └── index.ts      # Server Entry Point
│   └── package.json
├── frontend/             # Next.js (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/          # Next.js Pages & Layouts
│   │   ├── components/   # UI Components (Shadcn UI)
│   │   │   ├── layout/   # Header, Footer, etc.
│   │   │   ├── tasks/    # Task specific components (Board/List)
│   │   │   └── ui/       # Reusable base components
│   │   ├── hooks/        # Custom React Hooks (React Query)
│   │   ├── lib/          # Utilities & Providers
│   │   ├── store/        # State Management (Zustand)
│   │   └── types/        # Shared TypeScript Interfaces
│   └── package.json
├── docs/                 # Documentation & API Contracts
├── firebase.json         # Firebase CLI Configuration
├── firestore.rules       # Security Rules for Firestore
└── README.md
```