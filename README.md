# FLUXO ARCHITECTURE - https://fluxo-lilac.vercel.app/
#
#  👤 USER
#   │
#   ├──→ 📷 IMAGE SEARCH ──┐
#   ├──→ 🎤 VOICE SEARCH ──┼──→ 🔷 DJANGO API (JWT) ──┬──→ 🟢 CLIP+FAISS (Image)
#   ├──→ ⌨️ TEXT SEARCH ───┤                          ├──→ 🔵 REDIS (Autocomplete)
#   └──→ 🤖 AI ASSISTANT ──┘                          └──→ 🟡 GROQ LLM (Chat)
#                                    │
#                                    ▼
#                    ┌───────────────────────────────┐
#                    │    🔴 RECOMMENDATION ENGINE   │
#                    │  FAISS + CLIP Embeddings      │
#                    │  View│Wish│Cart│Buy│Embeddings│
#                    │  MySQL ←→ Django ORM          │
#                    └───────────────┬───────────────┘
#                                    │
#                                    ▼
#                    ┌───────────────────────────────┐
#                    │    🟣 PERSONALIZED CLOTHES    │
#                    │  💳 Cashfree  🖼️ Cloudinary   │
#                    └───────────────────────────────┘
#
# STACK: React + Tailwind | Django + DRF + JWT | MySQL | FAISS-CPU + Torch 2.9
