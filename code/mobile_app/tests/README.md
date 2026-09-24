# MyStay Mobile App – Testing

## Overview

This section describes the testing setup and procedures used for the MyStay Boarding Platform mobile application.

The mobile application is built using Expo and React Native. Jest is used as the test runner, while React Native Testing Library (RNTL) is used to test React Native components and user interactions.

The tests verify important application functionality including authentication, home screen behaviour, landlord dashboard data loading, listing details, and authentication context operations.

## Testing Technologies

| Technology                   | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| Jest                         | JavaScript testing framework and test runner       |
| Jest Expo                    | Jest preset for Expo applications                  |
| React Native Testing Library | Component and user interaction testing             |
| AsyncStorage Mock            | Testing local authentication data storage          |
| Axios API Mock               | Testing API requests without requiring the backend |

## Testing Location

All mobile application tests are located in:

```text
code/mobile_app/tests/
```

The Jest configuration is located at:

```text
code/mobile_app/jest.config.test.js
```

Current Jest configuration:

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
};
```

## Mobile Dependencies

The mobile application uses Expo and React Native. The following testing dependencies are required:

```bash
cd code/mobile_app

npm install -D jest @testing-library/react-native
```

The project also uses the required React test renderer dependency compatible with the current React version.

After installing the dependencies, the tests can be executed using Jest.

## Test Files

The following test files are currently included:

```text
tests/
├── HomeScreen.test.js
├── LoginScreen.test.js
├── SignupScreen.test.js
├── LandlordDashboardScreen.test.js
├── ListingDetailScreen.test.js
└── AuthContext.test.js
```

## 1. Home Screen Testing

File:

```text
tests/HomeScreen.test.js
```

The Home Screen tests verify the main functionality of the mobile application's home page.

The tests include:

* Rendering the Home Screen.
* Loading boarding listings from the API.
* Displaying available boarding places.
* Handling authentication-related information stored in AsyncStorage.
* Checking the home screen's main user interface elements.

Run the test using:

```bash
npx jest tests/HomeScreen.test.js --config jest.config.test.js --runInBand
```

## 2. Login Screen Testing

File:

```text
tests/LoginScreen.test.js
```

The Login Screen tests verify the user authentication process.

The tests cover:

* Rendering the login form.
* Entering an email address.
* Entering a password.
* Sending login credentials to the backend.
* Handling successful authentication.
* Storing authentication information.
* Navigating to the appropriate dashboard.
* Validating empty login fields.

The API request is mocked so that the test does not require a running backend server.

Run the test using:

```bash
npx jest tests/LoginScreen.test.js --config jest.config.test.js --runInBand
```

## 3. Signup Screen Testing

File:

```text
tests/SignupScreen.test.js
```

The Signup Screen tests verify the new account registration process.

The tests cover:

* Rendering the signup form.
* Entering the user's full name.
* Entering an email address.
* Entering a phone number.
* Entering a password.
* Selecting the landlord role.
* Sending registration information to the backend.
* Handling successful account creation.
* Navigating back to the Login screen after successful registration.

The signup API is mocked during testing.

Run the test using:

```bash
npx jest tests/SignupScreen.test.js --config jest.config.test.js --runInBand
```

## 4. Landlord Dashboard Testing

File:

```text
tests/LandlordDashboardScreen.test.js
```

The Landlord Dashboard tests verify that landlord-specific data is correctly retrieved and displayed.

The test mocks the following API endpoints:

```text
/stays/landlord/my-listings
/bookings/landlord/10
```

The tests verify:

* Loading landlord listings.
* Loading landlord bookings.
* Displaying landlord listing information.
* Displaying booking information.
* Correct API requests being made for the logged-in landlord.

Example mocked listings include:

```text
Campus View Boarding
City Boarding House
```

Run the test using:

```bash
npx jest tests/LandlordDashboardScreen.test.js --config jest.config.test.js --runInBand
```

## 5. Listing Detail Screen Testing

File:

```text
tests/ListingDetailScreen.test.js
```

The Listing Detail Screen tests verify that information for a selected boarding listing is retrieved and displayed.

The tests cover:

* Loading a listing using its ID.
* Sending the correct API request.
* Displaying listing information.
* Handling an API failure.
* Displaying the not-found state when the requested listing cannot be retrieved.

Example API requests tested:

```text
/stays/5
/stays/999
```

Run the test using:

```bash
npx jest tests/ListingDetailScreen.test.js --config jest.config.test.js --runInBand
```

## 6. Authentication Context Testing

File:

```text
tests/AuthContext.test.js
```

The AuthContext tests verify authentication state management and local storage behaviour.

The tests cover:

* Loading an existing authentication token from AsyncStorage.
* Setting the authentication state when a saved token exists.
* Completing the initial loading process.
* Logging in a user.
* Saving the authentication token.
* Logging out a user.
* Removing the authentication token from AsyncStorage.

The AsyncStorage methods are mocked during testing.

Run the test using:

```bash
npx jest tests/AuthContext.test.js --config jest.config.test.js --runInBand
```

## Running All Mobile Tests

All mobile tests can be executed together using:

```bash
npx jest --config jest.config.test.js --runInBand
```

The current test suite contains:

```text
6 test suites
12 tests
```

The complete test command should finish with a result similar to:

```text
Test Suites: 6 passed, 6 total
Tests:       12 passed, 12 total
Snapshots:   0 total
```

## Test Execution Summary

| Test Suite              | Tests | Purpose                               |
| ----------------------- | ----: | ------------------------------------- |
| HomeScreen              |     2 | Home page and boarding listings       |
| LoginScreen             |     2 | User login and validation             |
| SignupScreen            |     2 | User registration                     |
| LandlordDashboardScreen |     1 | Landlord listings and bookings        |
| ListingDetailScreen     |     2 | Listing details and error handling    |
| AuthContext             |     2 | Authentication state and AsyncStorage |
| Total                   |    12 | Mobile application functionality      |

## API Mocking

The mobile tests do not depend on a live backend server.

API calls are mocked using Jest. For example:

```js
jest.mock('../src/services/api', () => ({
  get: jest.fn(),
}));
```

A mocked API response can then be provided:

```js
api.get.mockResolvedValue({
  data: {
    id: 5,
    title: 'Campus View',
  },
});
```

This allows the tests to verify frontend behaviour independently of backend availability.

## AsyncStorage Mocking

AsyncStorage is mocked because authentication information is stored locally on the device.

The following methods are mocked:

```js
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
```

This allows the tests to verify operations such as:

```text
Loading a saved token
Saving a token after login
Removing a token after logout
```

without accessing the actual device storage.

## Asynchronous Testing

Several MyStay screens use asynchronous API requests and React state updates.

Therefore, the tests use `async`, `await`, and `waitFor()`.

For the current React/RNTL setup, rendered components are awaited:

```js
const utils = await render(
  <Screen />
);
```

Asynchronous UI changes are then checked using:

```js
await waitFor(() => {
  expect(
    utils.getByText('Expected Text')
  ).toBeTruthy();
});
```

This ensures that the test waits for API responses and state updates before checking the UI.

## Test Isolation

Each test clears previous Jest mock calls before execution:

```js
beforeEach(() => {
  jest.clearAllMocks();
});
```

This prevents API calls or AsyncStorage calls from one test affecting another test.

## Running an Individual Test

To run only one test file:

```bash
npx jest tests/LoginScreen.test.js --config jest.config.test.js --runInBand
```

Replace `LoginScreen.test.js` with the required test file.

For example:

```bash
npx jest tests/AuthContext.test.js --config jest.config.test.js --runInBand
```

## Running the Complete Test Suite

From the mobile application directory:

```bash
cd code/mobile_app
```

Then run:

```bash
npx jest --config jest.config.test.js --runInBand
```

## Test Result

The complete mobile test suite currently passes successfully:

```text
PASS tests/HomeScreen.test.js
PASS tests/LandlordDashboardScreen.test.js
PASS tests/ListingDetailScreen.test.js
PASS tests/LoginScreen.test.js
PASS tests/SignupScreen.test.js
PASS tests/AuthContext.test.js

