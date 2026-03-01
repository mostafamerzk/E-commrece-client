# Angular E-Commerce Client

## Overview

This is a modern, enterprise-grade e-commerce application built with Angular 20. The project focuses on high performance, maintainability, and a premium user experience. It utilizes a zoneless change detection strategy powered by Angular Signals and a robust UI foundation combining Tailwind CSS v4 and PrimeNG v20.

## Key Features

### Buyer Experience

- Product Discovery: Browsable and searchable product catalog with advanced filtering by category and price range.
- Shopping Cart: Dynamic cart management with quantity adjustments and persistent storage.
- Wishlist: Personal collection of favorite products for future purchase.
- Checkout Flow: Secure multi-step checkout process with shipping address management and Stripe payment integration.
- Order Tracking: Comprehensive order history and real-time status tracking via a status timeline.
- Reviews: Interactive review system with star ratings and feedback for products.

### Seller Dashboard

- Product Management: Tools for sellers to add, edit, and manage their product inventory.
- Sales Overview: Performance metrics showing total revenue and products sold.
- Stock Alerts: Visual indicators for low stock and out-of-stock items.
- Store Profile: Management of store identity, including name, description, and branding.

### Administration Panel

- System Dashboard: Global performance overview with revenue charts and key statistics.
- User Management: Administrative control over user accounts, including role management and restriction capabilities.
- Order Management: Platform-wide order oversight with status update capabilities and CSV export functionality.
- Content Management: Control over homepage banners and hero carousel content.

## Technology Stack

- Framework: Angular 20 (Zoneless with Signals)
- Styling: Tailwind CSS v4, PrimeNG v20, PrimeFlex v4
- Icons: PrimeIcons v7
- State Management: Angular Signals
- Testing: Jasmine and Karma
- Linting and Formatting: ESLint and Prettier
- Git Hooks: Husky and lint-staged

## Project Architecture

The project follows a modular and scalable structure:

- core/: Single-instance services, global guards, interceptors, and application-wide models.
- shared/: Reusable components, directives, and pipes used across multiple features.
- features/: Feature-specific modules (Products, Cart, Orders, Auth, Admin, Seller).
- layouts/: Standard page shells (Main, Admin, Seller).

## Design Previews

[IMAGE_PLACEHOLDER: Home Page Desktop View]

[IMAGE_PLACEHOLDER: Product List Filtering]

[IMAGE_PLACEHOLDER: Admin Dashboard Statistics]

[IMAGE_PLACEHOLDER: Mobile Responsive Sidebar]

## Getting Started

### Prerequisites

- Node.js (version specified in .nvmrc)
- Angular CLI 20

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

1. Start the development server:
   ```bash
   npm start
   ```
2. Navigate to `http://localhost:4200`

### Quality Control

- Run linting: `npm run lint`
- Run formatting: `npm run format`
- Run unit tests: `npm run test`
- Run tests with coverage: `npm run test:coverage`

## Documentation

Additional project documentation is available in the `docs/` directory:

- collaboration-guide.md: Guidelines for team collaboration and code standards.
- memory.md: Current project state and technical decisions.
- tasks.md: Detailed task breakdown and definition of done.
