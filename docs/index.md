---
layout: home
permalink: index.html
repository-name: e22-co2060-MyStay-Boarding-Platform
title: MyStay – Boarding Place Finder Web Application
---

# MyStay – Boarding Place Finder Web Application

<p align="center">
  <img src="./data/coverpage.gif" alt="MyStay Demo Animation" width="800">
</p>

## Team
- E/22/120, A.S.V. Gunasiri, [e22120@eng.pdn.ac.lk](mailto:e22120@eng.pdn.ac.lk)
- E/22/001, H.M.H.N. Aberathna, [e22001@eng.pdn.ac.lk](mailto:e22001@eng.pdn.ac.lk)
- E/22/027, M.A.N.P. Anawarathne, [e22027@eng.pdn.ac.lk](mailto:e22027@eng.pdn.ac.lk)
- E/22/324, P.H.D. Rathnasiri, [e22324@eng.pdn.ac.lk](mailto:e22324@eng.pdn.ac.lk)

---

#### Table of Contents
1. [Introduction](#introduction)
2. [Key Features](#key-features)
3. [Solution Architecture](#solution-architecture)
4. [Software Designs](#software-designs)
5. [Testing & Quality Assurance](#testing--quality-assurance)
6. [Conclusion](#conclusion)
7. [Links](#links)

---

## Introduction

Finding suitable boarding places is often difficult for university students and young professionals due to scattered listings, lack of verified reviews, and limited direct communication with landlords. **MyStay** addresses these challenges by centralizing boarding information into an intuitive, reliable web and mobile platform. 

Users can search, filter, and inspect boarding listings with interactive maps, request bookings, chat directly with property owners, read and leave reviews, and even find compatible roommates. Landlords benefit from a dedicated management dashboard to oversee listings and booking requests in real time.


---

## Key Features

### 1. Advanced Stay Search & Multi-Criteria Filtering
- Fast search across available boarding places filtered by **price range**, **distance/location**, **gender preference** (male, female, any), and **amenities** (Wi-Fi, attached bathroom, parking, meals, etc.).
- Real-time availability indicator showing whether a place is Available or Booked.

### 2. Interactive Map Exploration (Leaflet & CARTO Basemaps)
- Geospatial visualization of boarding locations on an interactive map.
- Custom map pins, informative popups with stay summaries, pricing, and direct routing/directions to university landmarks.
- High-reliability tile delivery using CARTO basemaps to prevent access blocking and rate limits.

### 3. Roommate Finding Platform
- Dedicated matchmaking system allowing students to create roommate profiles and post requests.
- Filter prospective roommates by budget, preferred location, lifestyle habits, and gender preference.
- Direct contact mechanism to connect and plan shared boarding arrangements.

### 4. Ratings & Verified Review System
- Transparent 5-star rating and written review system for authenticated tenants.
- Aggregate ratings prominently displayed on listing cards and detail pages to assist prospective tenants in making confident decisions.

### 5. In-App Direct Chat & Messaging
- Built-in private messaging system connecting tenants directly with landlords.
- Instant inquiry and landlord reply workflow across both desktop and mobile platforms.
- Eliminates the need for external messaging apps while maintaining a secure audit trail.

### 6. Booking Management & Automated Availability Lifecycle
- Seamless booking request flow for tenants specifying move-in dates and notes.
- Landlord approval workflow: landlords can review, accept, or decline booking requests.
- Automatic availability synchronization: when a booking request is approved, the stay status dynamically updates to **Booked**.

### 7. Dedicated Landlord Management Dashboard
- Unified dashboard for property owners to create, update, manage photos, and delete listings.
- Real-time monitoring of tenant inquiries, active bookings, and listing statuses.

### 8. Cross-Platform Mobile Application
- Complementary **React Native (Expo)** mobile application supporting Android and iOS.
- Allows students to browse listings, explore details, make direct phone calls with one click, and chat on the go.

### 9. Integrated User Feedback System
- Direct Google Forms feedback channel integrated into the platform for continuous user experience feedback and feature requests.

---

## Solution Architecture

MyStay follows a modular, client-server architecture designed for high scalability, maintainability, and security:

- **Frontend Client**: React Single Page Application (SPA) built with TypeScript, Vite, and Tailwind CSS, deployed on **Azure Static Web Apps** with SPA client-side routing fallback configuration.
- **Mobile Client**: Cross-platform mobile app built using React Native and Expo.
- **Backend API**: Node.js and Express RESTful API providing JWT-based role authentication (tenants vs. landlords), stay management, booking workflows, reviews, roommate listings, and messaging endpoints.
- **Database Layer**: Relational MySQL database with normalized schemas and foreign key integrity for users, stays, bookings, reviews, messages, and roommate requests.
- **CI/CD & Cloud Infrastructure**: Automated GitHub Actions pipelines for running backend/frontend tests and deploying production builds to **Microsoft Azure** (Azure Static Web Apps for Frontend and Azure Web App container for Backend).

---

## Software Designs

The user interface prioritizes clarity, accessibility, and modern aesthetics:
- **Homepage & Discovery**: Hero search bar, featured boarding listings, category highlights, and quick access to the Roommate Finder.
- **Search & Map Split View**: Dual-view experience enabling users to toggle between grid cards and interactive map pins.
- **Listing Details**: Detailed image gallery, pricing breakdown, amenities checklist, verified tenant reviews, booking request modal, and direct "Chat with Landlord" action.
- **Roommate Portal**: Clean feed of roommate listings with criteria badges and quick contact actions.
- **Landlord Control Center**: Tabbed interface for listing management, booking approvals, and tenant inquiry management.

---

## Testing & Quality Assurance

Quality assurance is maintained through a multi-tier automated test suite integrated into CI workflows:

### 1. Backend API & Security Tests (Jest & Supertest)
- **`auth.test.js` & `authMiddleware.test.js`**: User registration, login, password hashing, JWT creation, and role-based route protection.
- **`stays.test.js`**: Listing creation, querying, distance/price filtering, and landlord permission controls.
- **`booking.test.js`**: Booking lifecycle, pending request creation, approval/rejection handling, and automatic status updates.
- **`message.test.js`**: Tenant-landlord chat creation, conversation retrieval, and landlord replies.
- **`review.test.js`**: Review submission validation, rating bounds, and retrieval per stay.
- **`security.test.js`**: Unauthorized access prevention, input sanitization, and privilege escalation guards.

### 2. Frontend Component Tests (Vitest & React Testing Library)
- **`Browse.test.tsx`**: Search input, filter badge updates, and listing card rendering.
- **`Login.test.tsx` & `Signup.test.tsx`**: Form validation, error state displays, and successful authentication redirects.
- **`LandlordDashboard.test.tsx`**: Listing table management, modal state transitions, and action handling.

### 3. Mobile Application Tests (Jest & React Native)
- **`HomeScreen.test.js` & `ListingDetailScreen.test.js`**: Mobile component rendering, list interactions, and navigation.
- **`AuthContext.test.js` & `LoginScreen.test.js`**: Mobile session state persistence and auth flow verification.

---

## Conclusion

MyStay provides a centralized, modern, and reliable solution for boarding accommodation around universities and urban centers. By integrating **interactive map exploration**, **direct landlord messaging**, **verified tenant reviews**, **automated booking workflows**, and a **roommate matching platform**, MyStay drastically streamlines the boarding search experience for students while equipping landlords with robust property management tools.

Future roadmap items include:
- Integrated online payment gateway for secure deposit handling.
- AI-driven recommendation engine tailored to student preferences and university schedules.
- 360° virtual tours for immersive remote stay inspection.

---

## Links

- [Project Repository](https://github.com/cepdnaclk/e22-co2060-MyStay-Boarding-Platform)
- [Project Page](https://cepdnaclk.github.io/e22-co2060-MyStay-Boarding-Platform)
- [MyStay Official Website](https://blue-wave-073e69e00.7.azurestaticapps.net)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

