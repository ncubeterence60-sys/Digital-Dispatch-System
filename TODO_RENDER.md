# Render Deployment TODO

## Plan Steps:
- [x] 1. Create package.json.backup
- [x] 2. Rewrite package.json (remove Electron, add Render scripts/postinstall for better-sqlite3)
- [x] 3. Run `npm install` to verify
- [x] 4. Test locally: `npm run dev`
- [ ] 5. Deploy to Render
- [ ] 6. Verify build: check better-sqlite3 Linux compile
- [ ] 7. Test endpoints, Socket.io, DB on Render URL
