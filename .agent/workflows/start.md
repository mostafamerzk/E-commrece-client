# Workflow: Start Session
# Trigger: /start

1. **Sync Check:** Ask the user: "Have you pulled the latest changes? (y/n)".
   - If 'n': Instruct the user to run `git pull --rebase origin master`.
   - If 'y': Proceed to the next step.
2. **Context Retrieval:** Read `docs/memory.md` to identify the current active Task ID.
3. **Consistency Check:** Briefly check if the local branch matches the "Current Focus" in the memory file.
4. **Output:** "Environment synced. Reviewing memory.md... I am ready to work on [Task ID]. What's our first move?"
