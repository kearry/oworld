Project Structure
├── app/
│   ├── api/
│   │   ├── ads/
│   │   │   └── route.ts
│   │   ├── auth/
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── communities/
│   │   │   ├── [id]/
│   │   │   │   └── posts/
│   │   │   │       └── route.ts
│   │   │   └── user/
│   │   │       └── route.ts
│   │   ├── messages/
│   │   │   ├── [userId]/
│   │   │   │   └── route.ts
│   │   │   ├── conversations/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── notifications/
│   │   │   ├── mark-read/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   ├── bookmark/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── comment/
│   │   │   │   │   └── route.ts
│   │   │   │   └── like/
│   │   │   │       └── route.ts
│   │   │   ├── following/
│   │   │   │   └── route.ts
│   │   │   ├── for-you/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── users/
│   │       ├── [id]/
│   │       │   ├── follow-counts/
│   │       │   │   └── route.ts
│   │       │   └── follow/
│   │       │       └── route.ts
│   │       └── route.ts
│   ├── analytics/
│   │   └── page.tsx
│   ├── auth/
│   │   ├── error/
│   │   │   └── page.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── communities/
│   │   └── page.tsx
│   ├── followers/
│   │   └── page.tsx
│   ├── following/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── messages/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── profile/
│   │   ├── [handle]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── search/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── feed/
│   │   ├── AdCard.tsx
│   │   ├── Feed.tsx
│   │   └── TabBar.tsx
│   ├── layout/
│   │   ├── MobileFooter.tsx
│   │   └── Sidebar.tsx
│   ├── post/
│   │   ├── CreatePostModal.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── PostCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── context/
│   ├── feed-context.tsx
│   └── ui-context.tsx
├── hooks/
│   ├── useFollowUser.ts
│   ├── useInfiniteScroll.ts
│   └── useLocalStorage.ts
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   ├── migrations/
│   │   └── ...
│   └── schema.prisma
├── public/
│   ├── default-avatar.png
│   └── logo.svg
├── styles/
│   └── globals.css
├── types/
│   ├── environment.d.ts
│   └── next-auth.d.ts
├── .env
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json