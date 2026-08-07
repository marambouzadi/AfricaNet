# 🌍 AfricaNet — Requirements Analysis & Architecture Document (RAD)

## Executive Summary & System Specification

This document details the architectural specification, domain analysis, technological design patterns, and unit test coverage for the **AfricaNet** full-stack e-commerce and trade-in platform.

---

## 1. System Requirements & Domain Scope

### Functional Requirements
1. **User Authentication & RBAC**:
   - Secure registration, authentication (JWT + Refresh Tokens).
   - Role-Based Access Control (`CUSTOMER`, `ADMIN`).
2. **Product Catalog Management**:
   - Dynamic product search, multi-criteria filtering (Category, Brand, Condition, Price).
   - Soft-delete strategy for inventory safety.
3. **Inventory & Stock Control**:
   - Tracking total, reserved, and available quantities.
   - Low-stock alert automated notification thresholds.
   - Excel / CSV exports formatted with UTF-8 BOM encoding.
4. **Order Processing & Invoicing**:
   - Multi-step checkout with VAT (19%) calculation and threshold-based shipping fees.
   - Automated PDF invoice rendering via iText 7.
5. **Trade-In / Device Buyback Module**:
   - Multi-step customer evaluation wizard with image upload to local filesystem (`public/images/`).
6. **Dynamic Real-Time Admin Dashboard**:
   - Live revenue KPI aggregation.
   - Sales evolution chart with temporal aggregation selectors (**Par Jour**, **Par Semaine**, **Par Mois**).
   - Product condition distribution analysis.

---

## 2. Technical Stack & Architectural Layers

```
Layer               Technology Stack
------------------  -------------------------------------------------------------
Presentation (FE)   Next.js 16.2 (Turbopack, App Router), React 19, TypeScript
Styling             Vanilla CSS 3 (Design Tokens, Glassmorphism, Responsive Grid)
Visualization       Recharts (Dynamic BarChart & PieChart), Lucide-React
Backend Core        Java 17, Spring Boot 3.4.x
Security            Spring Security 6 (Stateless JWT, BCrypt Strength 12)
Persistence         Spring Data JPA, Hibernate 7, PostgreSQL 15, Liquibase DB Migrations
Testing Framework   JUnit 5, Mockito, AssertJ
Document Engine     iText 7 PDF Generator
```

---

## 3. Unit Test Suite Coverage

The backend is backed by 5 comprehensive JUnit 5 & Mockito test suites located in `src/test/java/com/brnsmrt/africanet/service/`:

1. `ProductServiceTest.java`: Filtering, creation, soft deletion, error handling.
2. `StockServiceTest.java`: Inward/outward movements, reservation logic, low stock detection.
3. `OrderServiceTest.java`: Admin view, order lifecycle transitions, financial calculations.
4. `TradeInServiceTest.java`: Buyback evaluation, user-level permission boundaries.
5. `AuthServiceTest.java`: Registration, BCrypt password hashing, JWT generation, duplicate checking.

---

## 4. Deployment Instructions

```bash
# Backend Execution
cd africanet
.\mvnw.cmd spring-boot:run

# Frontend Execution
cd africanet-frontend
npm run dev
```

*AfricaNet Architecture & Requirements Analysis Document — 2026*
