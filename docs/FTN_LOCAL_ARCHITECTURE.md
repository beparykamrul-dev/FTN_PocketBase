# FTN Local architecture

```text
Browser
  ├─ FTN Local UI
  │   ├─ Dashboard / health chart
  │   ├─ Cyber Security
  │   └─ Notes & File Browser
  ├─ Web Crypto AES-GCM
  └─ Auth token
       │
       ├── PocketBase :8090
       │     └── owner-scoped data + protected files
       └── FastAPI :8000
             └── authenticated AI service
```

The UI is framework-free. The UX extension is additive so the core application remains easy to deploy and inspect.
