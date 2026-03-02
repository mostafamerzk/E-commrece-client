# Angular & E-commerce Standards

## Technical Constraints
- **Change Detection:** Zoneless. Use Angular Signals (`signal()`, `computed()`, `effect()`).
- **Architecture:** Component → FeatureService → ApiService → HttpClient.
- **Constants:** Use `core/constants/api-endpoints.ts` for all URLs. No hardcoding.
- **Storage:** Use the project's `StorageService`; never access `localStorage` directly.
- **Testing:** Use Jasmine + Karma. Mock HTTP calls using `HttpClientTestingModule`.

## UI/UX
- Follow the existing design system in `docs/design` Folder. 
- Ensure all interactive elements have proper ARIA labels for e-commerce accessibility.
