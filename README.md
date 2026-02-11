<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>FLUXO - AI Powered E-Commerce Platform</title>
</head>
<body>

<h1>FLUXO - AI Powered E-Commerce Platform</h1>

<p><strong>Live URL:</strong> https://fluxo-lilac.vercel.app/</p>

<hr>

<h2>Overview</h2>
<p>
Fluxo is an AI-driven fashion e-commerce platform integrating image search, voice search,
smart text search, AI assistant, and a personalized recommendation engine.
It demonstrates full-stack development with machine learning integration in production.
</p>

<hr>

<h2>System Architecture</h2>

<pre>
USER
 │
 ├── Image Search
 ├── Voice Search
 ├── Text Search
 └── AI Assistant
        │
        ▼
    Django REST API (JWT Authentication)
        │
   ┌────┼───────────┐
   ▼    ▼           ▼
CLIP+FAISS      Redis      GROQ LLM
(Image Search) (Autocomplete) (Chat Assistant)
        │
        ▼
Recommendation Engine
(View | Wishlist | Cart | Purchase | Embeddings)
        │
        ▼
Payment + Media + Personalization
</pre>

<hr>

<h2>Tech Stack</h2>

<h3>Frontend</h3>
<ul>
    <li>React</li>
    <li>Tailwind CSS</li>
    <li>Axios</li>
    <li>JWT Decode</li>
</ul>

<h3>Backend</h3>
<ul>
    <li>Django</li>
    <li>Django REST Framework</li>
    <li>JWT Authentication</li>
    <li>MySQL</li>
    <li>Redis</li>
</ul>

<h3>AI & ML</h3>
<ul>
    <li>CLIP (Image Embeddings)</li>
    <li>FAISS (Similarity Search)</li>
    <li>Torch 2.9 (CPU)</li>
    <li>GROQ LLM API</li>
</ul>

<h3>Infrastructure</h3>
<ul>
    <li>Vercel (Frontend Hosting)</li>
    <li>Render (Backend Hosting)</li>
    <li>Cloudinary (Image CDN)</li>
    <li>Cashfree (Payment Gateway)</li>
</ul>

<hr>

<h2>Core Features</h2>

<h3>1. Image Search</h3>
<p>
Product images are converted into embeddings using CLIP.
Embeddings are stored in FAISS index.
User uploads an image, and similarity search returns matching products.
</p>

<h3>2. Voice Search</h3>
<p>
Voice input is converted to text using browser speech recognition API
and processed through the text search pipeline.
</p>

<h3>3. Smart Autocomplete</h3>
<p>
Frequently searched keywords are cached in Redis to reduce database load
and improve response speed.
</p>

<h3>4. AI Assistant</h3>
<p>
Conversational AI powered by GROQ LLM helps users find products,
get recommendations, and answer shopping queries.
</p>

<h3>5. Recommendation Engine</h3>
<p>
Hybrid logic based on:
</p>
<ul>
    <li>View history</li>
    <li>Wishlist activity</li>
    <li>Cart behavior</li>
    <li>Purchase history</li>
    <li>Embedding similarity</li>
</ul>

<hr>

<h2>Authentication</h2>
<p>
JWT-based stateless authentication system securing user-specific routes
such as cart, wishlist, orders, and profile.
</p>

<hr>

<h2>Environment Variables</h2>

<h3>Backend (.env)</h3>
<pre>
SECRET_KEY=
DEBUG=
DB_NAME=
DB_USER=
DB_PASSWORD=
REDIS_URL=
GROQ_API_KEY=
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CLOUDINARY_URL=
</pre>

<h3>Frontend (.env)</h3>
<pre>
VITE_API_URL=
</pre>

<hr>

<h2>Local Setup</h2>

<h3>Backend</h3>
<pre>
git clone <repository_url>
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
</pre>

<h3>Frontend</h3>
<pre>
cd frontend
npm install
npm run dev
</pre>

<hr>

<h2>Current Limitations</h2>
<ul>
    <li>FAISS running on CPU</li>
    <li>No asynchronous task queue (Celery not implemented)</li>
    <li>Recommendation system is hybrid rule-based</li>
    <li>No horizontal scaling configuration</li>
</ul>

<hr>

<h2>Future Improvements</h2>
<ul>
    <li>GPU-based FAISS indexing</li>
    <li>Deep learning collaborative filtering</li>
    <li>Async background processing</li>
    <li>Elasticsearch integration</li>
    <li>CI/CD pipeline</li>
</ul>

<hr>

<h2>Project Objective</h2>
<p>
Fluxo demonstrates advanced full-stack engineering, AI integration,
vector search implementation, payment integration, and scalable system design.
</p>

</body>
</html>

