# MyStay Frontend Testing

## 1. Overview

This document describes the automated testing setup for the MyStay frontend application.

The frontend is developed using React and Vite with TypeScript. Vitest is used as the test runner, while React Testing Library is used to render React components and verify their behaviour.

The tests are designed to verify important frontend functionality without modifying the existing application source code.

## 2. Frontend Technology Stack

The frontend testing environment uses the following technologies:

| Technology            |                  Version | Purpose                       |
| --------------------- | -----------------------: | ----------------------------- |
| React                 | Existing project version | Frontend framework            |
| Vite                  |                    6.3.5 | Frontend build tool           |
| TypeScript            | Existing project version | Programming language          |
| Vitest                |                    3.2.7 | Test runner                   |
| jsdom                 |                   29.1.1 | Browser-like test environment |
| React Testing Library |                   16.3.3 | React component testing       |

## 3. Frontend File Structure

The relevant frontend testing structure is:

```text
code/
└── front_end/
    ├── src/
    │   └── app/
    │       └── pages/
    │           ├── Browse.tsx
    │           ├── Login.tsx
    │           ├── Signup.tsx
    │           └── LandlordDashboard.tsx
    │
    ├── tests/
    │   ├── Browse.test.tsx
    │   ├── LandlordDashboard.test.tsx
    │   ├── Login.test.tsx
    │   ├── Signup.test.tsx
    │   ├── LandlordImport.test.tsx
    │   ├── ReactRender.test.tsx
    │   └── LandlordDiagnostic.test.tsx
    │
    ├── vitest.config.test.ts
    ├── package.json
    └── README.md
```

## 4. Installing Testing Dependencies

Open PowerShell or a terminal and navigate to the frontend directory:

```bash
cd code/front_end
```

Install the required testing packages:

```bash
npm install -D vitest@3 jsdom @testing-library/react
```

The project uses Vitest version 3 because the frontend currently uses Vite 6.3.5.

To verify the installed packages:

```bash
npm list vite vitest jsdom @testing-library/react
```

Expected versions include:

```text
vite@6.3.5
vitest@3.2.7
jsdom@29.1.1
@testing-library/react@16.3.3
```

## 5. Vitest Configuration

The frontend tests use a separate Vitest configuration file:

```text
vitest.config.test.ts
```

The configuration is:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
```

### Configuration Details

The `react()` plugin enables Vitest to process React and TSX files.

The `jsdom` environment provides a simulated browser environment for components that use DOM APIs.

The test file pattern:

```text
tests/**/*.test.{ts,tsx}
```

ensures that TypeScript and TSX test files inside the `tests` directory are included.

## 6. Frontend Test Cases

The current frontend test suite contains 7 test files and 9 tests.

### 6.1 Browse Test

File:

```text
tests/Browse.test.tsx
```

Purpose:

Tests the Browse Boarding Places page.

The test verifies that:

* Boarding listings are loaded from the API.
* Multiple listings are displayed.
* The search field can be used.
* Listings can be filtered by location.
* The matching listing remains visible.
* The non-matching listing is removed from the displayed results.

Test:

```text
Frontend Browse > loads listings and filters them by title/location
```

Number of tests:

```text
1
```

Run individually:

```bash
npx vitest run tests/Browse.test.tsx --config vitest.config.test.ts
```

## 6.2 Login Test

File:

```text
tests/Login.test.tsx
```

Purpose:

Tests the frontend login functionality.

The tests verify:

* Successful login using valid credentials.
* Session information is stored.
* The user is redirected after successful login.
* Backend login errors are displayed to the user.

Tests:

```text
Frontend Login > submits credentials, stores the session and redirects a landlord
Frontend Login > shows the backend error when login fails
```

Number of tests:

```text
2
```

Run individually:

```bash
npx vitest run tests/Login.test.tsx --config vitest.config.test.ts
```

## 6.3 Signup Test

File:

```text
tests/Signup.test.tsx
```

Purpose:

Tests the user registration functionality.

The tests verify:

* Password mismatch validation.
* Landlord role selection and signup behaviour.

Tests:

```text
Frontend Signup > prevents submission when passwords do not match
Frontend Signup > ...
```

Number of tests:

```text
2
```

Run individually:

```bash
npx vitest run tests/Signup.test.tsx --config vitest.config.test.ts
```

## 6.4 Landlord Dashboard Test

File:

```text
tests/LandlordDashboard.test.tsx
```

Purpose:

Tests the Landlord Dashboard and listing display.

The test verifies:

* The Landlord Dashboard loads.
* Landlord listings are retrieved.
* The My Listings tab can be selected.
* A listing title is displayed.
* The listing location is displayed.
* The listing price is displayed.

Test:

```text
Frontend Landlord Dashboard > loads listings and displays the dashboard
```

Number of tests:

```text
1
```

Run individually:

```bash
npx vitest run tests/LandlordDashboard.test.tsx --config vitest.config.test.ts
```

## 6.5 Landlord Import Test

File:

```text
tests/LandlordImport.test.tsx
```

Purpose:

Verifies that the Landlord Dashboard component can be imported successfully by the test environment.

Test:

```text
Landlord Dashboard import > can import the dashboard
```

Number of tests:

```text
1
```

Run individually:

```bash
npx vitest run tests/LandlordImport.test.tsx --config vitest.config.test.ts
```

## 6.6 React Render Test

File:

```text
tests/ReactRender.test.tsx
```

Purpose:

Provides a basic React rendering test to verify that the React Testing Library and jsdom environment are working correctly.

Test:

```text
Vitest React Render > renders a React component
```

Number of tests:

```text
1
```

Run individually:

```bash
npx vitest run tests/ReactRender.test.tsx --config vitest.config.test.ts
```

## 6.7 Landlord Diagnostic Test

File:

```text
tests/LandlordDiagnostic.test.tsx
```

Purpose:

Tests that the Landlord Dashboard can render successfully when external dependencies such as map components are mocked.

Test:

```text
Landlord Dashboard Diagnostic > renders the dashboard
```

Number of tests:

```text
1
```

Run individually:

```bash
npx vitest run tests/LandlordDiagnostic.test.tsx --config vitest.config.test.ts
```

## 7. Running Individual Tests

Any individual test can be executed using:

```bash
npx vitest run <test-file> --config vitest.config.test.ts
```

For example:

```bash
npx vitest run tests/Login.test.tsx --config vitest.config.test.ts
```

```bash
npx vitest run tests/Signup.test.tsx --config vitest.config.test.ts
```

```bash
npx vitest run tests/Browse.test.tsx --config vitest.config.test.ts
```

```bash
npx vitest run tests/LandlordDashboard.test.tsx --config vitest.config.test.ts
```

## 8. Running the Complete Test Suite

To execute all frontend tests:

```bash
npx vitest run --config vitest.config.test.ts
```

This command automatically discovers all test files matching:

```text
tests/**/*.test.ts
tests/**/*.test.tsx
```

## 9. Test Result

The complete frontend test suite was successfully executed.

Command:

```bash
npx vitest run --config vitest.config.test.ts
```

Result:

```text
Test Files  7 passed (7)
Tests       9 passed (9)
```

Execution time:

```text
Duration  7.29s
```

### Final Test Summary

| Test File                     | Tests | Result   |
| ----------------------------- | ----: | -------- |
| `Browse.test.tsx`             |     1 | PASS     |
| `LandlordDashboard.test.tsx`  |     1 | PASS     |
| `Login.test.tsx`              |     2 | PASS     |
| `Signup.test.tsx`             |     2 | PASS     |
| `LandlordImport.test.tsx`     |     1 | PASS     |
| `ReactRender.test.tsx`        |     1 | PASS     |
| `LandlordDiagnostic.test.tsx` |     1 | PASS     |
| **Total**                     | **9** | **PASS** |

Final result:

```text
7 Test Files Passed
9 Tests Passed
0 Tests Failed
```

## 10. Mocking External Dependencies

Some frontend components depend on external browser-based libraries or backend APIs.

The tests use mocks to isolate frontend functionality.

### API Requests

The `fetch` API is mocked so that tests do not require the backend server to be running.

Example:

```typescript
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  }),
);
```

This allows controlled test data to be returned from API requests.

### React Router

React Router components are mocked when navigation is not the main focus of the test.

Example:

```typescript
vi.mock('react-router', () => ({
  Link: ({ children, ...props }: any) => (
    <a {...props}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));
```

### React Leaflet

Leaflet map components require browser functionality that is unnecessary for these component tests.

Therefore, map components are mocked:

```typescript
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => ({}),
}));
```

This allows the component to render without requiring an actual interactive map.

## 11. Test Isolation

The tests clean up mocked global objects after execution.

For example:

```typescript
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
```

This prevents one test from affecting another test.

## 12. Testing Approach

The frontend testing approach focuses on user-visible behaviour rather than internal implementation details.

The tests verify important application functions such as:

```text
User Action
     ↓