Test Suites: 6 passed, 6 total
Tests:       12 passed, 12 total
```

Therefore, all 12 implemented mobile application tests are currently passing.

## Warnings During Testing

Some tests may display React Native warnings such as:

```text
SafeAreaView has been deprecated and will be removed in a future release.
```

This warning originates from the existing React Native application code and does not cause the tests to fail.

Some asynchronous tests may also display:

```text
The current testing environment is not configured to support act(...)
```

These messages are warnings from the current React/Jest testing environment. They do not prevent the current test suite from passing.

The application source code does not need to be modified solely to make these tests pass.

## Recommended Testing Workflow

Before committing changes to the mobile application, run:

```bash
cd code/mobile_app
```

Install dependencies if necessary:

```bash
npm install
```

Run the complete test suite:

```bash
npx jest --config jest.config.test.js --runInBand
```

If a test fails, run that individual test to obtain a shorter error output:

```bash
npx jest tests/<TestFile>.test.js --config jest.config.test.js --runInBand
```

After fixing the problem, run the complete test suite again.

## Conclusion

The MyStay mobile application uses Jest and React Native Testing Library to verify important frontend functionality. The current tests cover authentication, registration, home page listings, landlord dashboard data, listing details, and authentication state management.

API requests and device storage are mocked to make the tests independent of the backend server and physical device storage. The complete mobile test suite currently contains 12 tests across 6 test suites, and all tests are passing successfully.

