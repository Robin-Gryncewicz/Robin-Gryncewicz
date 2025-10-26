# Claude AI Instructions for Robin-Gryncewicz Repository

## Project Overview
This repository contains a TypeScript application with authentication and payment processing functionalities. The main components are structured in the `src/` directory, with authentication logic in `src/auth/` and payment processing in `src/payments/`.

## Code Style Guidelines

### TypeScript
- Use TypeScript's strict mode and type everything properly
- Prefer interfaces over types for object definitions
- Use async/await for asynchronous operations
- Follow the functional programming paradigm where appropriate

### Naming Conventions
- Use PascalCase for class names and interfaces (e.g., `OrderService`, `UserSession`)
- Use camelCase for variables, functions, and method names (e.g., `createOrder`, `validateSession`)
- Use UPPER_SNAKE_CASE for constants (e.g., `MAX_SESSION_DURATION`)
- Prefix private properties with an underscore (e.g., `_paymentGateway`)

### Architecture Patterns
- Follow the Service-Repository pattern
- Keep business logic separate from data access
- Use dependency injection for service dependencies
- Write modular, testable code with single responsibility principle

## File Structure Conventions
When suggesting new files, follow these conventions:
- Place authentication-related code in `src/auth/`
- Place payment-related code in `src/payments/`
- Place shared utilities in `src/common/`
- Place types and interfaces in `src/types/` or in respective domain folders
- Place tests in a `__tests__` folder adjacent to the files they test

## Documentation
- Add JSDoc comments to all classes, interfaces, and public methods
- Document parameters and return types
- Include examples for complex functions
- Add TODO comments for incomplete implementations

## Error Handling
- Use custom error classes extending from Error
- Provide meaningful error messages
- Handle errors at appropriate levels
- Use try/catch blocks for async operations

## Example Code Patterns

### Service Class Template
```typescript
/**
 * Service for handling [domain] operations
 */
export class SomeService {
  private _dependency: SomeDependency;
  
  constructor(dependency: SomeDependency) {
    this._dependency = dependency;
  }
  
  /**
   * Description of what the method does
   * @param param1 Description of parameter
   * @returns Description of return value
   */
  public async someMethod(param1: string): Promise<SomeResult> {
    try {
      // Implementation
      return result;
    } catch (error) {
      console.error('Error in someMethod:', error);
      throw new CustomError('Failed to perform operation', { cause: error });
    }
  }
}
```

### Error Handling Pattern
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  } else {
    // Handle general error
    throw new CustomError('Operation failed', { cause: error });
  }
}
```

## Testing Approach
When writing tests:
- Use Jest for unit testing
- Mock external dependencies
- Test edge cases and error scenarios
- Follow AAA pattern (Arrange-Act-Assert)

## Existing Components

### OrderService (src/payments/OrderService.ts)
This service handles payment order processing with methods for creating and retrieving orders.

### SessionManager (src/auth/sessionManager.ts)
This component manages user authentication sessions with functionality for creation, validation, and expiration of sessions.