React Component
     ↓
Mocked API / Dependency
     ↓
Component State Update
     ↓
User-visible Result
```

For example, the Browse test follows this flow:

```text
Load Browse Page
       ↓
Mock API Returns Listings
       ↓
Listings Are Displayed
       ↓
User Enters "Peradeniya"
       ↓
Listing Results Are Filtered
       ↓
Matching Listing Remains Visible
```

## 13. Backend Independence

The frontend tests do not require the actual backend server to be running.

API requests are mocked inside the tests.

This provides:

* Faster test execution
* Repeatable test results
* Isolation from backend availability
* Controlled API responses
* Easier identification of frontend problems

## 14. Source Code Protection

The existing frontend application source code is not modified to make the tests pass.

Testing-specific changes are contained in:

```text
tests/
vitest.config.test.ts
```

The tests use mocks and test data to simulate external services and API responses.

## 15. Production Build Verification

Testing and production build verification are separate processes.

To verify that the frontend can be built successfully:

```bash
npm run build
```

A successful build confirms that the application source can be compiled for production.

The Vitest test suite verifies frontend behaviour separately.

## 16. Complete Testing Commands

For convenience, the complete testing commands are listed below.

### Install dependencies

```bash
cd code/front_end

npm install -D vitest@3 jsdom @testing-library/react
```

### Check dependencies

```bash
npm list vite vitest jsdom @testing-library/react
```

### Run Browse tests

```bash
npx vitest run tests/Browse.test.tsx --config vitest.config.test.ts
```

### Run Login tests

```bash
npx vitest run tests/Login.test.tsx --config vitest.config.test.ts
```

### Run Signup tests

```bash
npx vitest run tests/Signup.test.tsx --config vitest.config.test.ts
```

### Run Landlord Dashboard tests

```bash
npx vitest run tests/LandlordDashboard.test.tsx --config vitest.config.test.ts
```

### Run all frontend tests

```bash
npx vitest run --config vitest.config.test.ts
```

## 17. Final Status

The MyStay frontend testing environment is successfully configured with Vitest, jsdom, and React Testing Library.

The current test suite contains:

```text
7 Test Files
9 Tests
9 Passed
0 Failed
```

The frontend tests successfully cover login, signup, boarding-place browsing and filtering, landlord dashboard functionality, component rendering, and required component imports.
