# MyStay Backend Testing

This directory contains the automated backend test suite for the **MyStay Boarding Platform**.

The tests are designed to verify core API functionality, authentication, validation, security-related behavior, error handling, and other important backend operations.

## Testing Frameworks and Tools

The backend testing environment uses:

- **Jest** - JavaScript testing framework
- **Supertest** - HTTP testing library for testing Express API endpoints
- **Jest/Istanbul Coverage** - Used to measure code coverage

## Test Files

### 1. `auth.test.js`

Tests authentication-related functionality, including:

- Invalid login credentials
- Empty login fields
- Missing password
- Signup validation
- Missing required signup fields

### 2. `authMiddleware.test.js`

Tests authentication middleware and protected routes, including:

- Requests without an authentication token
- Requests with an invalid token
- Requests with a valid authentication token

### 3. `basic.test.js`

Contains basic API tests to verify that important endpoints respond correctly.

### 4. `booking.test.js`

Tests booking-related API functionality, including:

- Missing booking information
- Invalid booking requests
- Nonexistent users
- Invalid booking status
- Nonexistent booking requests
- Student booking retrieval
- Landlord booking retrieval

### 5. `message.test.js`

Tests messaging functionality, including:

- Missing message information
- Empty messages
- Whitespace-only messages
- Nonexistent senders
- Reply validation
- Nonexistent messages
- Message thread validation
- Student and landlord message retrieval

### 6. `review.test.js`

Tests review-related functionality, including:

- Missing review information
- Missing comments
- Missing ratings
- Nonexistent users
- Review retrieval

### 7. `security.test.js`

Tests security-related behavior, including:

- SQL injection attempts during login
- Unauthorized access to protected functionality

### 8. `stays.test.js`

Tests boarding/stay listing functionality, including:

- Retrieving all stays
- Retrieving an existing stay
- Handling nonexistent stays
- Unauthorized listing creation
- Unauthorized access to landlord listings
- Required-field validation
- Authenticated listing validation

## Running the Tests

First navigate to the backend directory:

```bash
cd code/backend
```

Then run all automated tests:

```bash
npm test
```

The test command is configured to run Jest sequentially using `--runInBand`.

## Running Tests with Coverage

To run all tests and generate a code coverage report:

```bash
npm test -- --coverage
```

Jest displays coverage information for:

- Statements
- Branches
- Functions
- Lines

A detailed HTML coverage report is also generated in the `coverage` directory.

## Current Test Results

Current automated testing status:

| Test Metric | Result |
|---|---:|
| Test Suites | 8 passed |
| Tests | 40 passed |
| Failed Tests | 0 |
| Statements | 56.12% |
| Branches | 36.64% |
| Functions | 71.42% |
| Lines | 56.03% |

All currently implemented automated tests pass successfully.

> **Note:** Coverage percentages should be updated whenever additional tests are added or existing tests are changed.

## Test Safety

The test suite includes validation and nonexistent-resource tests that avoid unnecessary modification of real application data.

When adding new tests:

- Avoid deleting or modifying important existing database records.
- Use test data or mocked dependencies where appropriate.
- Do not expose database credentials, JWT secrets, or other environment variables.
- Do not commit the `.env` file.
- Ensure existing tests continue to pass after adding new tests.

## Coverage Improvement

Future test development can focus on currently uncovered code paths, including:

- Successful CRUD operations
- Additional authentication branches
- Database error handling
- File and image upload paths
- Additional validation edge cases
- Route-specific error conditions

The objective is to increase coverage while keeping the tests meaningful and maintaining the existing application behavior.

## Test Configuration

The backend test command is configured in `package.json` as:

```json
"test": "jest --runInBand"
```

The Jest setup file is used to clean up the database connection pool after testing so that Jest can exit normally without leaving open asynchronous handles.

## Important Files

```text
backend/
├── tests/
│   ├── README.md
│   ├── auth.test.js
│   ├── authMiddleware.test.js
│   ├── basic.test.js
│   ├── booking.test.js
│   ├── message.test.js
│   ├── review.test.js
│   ├── security.test.js
│   └── stays.test.js
├── jest.setup.js
├── package.json
└── server.js
```

---

**MyStay Boarding Platform - Backend Automated Testing**